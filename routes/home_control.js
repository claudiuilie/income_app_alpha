const express = require('express');
const request = require('request');
const options = require('../assets/config/config');
const ewelink = require('ewelink-api');
const mysqlController = require('../assets/js/mysqlController');
const DateAndTime = require('../assets/entity/date');
const Chart = require('../assets/entity/tempHistoryChart');
const config = new options();
const mysql = new mysqlController(config.mysql);


let router = express.Router();
let arduinoSensors, weatherData, sensorsData;

router.get('/', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {

        request(config.arduino.host, (error, response, body) => {
            if (error) {
                return next(error);
            }

            responseBody = JSON.parse(body);
            greenHouseStats = responseBody.variables;
	    let date = new DateAndTime();


            mysql.select('greenhouse_monitor', { "date": date.getCurrentDate() }, (error, results) => {
                if (error) {
                    return next(error);
                }

                let chart = new Chart(results, date.revertCurrentDate());
                let fullHistory = results;


                for (let k in fullHistory) {
                    if (fullHistory[k].modified) {
                        fullHistory[k].modified = new Date(fullHistory[k].modified).getHours();
                    }

                }


                console.log(greenHouseStats)

                mysql.select('greenhouse_schedule', { "active": 1 }, (error, results) => {
                    if (error) {
                        return next(error);
                    }
                    console.log(results);
                    let scheduleData = results[0];

                    res.render('home_control', {
                        sensors: greenHouseStats,
                        tempHistory: chart,
                        schedule: scheduleData,
                        history: fullHistory
                    });
                })
            });
        });
    }
});

router.post('/', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let url;

        if (req.body.status == 'true' && !req.body.switch)
            url = `${config.arduino.host}/digital/${req.body.relayId}/0`;
        else
            url = `${config.arduino.host}/digital/${req.body.relayId}/1`;

        request(url, (error, response) => {
            if (error) {
                return next(error);
            }

            res.send(response);
        });

    }
});


router.post('/history', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        if (req.body) {
            let sensorsHistory, weatherHistory;
	    let date = new DateAndTime();
            mysql.select('greenhouse_monitor', { "date": req.body.date }, (error, results) => {
                if (error) {
                    return next(error);
                }
                console.log(results);
                if (results.length > 0) {

                    let chart = new Chart(results, date.revertCurrentDate());
                    res.send({ "found": true, "calendar": req.body.calendarId, "history": chart });
                } else {
                    res.send({ "found": false, "calendar": req.body.calendarId, "message": `No data for ${req.body.date}.` });
                }
            });
        } else {
            res.send({ "found": false, "calendar": req.body.calendarId, "message": `Invalid filters.` });
        }
    }
});

router.post('/schedule', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else { 

        let payload = {
            lamp_start: req.body.lamp_start,
            lamp_stop: req.body.lamp_stop
        }

        
        mysql.update('greenhouse_schedule',payload,{"id": req.body.id},(error,results) => {
            if(error) {
                return next(error);
            } else {
                if (results.affectedRows > 0 ) {
                    res.redirect('/control');
                }
            }
        });
    }
});

router.post('/phase', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        console.log(req.body)

        let mysql = new mysqlController(config.mysql);

        let query = `UPDATE greenhouse_schedule set active = 1 where id = ${req.body.phase_id};`
                    console.log(query)
        mysql.query(query, (error, results) => {
            if (error) {
                return next(error);
            } else {
                if (results.affectedRows > 0) {
                    let query2 = `UPDATE greenhouse_schedule set active = 0 where id <> ${req.body.phase_id};`
                    mysql.query(query2, (error, results) => {
                        if (error) {
                            return next(error);
                        } else {
                            if (results.affectedRows > 0) {
                                res.redirect('/control')
                            }
                        }
                    });
                }
            }
        });       
    }


});

module.exports = router;

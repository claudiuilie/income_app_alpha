const express = require('express');
const request = require('request');
const options = require('../assets/config/config');
const ewelink = require('ewelink-api');
const mysqlController = require('../assets/js/mysqlController');
const DateAndTime = require('../assets/entity/date');
const Chart = require('../assets/entity/tempHistoryChart');
const config = new options();
const mysql = new mysqlController(config.mysql);
const date = new DateAndTime();

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

            mysql.select('greenhouse_monitor', { "date": date.getCurrentDate() }, (error, results) => {
                if (error) {
                    return next(error);
                }
                
                let chart = new Chart(results, date.revertCurrentDate())
                console.log(greenHouseStats)
                res.render('home_control', {
                    sensors: greenHouseStats,
                    tempHistory: chart
                });
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

module.exports = router;

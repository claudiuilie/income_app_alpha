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

router.get('/',(req,res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {

        request(`${config.arduino.host}/sensors`,  (error, response, body) => {
            if(error) {
                return next(error);
            }
            arduinoSensors = JSON.parse(body);

            mysql.select(config.mysqlTables.tempMonitor,{"date":date.getCurrentDate()}, (error, results) => {
                if(error) {
                    return next(error);
                }
		console.log(results);
                for (let k in results) {
                    if(results[k].type == "sensors"){
                        sensorsData = results[k];
                        sensorsData.json_data = JSON.parse(sensorsData.json_data)
                    }

                    if(results[k].type == "weather") {
                        weatherData = results[k];
                        weatherData.json_data = JSON.parse(weatherData.json_data)
                    }

                }

                let chart = new Chart(sensorsData.json_data,weatherData.json_data,date.revertCurrentDate())

                res.render('home_control',{
                    sensors: JSON.parse(arduinoSensors.sensors),
                    tempHistory: chart
                });
            });
        });
// mock
        // mysql.select('temperature_monitor',{"date":date.getCurrentDate()}, (error, results) => {
        //             if(error) {
        //                 return next(error);
        //             }
    
        //             for (let k in results) {
        //                 if(results[k].type == "sensors"){
        //                     sensorsData = results[k];
        //                     sensorsData.json_data = JSON.parse(sensorsData.json_data)
        //                 }
    
        //                 if(results[k].type == "weather") {
        //                     weatherData = results[k];
        //                     weatherData.json_data = JSON.parse(weatherData.json_data)
        //                 }
        //             }
    
        //             let chart = new Chart(sensorsData.json_data,weatherData.json_data,date.revertCurrentDate())
                    
        //             res.render('home_control',{
        //                 sensors: [{"temp":22,"humidity":81,"icon":"fas fa-bed"},{"temp":22,"humidity":84,"icon":"fas fa-couch"},{"temp":22,"humidity":81,"icon":"fas fa-utensils"},{"timestamp":"4:24:22 PM"}],"hours_16":[{"temp":22,"humidity":81,"icon":"fas fa-bed"},{"temp":22,"humidity":84,"icon":"fas fa-couch"},{"temp":22,"humidity":81,"icon":"fas fa-utensils"},{"timestamp":"4:24:22 PM"}],
        //                 tempHistory: chart
        //             });
        //     });
    }
});

router.post('/', (req,res,next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let url;
        let sonoffStatus;

        if (req.body.switch) {

            if (req.body.status == 'true') {
                sonoffStatus = 'on';
                url = `${config.arduino.host}/sonoff?status=1`;
            } else {
                sonoffStatus= 'off';
                url = `${config.arduino.host}/sonoff?status=0`;
            }
            (async () => {

                const connection = new ewelink(config.eWelink);
                try{

                    /* get all devices */
                    // const devices = await connection.getDevices();
                    // console.log(devices);

                    /* get specific devi info */
                    // const device = await connection.getDevice('100062aeb3');
                    // console.log(device);

                    //status
                    // const statuss = await connection.getDevicePowerState(req.body.relayId);
                    // console.log(statuss);
                    // res.send(statuss);

                    // change status
                    const status = await connection.setDevicePowerState(req.body.relayId, sonoffStatus);
                    res.send(status);
                }
                catch(err){
                    next(err);
                }
            })();

            request(url,  (error) => {
                if(error) {
                    return next(error);
                }
            });

        } else {

            if (req.body.status == 'true' && !req.body.switch)
                url = `${config.arduino.host}/digital/${req.body.relayId}/0`;
            else 
                url = `${config.arduino.host}/digital/${req.body.relayId}/1`;

            request(url,  (error, response) => {
                if(error) {
                    return next(error);
                }

                res.send(response);
            });
        }

    }
});


router.post('/history', (req, res, next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        if (req.body) {
            let sensorsHistory, weatherHistory;

            mysql.select('temperature_monitor', { "date": req.body.date }, (error, results) => {
                if (error) {
                    return next(error);
                }

                if (results.length > 0) {
                    for (let k in results) {
                        if (results[k].type == "sensors") {
                            sensorsHistory = results[k];
                            sensorsHistory.json_data = JSON.parse(sensorsHistory.json_data)
                        }

                        if (results[k].type == "weather") {
                            weatherHistory = results[k];
                            weatherHistory.json_data = JSON.parse(weatherHistory.json_data)
                        }

                    }

                    let chart = new Chart(sensorsHistory.json_data, weatherHistory.json_data)
                    res.send({"found": true, "calendar": req.body.calendarId ,"history": chart });
                } else {
                    res.send({"found": false,"calendar": req.body.calendarId,"message":`No data for ${req.body.date}.`});
                }
            });
        } else {
            res.send({"found": false,"calendar": req.body.calendarId,"message":`Invalid filters.`});
        }
    }
});

module.exports = router;

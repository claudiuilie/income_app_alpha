const cron = require('node-cron');
const request = require('request');
const options = require('../config/config');
const mysqlController = require('../../assets/js/mysqlController');
const config = new options();
const DateAndTime = require('../entity/date');
const mysql = new mysqlController(config.mysql);
let currentDate;


class greenhouseSchedulerCron {
    constructor() {
        // 
        cron.schedule('00 5,10,15,20,25,30,35,40,45,50,55 0-23 * * *', () => {

            console.log("cron scheduler");

            request(config.arduino.host, (error, response, body) => {

                if (error) {
                    console.log(error)
                }else{
                    let responseBody = JSON.parse(body);
                    let sensors = responseBody.variables;

                    // if(sensors.fan_off){
                    //     startFan()
                    // }
                    validateLampPhase();
                    console.log(sensors);
                }
            })
        });

        function validateLampPhase(){
            
            mysql.select('greenhouse_schedule', { "active": 1 }, async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(results);
    
                    let resultBody = results[0];
    
                    if (resultBody.veg_phase) {
                        let activeHours = await checkHours(resultBody.lamp_start, resultBody.lamp_stop);
                        startLamp("vegPhase", activeHours);
                        console.log(activeHours);
                    } else if (resultBody.fruit_phase) {
                        let activeHours = await checkHours(resultBody.lamp_start, resultBody.lamp_stop);
                        startLamp("fruitPhase", activeHours);
                        console.log(activeHours);
                    }
                }
            });

            function checkHours(startHour, stopHour) {
                let date = new DateAndTime();
                let hours = date.getHours();
    
                if (hours < startHour || hours >= stopHour) {
                    return false;
                } else if (hours == stopHour) {
                    return false
                } else if (hours >= startHour && hours < stopHour) {
                    return true;
                }
            }
    
            function startLamp(type, active) {
    
                if (active) {
                    request(`${config.arduino.host}/${type}?params=1`, (error, response, body) => {
    
                        if (error) {
                            console.log(error)
                        }
    
                        console.log(body);
                    })
                } else {
                    stopLamp();
                }
            }
    
            function stopLamp() {
                request(`${config.arduino.host}/vegPhase?params=1`, (error, response, body) => {
    
                    if (error) {
                        console.log(error)
                    }
    
                    console.log(body);
                });

            }
        }

        function startFan() {
            request(`${config.arduino.host}/fan?params=1`, (error, response, body) => {

                if (error) {
                    console.log(error)
                }

                console.log(body);
            })
        }
    }
}

module.exports = greenhouseSchedulerCron;
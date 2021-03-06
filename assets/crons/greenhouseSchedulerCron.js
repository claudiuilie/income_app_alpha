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
        // '00 0,10,15,20,25,30,35,40,45,50,55 0-23 * * *'
        cron.schedule('00 0-59 0-23 * * *', () => {

            console.log("cron scheduler");
            request(config.arduino.host, (error, response, body) => {

                if (error) {
                    console.log(error)
                } else {
                    let responseBody = JSON.parse(body);
                    let sensors = responseBody.variables;

                    if (sensors.fan_in <= 1) {
                        startInFan(128)
                    }

                    mysql.select('greenhouse_schedule', { "active": 1 }, async (error, results) => {
                        if (error) {
                            console.log(error);
                        } else {
                            let resultBody = results[0];

                            if (sensors.temperature > resultBody.max_temp -1  || sensors.humidity >= resultBody.max_humidity) {
                                if (sensors.fan_out <= 230) {
                                    //startInFan(sensors.fan_in + 25)
                                    console.log("Fan out +25 ")
                                    startOutFan(sensors.fan_out + 25)
                                } else if (sensors.fan_out > 230 && sensors.fan_out < 255) {
                                   // startInFan(255)
                                   console.log("Fan out max ")
                                    startOutFan(255)
                                }

                                if(sensors.fan_out == 255 && sensors.temperature >= resultBody.max_temp -2 ){
                                    sensors.fan_in > 230 ? startInFan(255) : startInFan(sensors.fan_in + 25);
                                }
                                
                            } else if (sensors.temperature <= resultBody.max_temp && sensors.temperature > resultBody.min_temp && sensors.humidity < resultBody.max_humidity) {
                               // startInFan(153)
                               console.log("Fan out 153 ")
                                startOutFan(153)
                            } else {
                               // startInFan(77)
                               console.log("Fan out 77 ")
                                startOutFan(77)
                            }

                        } 
                    });


                    validateLampPhase();
                }
            })
        });

        function validateLampPhase() {

            mysql.select('greenhouse_schedule', { "active": 1 }, async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
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
                console.log(active)
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
                request(`${config.arduino.host}/vegPhase?params=0`, (error, response, body) => {

                    if (error) {
                        console.log(error)
                    }

                    console.log(body);
                });

            }
        }

        function startInFan(value) {
            console.log("Fan in set to: " +value);

            request(`${config.arduino.host}/fanIn?params=${value}`, (error, response, body) => {

                if (error) {
                    console.log(error)
                }

                console.log(body);
            })
        }

        function startOutFan(value) {
            console.log("Fan out set to: " +value);

            request(`${config.arduino.host}/fanOut?params=${value}`, (error, response, body) => {

                if (error) {
                    console.log(error)
                }

                console.log(body);
            })
        }
    }
}

module.exports = greenhouseSchedulerCron;

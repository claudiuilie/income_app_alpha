const cron = require('node-cron');
const request = require('request');
const options = require('../config/config');
const mysqlController = require('../../assets/js/mysqlController');
const config = new options();
const DateAndTime = require('../entity/date');
const mysql = new mysqlController(config.mysql);
let paramsIndex, currentDate;


class greenhouseCron {
    constructor() {

        cron.schedule('00 00 0-23 * * *', () => {
            let Date = new DateAndTime();
            currentDate = Date.getCurrentDate();
            paramsIndex = `hours_${Date.getHours()}`;
            
            console.log("cron greenhouse");

            // //arduino request
            request(config.arduino.host, (error, response, body) => {
                
                if (error) {
                    console.log(error)
                }

                let responseBody = JSON.parse(body);
                let insertValues = {
                    temperature : responseBody.variables.temperature,
                    humidity : responseBody.variables.humidity,
                    soil_moisture : responseBody.variables.soil_moisture,
                    pomp_off : responseBody.variables.pomp_off,
                    fan_off : responseBody.variables.fan_off,
                    veg_lamp_off : responseBody.variables.veg_lamp_off,
                    fruit_lamp_off : responseBody.variables.fruit_lamp_off
                }

                console.log(insertValues);

                mysql.insert('greenhouse_monitor',insertValues,(error,results) => {
                    if(error) {
                        console.log(error);
                    } else {
                        if (results.affectedRows > 0 ) {
                           console.log(results.affectedRows);
                        }
                    }
                });
                
            });

            // weather api request
        });
    }
}


module.exports = greenhouseCron;
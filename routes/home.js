const express = require('express');
const request = require('request');
const options = require('../assets/config/config');
const ewelink = require('ewelink-api');


let config = new options();
let router = express.Router();
let url;

router.get('/',(req,res,next) => {
    if (!req.session.loggedin) res.redirect('/auth');

    else {

        // (async () => {

        //     const connection = new ewelink(config.eWelink);
        //     try{
        //         let switchState = {};
        //         /* get all devices */
        //         const devices = await connection.getDevices();

        //         if (devices[0].params.switch == 'on')
        //             url = `${config.arduino.host}/sonoff?status=1`;

        //         else if (devices[0].params.switch == 'off')
        //             url = `${config.arduino.host}/sonoff?status=0`;


        //         request(url,  (error) => {
        //             if(error) {
        //                 return next(error);
        //             }
        //         });
        //         /* get specific devi info */
        //         // const device = await connection.getDevice('100062aeb3');
        //         // console.log(device);

        //         //status
        //         // const statuss = await connection.getDevicePowerState('100062aeb3');
        //         // console.log(statuss);

        //         // request(url,  (error, response) => {
        //         //     if (error) {
        //         //         return next(error);
        //         //     }
        //         // });
        //     }
        //     catch(err){
        //         next(err);
        //     }
        // })();
        res.render('home');
    }
});

module.exports = router;



const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
const shell = require('shelljs');

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {

        let mysql = new mysqlController(config.mysql);

        mysql.select('my_plate_articles', { 1: 1 }, (error, results) => {
            if (error) {
                return next(error);
            } else {
                let items = {
                    proteine: [],
                    legume: [],
                    carbohidrati: [],
                    grasimi: []
                };

                for (let k in results) {
                    switch (results[k].category) {
                        case "Proteine":
                            items.proteine.push(results[k])
                            break;
                        case "Legume":
                            items.legume.push(results[k])
                            break;
                        case "Carbohidrati":
                            items.carbohidrati.push(results[k])
                            break;
                        case "Grasimi":
                            items.grasimi.push(results[k])
                            break;
                    }
                }

                res.render('plate_list', { item: items });
            }
        });
    }
});


router.post('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {

            console.log(req.body);
            let color = req.body.favcolor.replace("#",'');
            let payload = `gatttool -b FF:FF:AB:00:7D:B6  --char-write-req -a 0x0007 -n '56${color}00f0aa'`;
           shell.exec(payload);
            console.log(payload);
                res.render('plate_list');
    }

});

module.exports = router;
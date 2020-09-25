const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {

        let mysql = new mysqlController(config.mysql);

        mysql.select('my_plate', { 1: 1 }, (error, results) => {
            console.log(results);
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

            res.render('vacations', { item: items });
        });
    }
});

module.exports = router;
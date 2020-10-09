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
        let item;
        mysql.select('my_plate_articles', req.query, (error, results) => {
            if (error) {
                return next(error);
            } else {
                item = results[0];
                console.log(item);

                res.render('plate_item', { article: item });
            }
        });
    }
});

module.exports = router;
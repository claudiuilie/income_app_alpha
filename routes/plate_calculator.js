const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
const Date = require('../assets/entity/date');

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let currentDate = new Date();
        let mysql = new mysqlController(config.mysql);
        mysql.select('my_plate_daily_calculator', { user: req.session.username, date: currentDate.getCurrentDate() }, (error, results) => {
            if (error) {
                return next(error);
            } else {
                let currentResults = {};
                let total = {
                    protein: 0,
                    kcal: 0,
                    carbs: 0,
                    fiber: 0,
                    fat: 0,
                    qty: 0
                }

                if (results.length > 0) {
                    //currentResults['id'] = results[0].id;
                    currentResults['breakfast'] = JSON.parse(results[0].breakfast);
                    currentResults['first_snack'] = JSON.parse(results[0].snack_1);
                    currentResults['lunch'] = JSON.parse(results[0].lunch);
                    currentResults['second_snack'] = JSON.parse(results[0].snack_2);
                    currentResults['dinner'] = JSON.parse(results[0].dinner);
                    currentResults['extra'] = JSON.parse(results[0].extra);
                    //currentResults['date'] = results[0].date;



                    for (let k in currentResults) {
                        if (currentResults[k] != null) {
                            for (let z in currentResults[k]) {

                                total.protein += parseFloat(currentResults[k][z].protein)
                                total.kcal += parseFloat(currentResults[k][z].kcal)
                                total.carbs += parseFloat(currentResults[k][z].carbs)
                                total.fiber += parseFloat(currentResults[k][z].fiber)
                                total.fat += parseFloat(currentResults[k][z].fat)
                                total.qty += parseFloat(currentResults[k][z].qty)
                 
                            }
                        }

                    }

                    for (let z in total) {
                        total[z] = (total[z]).toFixed(2)
                    }

                } else {
                    currentResults = [{}];
                }

                res.render('plate_calculator', { article: currentResults, totalArticles: total });
            }
        });
    }
});

module.exports = router;
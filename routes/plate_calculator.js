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
                let mealTotals = {
                    breakfast: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    },
                    first_snack: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    },
                    lunch: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    },
                    second_snack: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    },
                    dinner: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    },
                    extra: {
                        protein: 0,
                        kcal: 0,
                        fiber: 0,
                        fat: 0,
                        carbs:0
                    }                     
                };
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
                    // console.log(currentResults)
                    for (let k in currentResults) {
                        if (currentResults[k] != null) {
                            for (let z in currentResults[k]) {
                                total.protein += parseFloat(currentResults[k][z].protein);
                                mealTotals[k].protein += parseFloat(currentResults[k][z].protein);
                                total.kcal += parseFloat(currentResults[k][z].kcal);
                                mealTotals[k].kcal += parseFloat(currentResults[k][z].kcal);
                                total.carbs += parseFloat(currentResults[k][z].carbs);
                                mealTotals[k].carbs += parseFloat(currentResults[k][z].carbs);
                                total.fiber += parseFloat(currentResults[k][z].fiber);
                                mealTotals[k].fiber += parseFloat(currentResults[k][z].fiber);
                                total.fat += parseFloat(currentResults[k][z].fat);
                                mealTotals[k].fat += parseFloat(currentResults[k][z].fat);
                                total.qty += parseFloat(currentResults[k][z].qty);

                            }
                        }
                    }
                    
                    for (let z in total) {
                        total[z] = (total[z]).toFixed(2)
                    }

                    for(let k in mealTotals){
                        for (let z in mealTotals[k])
                            mealTotals[k][z] = (mealTotals[k][z]).toFixed(2);
                    }
                } else {
                    currentResults = [{}];
                }

                getTarget(currentResults,total,mealTotals);
            }
        });
    }

    function getTarget(currentResults,total,mealTotals) {
        mysql.query('SELECT protein,kcal,fat,fiber,carbs FROM prod_app.my_plate_target WHERE user = "'+req.session.username+'" and date = curdate();',(error,results) => {
            if (error) {
                return next(error);
            } else {
                console.log(results);
                let target = []
                if(results.length > 0)
                    target = results[0]

                res.render('plate_calculator', { article: currentResults, totalArticles: total, totalMeals : mealTotals, dailyTarget: target});
            } 
        });
    }
});

module.exports = router;
const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const express = require('express');
const config = new options();
const Date = require('../assets/entity/date');

let router = express.Router();
let mysql = new mysqlController(config.mysql);

async function getResults() {

}

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {

        let mysql = new mysqlController(config.mysql);

        mysql.query('SELECT * FROM my_plate_articles ORDER BY category_id desc;', (error, results) => {
            if(error) {
                return next(error);
            }else{
                
                let animalProteinItems = [];
                let vegetalProteinItems = [];
                let vegetablesItems = [];
                let carbsItems = [];
                let fruitsItems = [];
                let nutsItems = [];
                let herbalProductsItems = [];

                for(let k in results){
                    switch(true){
                        case results[k].category_id == '1':
                            animalProteinItems.push(results[k])
                        break;
                        case results[k].category_id == '2':
                            vegetalProteinItems.push(results[k])
                        break;
                        case results[k].category_id == '3':
                            vegetablesItems.push(results[k])
                        break;
                        case results[k].category_id == '4':
                            carbsItems.push(results[k])
                        break;
                        case results[k].category_id == '5':
                            fruitsItems.push(results[k])
                        break;
                        case results[k].category_id == '6':
                            nutsItems.push(results[k])
                        break;
                        case results[k].category_id == '7':
                            herbalProductsItems.push(results[k])
                        break;
                    }
                }

                res.render('plate_calculator_add', { 
                    animalProtein: animalProteinItems,
                    vegetalProtein: vegetalProteinItems,
                    vegetables: vegetablesItems,
                    carbs: carbsItems,
                    fruits: fruitsItems,
                    nuts: nutsItems,
                    herbalProducts: herbalProductsItems
                });
            }
        });
    }
});

router.post('/', (req, res, next) => {

    let plateItem = req.body;

    function validateArticle() {

        mysql.select('my_plate_articles', { 'id': plateItem.article }, (error, results) => {
            if (error) {
                return next(error);
            } else {
                checkIfExists(results[0], plateItem)
            }
        });
    }

    function calculateMeal(data, artInfo, item) {

        let articles = [];
        let newArticle = {
            id: artInfo.id,
            name: artInfo.name,
            qty: parseFloat(item.quantity),
            protein: calculateQty(item.quantity, artInfo.protein),
            carbs: calculateQty(item.quantity, artInfo.carbs),
            kcal: calculateQty(item.quantity, artInfo.kcal),
            fiber: calculateQty(item.quantity, artInfo.fiber),
            fat: calculateQty(item.quantity, artInfo.fat)
        }

        if (typeof data != 'object') {
            let parsedData = JSON.parse(data);
            parsedData.push(newArticle);
            return parsedData;

        } else {
            articles.push(newArticle);
            return articles;
        }
    }

    function calculateQty(qty, nutrientQty) {
        let intQty = parseFloat(qty);
        return (nutrientQty / 100 * intQty).toFixed(2);
    }

    function checkIfExists(articleInfo, item) {
        let currentDate = new Date();
        mysql.select('my_plate_daily_calculator', { user: req.session.username, date: currentDate.getCurrentDate() }, (error, results) => {
                
            if (error) {
                return next(error);
            } else {
            
            if (results.length > 0) {
                    let rawData = results[0];
                    let rawMeal = calculateMeal(rawData[item.meal_type], articleInfo, item);
                    updateData({
                        [item.meal_type]: JSON.stringify(rawMeal)
                    })


                } else {
                    let rawMeal = calculateMeal(null, articleInfo, item);
                    let currentDate = new Date();
                    postData({
                        user: req.session.username,
                        [item.meal_type]: JSON.stringify(rawMeal),
                        date: currentDate.getCurrentDate()

                    });
                }
            }
        });
    }

    function postData(insertData) {
        mysql.insert('my_plate_daily_calculator', insertData, (error, results) => {
            if (error) {
                return next(error);
            } else {
                if (results.affectedRows > 0) {
                    res.redirect('../calculator');
                }
            }
        });
    }

    function updateData(updateData) {
        let currentDate = new Date();
        mysql.update('my_plate_daily_calculator', updateData, { user: req.session.username, date: currentDate.getCurrentDate() }, (error, results) => {
            if (error) {
                return next(error);
            } else {
                if (results.affectedRows > 0) {
                    res.redirect('../calculator');
                }
            }
        });
    }

    validateArticle();

});

module.exports = router;
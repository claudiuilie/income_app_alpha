const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const express = require('express');
const config = new options();

let router = express.Router();
let mysql = new mysqlController(config.mysql);

router.get('/', (req, res) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else
        res.render('wallet_create');
});

router.post('/', (req, res, next) => {

    let month = new monthEntity();
    month.setMonth(req.body);

    function validateMonth() {
        mysql.select('income',{'month_name':month.month_name,'year':month.year},(error,results) =>{
            if(error) {
                return next(error);
            } else {
                if (results.length == 0) {
                    postData()
                } else {
                    res.render('wallet_create', {message: `Duplicate entry: ${month.month_name} ${month.year}` , infoModal: 'show'});
                }
            }
        });
    }

    function postData() {
        mysql.insert('income',month,(error,results) => {
            if(error) {
                return next(error);
            } else {
                if (results.affectedRows > 0 ) {
                    res.render('wallet_create', {message: `Success: affected rows ${results.affectedRows}` , infoModal: 'show'});
                }
            }
        });
    }
    validateMonth();
});

module.exports = router;

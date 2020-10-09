const express = require('express');
const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const config = new options();
const passwordHash = require('password-hash');

let Account = require('../assets/entity/account');
let router = express.Router();

router.get('/', (req, res, next) =>  {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let mysql = new mysqlController(config.mysql);
        let account = new Account();
        mysql.query('SELECT * FROM prod_app.my_plate_target WHERE user = "'+req.session.username+'" and date = curdate();',(error,results) => {
            account.setAccount(results[0]);
            res.render('profile', {account: account});
        });
    }
});

router.post('/', (req, res, next) =>  {
    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let mysql = new mysqlController(config.mysql);
        let account = new Account();
        account.set( Object.keys(req.body)[0],req.body.username);
        account.set( Object.keys(req.body)[1],passwordHash.generate(req.body.password));

        mysql.update('accounts',account,{'username': account.username},(error,results) => {
            if (error) {
               return next(error);
            }
            mysql.select('accounts',{'username' : account.username}, (error,params) => {
                if (error) {
                    return next(error);
                }
                res.render('profile', {message: `Success: affected rows ${results.affectedRows}` , infoModal: 'show', account: params[0]});
            });
        });
    }
});

module.exports = router;
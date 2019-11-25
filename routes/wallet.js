const mysqlController = require('../assets/js/mysqlController');
const options = require('../assets/config/config');
const monthEntity = require('../assets/entity/month');
const pieEntity = require('../assets/entity/pieChart');
const outcomeEntity = require('../assets/entity/outcomeChart');
const progressEntity = require('../assets/entity/progressChart');

let config = new options();
let express = require('express');
let router = express.Router();
let mysql = new mysqlController(config.mysql);
let date = new Date();

function builder(req,res,next, params){

    let year;
    let progressChart;
    let month = new monthEntity();

    mysql.select('income', {'year' : date.getFullYear()}, (error, results) => {
        if(error) {
            return next(error);
        }
        year = results;

        progressChart = new progressEntity(year);
        mysql.select('income' ,params,(error,results)=>{
            if(error) {
                return next(error);
            }

            if (results.length > 0) {

                month.getMonth(results[0]);
                let pieChart = new pieEntity(month);
                let outcomeChart = new outcomeEntity(month);
                progressChart.shortMonths();
                res.render('wallet', {
                    pieData: pieChart,
                    outcomeData: outcomeChart,
                    progressData: progressChart
                });

            } else {
                res.render('wallet', {})
            }
        });
    });
}

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//     console.log('Time: ', Date.now())
//     next()
// })

router.get('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        let params = {'month_name': date.toLocaleString('default', { month: 'long' }),'year': date.getFullYear()}
        builder(req,res,next,params);
    }
});

router.post('/', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        builder(req,res,next, req.body);
    }
});

router.post('/delete', (req, res, next) => {

    if (!req.session.loggedin) res.redirect('/auth');

    else {
        mysql.delete('income',req.body,(err,results) => {
            if (err)
                next(err);

            res.send(results);
        })
    }
});

module.exports = router;
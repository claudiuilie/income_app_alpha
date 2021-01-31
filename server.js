const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const options = require('./assets/config/config');
const cron = require('./assets/crons/greenhouseCron');
const mysql = require('mysql');
const mysqltorest  = require('mysql-to-rest');
const greenhouseCron = new cron();
const passwordHash = require('password-hash');

let api;
let app = express();
let config = new options();




app.engine('hbs', exphbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.use(session({
    secret: passwordHash.generate('secret'),  //de schimbat 
    resave: true,
    maxAge: 3600000,
    saveUninitialized: true
}));

app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});

api = mysqltorest(app,mysql.createConnection(config.mysql));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'assets')));

const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const homeCinemaRouter = require('./routes/home_cinema')
const profileRouter = require('./routes/profile');
const homeControltRouter = require('./routes/home_control');
const walletRouter = require('./routes/wallet');
const createWalletRouter = require('./routes/wallet_create');
const editWalletRouter = require('./routes/wallet_edit');
const plateList = require('./routes/plate_list');
const plateItem = require('./routes/plate_item');
const plateCalculator = require('./routes/plate_calculator');
const plateCalculatorAdd = require('./routes/plate_calculator_add');
const logoutRouter = require('./routes/logout');

app.use('/auth', authRouter);
app.use('/home',homeRouter);
app.use('/cinema', homeCinemaRouter);
app.use('/profile',profileRouter);
app.use('/control',homeControltRouter);
app.use('/wallet', walletRouter);
app.use('/wallet/create', createWalletRouter);
app.use('/wallet/edit', editWalletRouter);
app.use('/plate/list', plateList);
app.use('/plate/item', plateItem);
app.use('/plate/calculator', plateCalculator);
app.use('/plate/calculator/add', plateCalculatorAdd);
app.use('/logout', logoutRouter);

app.get('*', (req, res) => {
    res.render('home',{layout:'error.hbs'});
});


app.listen(config.server.port,config.server.host,() => console.log(`Listening ${config.server.host}:${config.server.port}`));
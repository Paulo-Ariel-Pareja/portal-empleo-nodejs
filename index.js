const mongoose = require('mongoose');
require('./config/db');
const express = require('express');
const  exphbs = require('express-handlebars');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require("express-validator");
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');


require('dotenv').config({ path: 'variables.env'});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressValidator());

app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next(); 
});

app.use('/', router());

app.use((req, res, next) => {
    next(createError(404, 'Pagina no encontrada'));
});

app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

// PARA TEST EN LOCAL
// app.listen(process.env.PUERTO);

// modificacion para heroku
// const host = '0.0.0.0';
// const port = process.env.PORT;

// app.listen(port, host, () => {
//     console.log('Servidor funcionando');
// });
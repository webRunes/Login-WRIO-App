const nconf = require( "./wrio_nconf.js");
const express = require( 'express');
const passport = require( 'passport');
const path = require( 'path');
const {init} = require( './db');
const session = require( 'express-session');
const cookieParser = require( 'cookie-parser');
const {dumpError} = require( './utils.js');
const {router} = require('./profile/route.js');
const ProfileRouter = router;
const LoginRouter = require( './route.js');
const LoginStrategy = require( './strategy.js');
const WrioApp = require( "./wrio_app.js");
const HttpServer = require( 'http');
const ConnectMongo = require( 'connect-mongo');
const p3p = require( 'p3p');
const minimist = require( 'minimist');
const logger = require( 'winston');


logger.level = 'debug';

var app = WrioApp.init(express);
app.ready = () => {};
var DOMAIN = nconf.get("db:workdomain");

app.custom = {};
var server = HttpServer
    .createServer(app)
    .listen(nconf.get("server:port"), (req, res) => {
        logger.log('info','app listening on port ' + nconf.get('server:port') + '...');
        init().then((db) => {
            app.custom.db = db;
            logger.log('info',"Connected correctly to mongodb server");
            server_setup(db);
            app.ready();
        }).catch((err)=>{
            logger.log('error',"Error connecting to mongo database: " + err);
            dumpError(err);
        });
    });

function server_setup(db) {

    var SessionStore = ConnectMongo(session);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var cookie_secret = nconf.get("server:cookiesecret");

    var sessionStore = new SessionStore({
        db: app.custom.db
    });
    app.use(cookieParser(cookie_secret));
    app.use(session({

        secret: cookie_secret,
        saveUninitialized: true,
        store: sessionStore,
        resave: true,
        cookie: {
            secure: false,
            domain: DOMAIN,
            maxAge: 1000 * 60 * 60 * 24 * 30
        },
        key: 'sid'
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public'));


    app.use(p3p(p3p.recommended));


    app.get('/auth', function(request, response) {
        logger.log('verbose',"SSID " + request.sessionID);
        logger.log('verbose',"Logged user", request.user);

        response.render('index', {
            user: request.user
        });

    });

    LoginStrategy(app, passport, db);

    app.use(LoginRouter);
    app.use(ProfileRouter);

    app.use('/', express.static(path.join(__dirname, '..', '/hub/')));


    logger.log('info','Login server config finished');
}

module.exports = app;

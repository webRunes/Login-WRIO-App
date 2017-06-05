const nconf = require( "./wrio_nconf.js");
const Commons = require("wriocommon");
const {initserv} = Commons.server;
const {init} =  Commons.db;
const {dumpError} = Commons.utils;
const express = require( 'express');
const passport = require( 'passport');
const path = require('path');
const HttpServer = require( 'http');
const p3p = require( 'p3p');
const logger = require( 'winston');


logger.level = 'debug';

var app = express();
app.ready = () => {};
var DOMAIN = nconf.get("db:workdomain");

app.custom = {};
var server = HttpServer
    .createServer(app)
    .listen(nconf.get("server:port"), async (req, res) =>  {
        logger.log('info','app listening on port ' + nconf.get('server:port') + '...');
        let db;
        try {
            db = await init();
            app.custom.db = db;
            logger.log('info',"Connected correctly to mongodb server");
        } catch (err) {
            logger.log('error',"Error connecting to mongo database");
            dumpError(err);
            process.exit(-1);
            return;
        }

        try {
            server_setup(db);
            app.ready();
        } catch (err) {
            logger.log('error',"Error during server init");
            dumpError(err);
            process.exit(-1);
        }
    });

function server_setup(db) {

    // NOTE: require these files only after db is ready


    const LoginStrategy = require( './strategy.js');
    const {router} = require('./profile/route.js');
    const ProfileRouter = router;
    const LoginRouter = require( './route.js');


    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    initserv(app,db);

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

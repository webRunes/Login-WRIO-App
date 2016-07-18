import nconf from "./wrio_nconf.js";
import express from 'express';
import passport from 'passport';
import path from 'path';
import {init} from './db';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {dumpError} from './utils.js';
import {router as ProfileRouter} from './profile/route.js';
import LoginRouter from './route.js';
import LoginStrategy from './strategy.js';
import WrioApp from "./wrio_app.js";
import HttpServer from 'http';
import ConnectMongo from 'connect-mongo';
import p3p from 'p3p';
import minimist from 'minimist';
import logger from 'winston';


logger.level = 'debug';

var app = WrioApp.init(express);
app.ready = () => {};
var DOMAIN = nconf.get("db:workdomain");

app.custom = {};
var server = HttpServer
    .createServer(app)
    .listen(nconf.get("server:port"), function(req, res) {
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

export default app;

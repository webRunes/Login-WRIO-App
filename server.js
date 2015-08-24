'use strict';
var nconf = require("./wrio_nconf.js").init();
var express = require('express');
var app = require("./wrio_app.js").init(express);
var passport = require('passport');

var DOMAIN= nconf.get("db:workdomain");

var MongoClient = require('mongodb')
    .MongoClient;
app.custom = {};
var server = require('http')
    .createServer(app)
    .listen(nconf.get("server:port"), function(req, res) {
        console.log('app listening on port ' + nconf.get('server:port') + '...');
        var url = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Error conecting to mongo database: " + err);
            } else {
                app.custom.db = db;
                console.log("Connected correctly to mongodb server");
                server_setup(db);
            }
        });
    });

function server_setup(db) {


    var session = require('express-session');
    var SessionStore = require('connect-mongo')(session);
    var cookieParser = require('cookie-parser');

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var cookie_secret = nconf.get("server:cookiesecret");

    var sessionStore = new SessionStore({db: app.custom.db});
    app.use(cookieParser(cookie_secret));
    app.use(session(
        {

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
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public'));

    var p3p = require('p3p');
    app.use(p3p(p3p.recommended));

    var argv = require('minimist')(process.argv.slice(2));
    console.log(argv);
    if (argv.testjsx == "true") {
        console.log("\nEntering jsx widget test mode, use /test.html to check widget operation\n");
        app.use(express.static(__dirname + '/widget'));
        app.use(express.static(__dirname + '/test'));

    }

    require('./login/strategy.js')(app,passport,db);
    require('./login/route.js')(app,passport);


    console.log('Login server config finished');
}
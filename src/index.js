'use strict';
import nconf from "./wrio_nconf.js"
import express from 'express';
import passport from 'passport';
import path from 'path'
import {init} from './db';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {dumpError} from './utils.js'
import {router as ProfileRouter} from './profile/route.js'
import LoginRouter from './route.js'
import LoginStrategy from './strategy.js'
import WrioApp from "./wrio_app.js"
import HttpServer from 'http'
import ConnectMongo from 'connect-mongo'
import p3p from 'p3p';
import minimist from 'minimist'

var indexpath = path.join(__dirname, '..',	'/hub/index.htm');

var app = WrioApp.init(express);
app.ready = () => {};
var DOMAIN = nconf.get("db:workdomain");

app.custom = {};
var server = HttpServer
	.createServer(app)
	.listen(nconf.get("server:port"), function(req, res) {
		console.log('app listening on port ' + nconf.get('server:port') + '...');
		init().then((db) => {
			app.custom.db = db;
			console.log("Connected correctly to mongodb server");
			server_setup(db);
			app.ready();

		}).catch((err)=>{
			console.log("Error conecting to mongo database: " + err);
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


	app.get('/', function(request, response) {
		console.log("SSID " + request.sessionID);
		console.log("Logged user", request.user);
		var command = '';
		for (var i in request.query) {
			if (command === '') {
				command = i;
			}
		}
		switch (command) {
			case 'auth':
				{
					response.render('index', {
						user: request.user
					});
					break;
				}
			default:
				{
					console.log(indexpath);
					response.sendFile(indexpath); // TODO: make this work on node v4 in future
				}
		}
	});

	LoginStrategy(app, passport, db);

	app.use(LoginRouter);
	app.use(ProfileRouter);


	console.log('Login server config finished');
}

export default app;

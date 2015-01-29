var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(function (request, response){
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Hello Travis!\n');
}).listen(5000);

var passport = require('passport');
var util = require('util');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var session = require('express-session');
var cookieParser = require('cookie-parser');
var nconf = require("./wrio_nconf.js").init();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session(
	{
		secret: 'keyboard cat',
		saveUninitialized: true,
		resave: true,
		key: 'sid'
	}
));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

passport.use(new FacebookStrategy({
		clientID: nconf.get('api:facebook:clientId'),
		clientSecret: nconf.get('api:facebook:clientSecret'),
		callbackURL: nconf.get('api:facebook:callbackUrl')
	},
	function (accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

passport.use(new TwitterStrategy({
		consumerKey: nconf.get("api:twitterLogin:consumerKey"),
		consumerSecret: nconf.get("api:twitterLogin:consumerSecret"),
		callbackURL: nconf.get("api:twitterLogin:callbackUrl")
	},
	function (accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

passport.use(new GitHubStrategy({
		clientID: nconf.get('api:gitHub:clientId'),
		clientSecret: nconf.get('api:gitHub:clientSecret'),
		callbackURL: nconf.get('api:gitHub:callbackUrl')
	},
	function (accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

app.get('/', function (request, response) {
	response.render('index', {user: request.user});
});

app.get('/loginTwitter', function (request, response) {
	response.render('login', {user: request.user});
});

app.get('/account', ensureAuthenticated, function (request, response) {
	response.render('account', {user: request.user});
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}),
	function (request, response) {
		response.redirect('/');
	});

app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

app.get('/auth/twitter/callback',
	passport.authenticate('twitter', {successRedirect: '/', failureRedirect: '/login'}),
	function (request, response) {
		response.redirect('/');
	});

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/git-hub/callback',
	passport.authenticate('github', {failureRedirect: '/login'}),
	function (req, res) {
		res.redirect('/');
	});

app.get('/logout', function (request, response) {
	request.logout();
	response.redirect('/');
});

function ensureAuthenticated(request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	response.redirect('/login')
}
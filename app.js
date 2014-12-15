var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(3000);
var session = require('express-session');
var cookieParser = require('cookie-parser');


var nconf = require("./wrio_nconf.js").init();



var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

app.use(express.static(__dirname + '/public'));

app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());


passport.use(new TwitterStrategy({
    consumerKey: nconf.get("consumer_key"),
    consumerSecret: nconf.get("consumer_secret"),
    callbackURL: "https://twitter.com"
  },
  function (accessToken, refreshToken, profile, done) {
  		process.nextTick(function () {
  			return done(null, profile);
  		});
  	}
));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/',function(req,res){
	res.render('index');
})

app.get('/twitter', passport.authenticate('twitter'));

app.get('/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
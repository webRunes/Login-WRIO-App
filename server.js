var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(5000);
var passport = require('passport');
var util = require('util');
var nconf = require("./wrio_nconf.js").init();
// mysql stuff

var mysql = require('mysql');

MYSQL_HOST = nconf.get("db:host");
MYSQL_USER = nconf.get("db:user");
MYSQL_PASSWORD = nconf.get("db:password");
MYSQL_DB = nconf.get("db:dbname");
DOMAIN= nconf.get("db:workdomain");

var connection;



function handleDisconnect() {
    connection = mysql.createConnection({
        host     : MYSQL_HOST,
        user     : MYSQL_USER,
        password : MYSQL_PASSWORD
    });



    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } else {
            console.log("Connecting to db...")
            connection.query('USE '+MYSQL_DB);
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

passport.serializeUser(function(user, done) {
    console.log("Serializing user "+user.id);
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {

    console.log("Deserializing user by id="+id)
    connection.query("select * from `webRunes_Login-Twitter` where userID = "+id,function(err,rows){
        if (err) {
            console.log("User not found");
            done(err);
        }
        console.log("USere deserialized "+id, rows[0])
        done(err, rows[0]);
    });
});

function newMysqUser(id,token,tokenSecret,done) {
    // create the user
    var newUserMysql = new Object();

    newUserMysql.userID = id;
    newUserMysql.token = token; // use the generateHash function in our user model
    newUserMysql.tokenSecret = tokenSecret; // use the generateHash function in our user model

    connection.query("select * from `webRunes_Login-Twitter` where userID = "+id,function(err,rows){
        if (err) {
            console.log("Creating user");
            var insertQuery = "INSERT INTO `webRunes_Login-Twitter` ( userID, token, tokenSecret ) values ('" + id + "','" + token + "','" + tokenSecret + "')";
            console.log(insertQuery);
            connection.query(insertQuery, function (err, rows) {
                console.log("Insert query done "+err);
                newUserMysql.id = rows.userID;
                return done(null, newUserMysql);
            });

        } else {
            console.log("User found ",rows[0]);
            done(err, rows[0]);
        }
    });



}


// end mysql stuff



var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var session = require('express-session');
var SessionStore = require('express-mysql-session')
var cookieParser = require('cookie-parser');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var session_options = {
    host: MYSQL_HOST,
    port: 3306,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB
}

var sessionStore = new SessionStore(session_options)

app.use(session(
    {
        secret: 'keyboard cat',
        saveUninitialized: true,
        store: sessionStore,
        resave: true,
//        cookie: { domain:DOMAIN},
        key: 'sid'
    }
));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));



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
    function (token, secretToken, profile, done) {
        console.log(profile+" "+token+" "+secretToken);
        newMysqUser(profile.id,token,secretToken,done);
        //sender.setCred(nconf.get("api:twitterLogin:consumerKey"),nconf.get("api:twitterLogin:consumerSecret"),token,secretToken);
        //sender.comment("Test","./1.jpg");
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
    function (token, tokenSecret, profile, done) {

        process.nextTick(function () {
            return done(null, profile);
        });
    }
));



app.get('/', function (request, response) {
    console.log("SSSID "+request.sessionID);
    console.log("Get user",request.user);
    response.render('index', {user: request.user});
});

app.get('/authapi', function (request, response) {

    console.log("authapi called")

    if (request.query.callback) {

        console.log("callback",request.query.callback);
        console.log("SSSID "+request.sessionID);
        console.log("Get user",request.user);
        if (request.sessionID) {
            response.redirect(request.query.callback+'?sid='+request.sessionID);
        } else {
            response.send('user not found');
        }


    } else {
        response.send("No callback given");
    }

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


app.get('/auth/twitter/', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/',
        failureRedirect: '/' }));
/*
 app.get('/auth/twitter', function (request, response, next) {
 request.session.redirect = request.headers['referer'];
 next();
 }, passport.authenticate('twitter', {scope: 'email'}));


 app.get('/auth/twitter/callback', function (request, response, next) {
    passport.authenticate('twitter', function (error, user, info) {
        // This is the default destination upon successful login.
        var redirectUrl = '/';

        if (error) {
            return next(error);
        }
        if (!user) {
            return response.redirect('/');
        }

        // If we have previously stored a redirectUrl, use that,
        // otherwise, use the default.
        if (request.session.redirectUrl) {
            redirectUrl = request.session.redirectUrl;
            request.session.redirectUrl = null;
        }
        request.logIn(user, function (error) {
            if (error) {
                return next(error);
            }
        });
        response.redirect(redirectUrl);
    })(request, response, next);
});
*/

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/git-hub/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    function (request, res) {
        response.redirect('/');
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
console.log('Hello Travis!');

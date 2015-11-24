'use strict';
/**
 * Created by michbil on 23.08.15.
 */

var nconf = require("../wrio_nconf.js")
    .init();
var DOMAIN = nconf.get("db:workdomain");

module.exports = function(app, passport) {

    app.get('/buttons/twitter', function(request, response) {
        if (request.user) {
            console.log(request.user.lastName);
        }

        response.render('twitterbutton', {
            user: request.user,
            storageUrl: "http://storage" + DOMAIN + "/api/get_profile"
        });
    });

    app.get('/buttons/callback', function(request, response) {
        response.render('buttoncallback', {
            user: request.user
        });
    });

    app.get('/authapi', function(request, response) {

        console.log("authapi called")

        if (request.query.callback) {

            response.cookie('callback', request.query.callback, {
                maxAge: 60 * 1000,
                httpOnly: true
            }); // save callback in cookie, for one minute

            console.log("callback", request.query.callback);
            console.log("SSSID " + request.sessionID);
            console.log("Get user", request.user);
            if (request.user) {
                response.redirect(request.query.callback);
            } else {
                response.redirect('/auth/twitter'); // cause we have only Twitter AUTH now
                //response.render('index', {user: request.user});
            }


        } else {
            response.status(400);
            response.send("No callback given");
        }

    });


    app.get('/loginTwitter', function(request, response) {
        response.render('login', {
            user: request.user
        });
    });

    app.get('/account', ensureAuthenticated, function(request, response) {
        response.render('account', {
            user: request.user
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email'
    }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }),
        function(request, response) {
            response.redirect('/');
        });

    //app.get('/auth/twitter/', passport.authenticate('twitter'));
    app.get('/auth/twitter/', function(request, response, next) {
        console.log("Auth twitter");
        if (request.query.callback) {
            response.cookie('callback', request.query.callback, {
                maxAge: 60 * 1000,
                httpOnly: true
            }); // save callback in cookie, for one minute
        }
        return passport.authenticate('twitter')(request, response, next)
    });

    app.get('/auth/twitter/callback',
        function(request, response, next) {
            var redirecturl = '/?auth';
            console.log("Auth twitter callback");
            if (request.cookies.callback) {
                console.log("Extractign callback")
                if (request.sessionID) {
                    console.log("SID found");
                    redirecturl = request.cookies.callback + '?sid=' + request.sessionID;
                } else {
                    console.log("SID not found");
                }
            } else {
                console.log("Cookie callback not found");
            }
            passport.authenticate('twitter', {
                successRedirect: redirecturl,
                failureRedirect: '/?auth'
            })(request, response, next);
        }
    );

    app.get('/auth/github', passport.authenticate('github'));
    app.get('/auth/git-hub/callback',
        passport.authenticate('github', {
            failureRedirect: '/login'
        }),
        function(request, res) {
            response.redirect('/');
        });

    app.get('/logout', function(request, response) {
        request.logout();
        //    console.log("Deleting user profile cookie...");
        //    response.clearCookie('user_profile', 0, { httpOnly: true, domain:DOMAIN });
        response.redirect('/?auth');
    });

    function ensureAuthenticated(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        }
        response.redirect('/login')
    }

};

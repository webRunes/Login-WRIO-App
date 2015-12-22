/**
 * Created by michbil on 23.08.15.
 */

import nconf from "./wrio_nconf"
import {Router} from 'express'
import passport from 'passport'
import ProfileRouter from './profile/route.js'
var DOMAIN = nconf.get("db:workdomain");

var router = Router();

/*
*
* Twitter button, used in embedded iframe
*
* */
router.get('/buttons/twitter', async (request, response) => {

    var profile = await ProfileRouter(request);
    console.log("PROFILE",profile);

    response.render('twitterbutton', {
        user: request.user,
        temporary: profile.temporary,
        profile: JSON.stringify(profile)
    });
});

/*

twitter button callback, called from inside of login popup, sends
message to parent iframe and and closes popup

 */

router.get('/buttons/callback', function(request, response) {
    response.render('buttoncallback', {
        user: request.user
    });
});

/*
* Universal auth api
* not working yet
* */


router.get('/authapi', function(request, response) {

    console.log("authapi called");

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

/* LoginTwitter template
 * TODO: check and delete if not needed
 *
 * */


router.get('/loginTwitter', function(request, response) {
    response.render('login', {
        user: request.user
    });
});

/* get user account data if logged in */

router.get('/account', ensureAuthenticated, function(request, response) {
    response.render('account', {
        user: request.user
    });
});

/* Starts twitter auth process
*
* PARAMETERS: ?callback=urlencode(url)
* Where url - address of page to callback when auth succeeded
* call it within webrunes domain to allow user to log in
*
*/
router.get('/auth/twitter/', function(request, response, next) {
    console.log("Auth twitter");
    if (request.query.callback) {
        response.cookie('callback', request.query.callback, { // create cookie for later use with redirect URL
            maxAge: 60 * 1000,
            httpOnly: true
        }); // save callback in cookie, for one minute
    }
    return passport.authenticate('twitter')(request, response, next)
});

/* Twitter register callback, this callback should be called only by twitter website
   WARNING: never call it directly
 */

router.get('/auth/twitter/callback',
    function(request, response, next) {
        var redirecturl = '/?auth';
        console.log("Auth twitter callback");
        if (request.cookies.callback) {
            console.log("Extractign callback");
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
            successRedirect: redirecturl, // redirect to specified URL, saved befor in cookie
            failureRedirect: '/?auth'
        })(request, response, next);
    }
);


router.get('/logout', function(request, response) {
    //request.logout();
    request.session.destroy();
    response.redirect('/?auth');
});

function ensureAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login')
}

/*

TODO: uncomment this when start actually using github and facebook

 app.get('/auth/github', passport.authenticate('github'));
 app.get('/auth/git-hub/callback',
 passport.authenticate('github', {
 failureRedirect: '/login'
 }),
 function(request, res) {
 response.redirect('/');
 });

 */

/*
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
 */


export default router;

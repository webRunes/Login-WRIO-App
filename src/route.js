/**
 * Created by michbil on 23.08.15.
 */

import nconf from "./wrio_nconf";
import {Router} from 'express';
import passport from 'passport';
import {CheckProfile} from './profile/route.js';
import logger from 'winston';
var DOMAIN = nconf.get("db:workdomain");

var router = Router();

/*
*
* Twitter button, used in embedded iframe
*
* */
router.get('/buttons/twitter', async (request, response) => {

    logger.log("debug","\n=========== Checking and creating temporary profile if needed =========");
    var profile = await CheckProfile(request);
    logger.log("debug","PROFILE",profile);

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

    logger.log("debug","authapi called");

    if (request.query.callback) {

        response.cookie('callback', request.query.callback, {
            maxAge: 60 * 1000,
            httpOnly: true
        }); // save callback in cookie, for one minute

        logger.log("debug","callback", request.query.callback);
        logger.log("debug","SSSID " + request.sessionID);
        logger.log("debug","Get user", request.user);
        logger.debug(request.user);

        if (!request.user) {
            logger.error("No temporoary user created yet, try later");
            return response.status(403).send("No temporary user, sorry");
        }

        if (request.user.temporary == false) {
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
    logger.log("debug","Auth twitter");
    if (request.query.callback) {
        response.cookie('callback', request.query.callback, { // create cookie for later use with redirect URL
            maxAge: 60 * 1000,
            httpOnly: true
        }); // save callback in cookie, for one minute
    }
    return passport.authenticate('twitter')(request, response, next);
});

/* Twitter register callback, this callback should be called only by twitter website
   WARNING: never call it directly
 */

router.get('/auth/twitter/callback',
    (request, response, next) => {
        var redirecturl = '/auth';
        logger.log("info","\n ============= Twitter callback was called by API ======================\n");
        if (request.cookies.callback) {
            logger.log("debug","Setting up callback...");
            redirecturl = request.cookies.callback;
        } else {
            logger.log("error","Cookie callback not found");
        }
        passport.authenticate('twitter', {
            successRedirect: redirecturl, // redirect to specified URL, saved before in cookie
            failureRedirect: '/closepopup'
        })(request, response, next);
    }
);


router.get('/logout', function(request, response) {
    request.logout();
    request.session.destroy();
    response.redirect('/auth');
});

router.get('/iframeLogout', function(request, response) {
    request.session.destroy();
    response.status(200).send('OK');
});

router.get('/closepopup', function(request, response) {
    response.render('close',{});
});

function ensureAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login');
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

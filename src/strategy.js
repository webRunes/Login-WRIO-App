import {ObjectID} from 'mongodb';
import nconf from "./wrio_nconf.js"
import TwitterStrategy from 'passport-twitter'

export default function (app,passport,db) {

    var webrunesUsers = db.collection('webRunes_Users');
    var sessions = db.collection('sessions');

/*
    TODO: uncomment this strategies when start actually using github and facebook

    var GitHubStrategy = require('passport-github').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;

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
    ));*/


    passport.use(new TwitterStrategy.Strategy({
            consumerKey: nconf.get("api:twitterLogin:consumerKey"),
            consumerSecret: nconf.get("api:twitterLogin:consumerSecret"),
            callbackURL: nconf.get("api:twitterLogin:callbackUrl")
        },
        function (token, secretToken, profile, done) {
            console.log("Saving tokens for",profile + " " + token + " " + secretToken);
            saveTwitterTokens(profile, token, secretToken, function () {
                console.log("Tokens saved");
            });

            process.nextTick(function () {
                return done(null, profile);
            });
        }
    ));

    /*
    Serialize user to database
    serialize object from twitterID to wriouser db id
    */

    passport.serializeUser(function (user, done) {
        // thats where we get user from twtiter
        // TODO: check whether this code is really needed
        console.log("Serializing user... " + user.id);
        findUser(user, function (err, res) {
            if (err || !res) {
                done(err);
            } else {
                console.log(".... got wrioUSER", res);
                done(null, res._id);
            }
        });
    });

    /*
     Deserialize user from database
     from db id to complete wriouser profile
     */
    passport.deserializeUser(function (id, done) {

        console.log("Deserializing user by id=" + id);
        webrunesUsers.findOne(ObjectID(id), function(err,user) {
            if (err) {
                console.log("Error while searching user");
                done(err);
                return;
            }
            if (!user) {
                console.log("User not found",err);
                done(err);
                return;
            }
            console.log("User deserialized " + id, user);
            done(err, user);
        });
    });

    /* create new wrioUser using profile data */

    function findUser(profile, done) {
        // create the user
        webrunesUsers.findOne({titterID: profile.id},function(err,user) {
            if (err || !user) {
                done("Can't find source user");
            } else {
                done(err, user);
            }
        });
    }

    // save Twitter tokens for existing user when
    // temporary account is connected with persistent account

    function saveTwitterTokens(profile, token, tokenSecret, done) {
        // create additional entries for persistent user

        console.log("Executing saveTwitterTokens\n");

        webrunesUsers.updateOne({titterID: profile.id},
            {
                $set:{
                    token: token,
                    tokenSecret: tokenSecret,
                    temporary:false,
                    titterID: profile.id,
                    lastName: profile.displayName
        }},function(err,element) {
            if (err || !element) {
                console.log("Update wrio user record failure",err);
            } else {
                // newUserMysql.id = newUserMysql.userID = rows.insertId;
                webrunesUsers.findOne({titterID: profile.id}, function(err,result) {
                    return done(err, result);
                });

            }
        });
    }



};
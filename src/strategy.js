import {ObjectID} from 'mongodb';
import nconf from "./wrio_nconf.js";
import TwitterStrategy from 'passport-twitter';

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

    var consumerKey = nconf.get("api:twitterLogin:consumerKey"),
        consumerSecret = nconf.get("api:twitterLogin:consumerSecret"),
        callbackURL = nconf.get("api:twitterLogin:callbackUrl");

    if (consumerKey) {
        passport.use(new TwitterStrategy.Strategy({
                consumerKey: consumerKey,
                consumerSecret: consumerSecret,
                callbackURL: callbackURL
            },
            function (token, secretToken, profile, done) {
                process.nextTick(function () {
                    profile.keys = {
                        token: token,
                        secretToken: secretToken
                    };
                    return done(null, profile);
               });
            }
        ));
    }

    /*
    Serialize user to database
    serialize object from twitterID to wriouser db id
    */

    passport.serializeUser(function (req, profile, done) {
        // thats where we get user from twtiter
        console.log(profile.keys);
        var userID = req.session.passport.user;
        console.log("Serializing user Twitter id= " + profile.id, "to ojbect ",userID);
        saveTwitterTokens(userID, profile, profile.keys.token, profile.keys.secretToken, function (err) {
            delete profile['keys'];
            if (err) {
                console.log("Tokens not saved");
                return done(err)
            }
            console.log("Tokens saved");
            done(null,userID);
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


    // save Twitter tokens for existing user when
    // temporary account is connected with persistent account

    function saveTwitterTokens(userID, profile, token, tokenSecret, done) {
        // create additional entries for persistent user
        webrunesUsers.updateOne({_id: ObjectID(userID)},
            {
                $set:{
                    token: token,
                    tokenSecret: tokenSecret,
                    temporary:false,
                    titterID: profile.id,
                    lastName: profile.displayName
                }
            },done);
    }



};
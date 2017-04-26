const {ObjectID} = require( 'mongodb');
const nconf = require( "./wrio_nconf.js");
const TwitterStrategy = require( 'passport-twitter');
const logger = require( 'winston');
const WrioUser = require( './dbmodels/wriouser.js');

module.exports = function (app,passport,db) {

    var webrunesUsers = db.collection('webRunes_Users');
    var sessions = db.collection('sessions');

    var Users = new WrioUser();

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

    if (!consumerKey) {
        throw new Error("consumerKey not set in config");
    }

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

    /*
    Serialize user to database
    serialize object = require( twitterID to wriouser db id
    */

    passport.serializeUser(async (req, profile, done) => {
        // thats where we get user = require( twtiter
        var userID = req.session.passport.user;
        if (!userID) {
            logger.error("No valid temporary user account found to serialize, try again");
            return done("No valid temporary account found, try again");
        }
        logger.log('debug',"Serializing user Twitter id= " + profile.id, "to ojbect ",userID);
        try {
            var userID = await saveTwitterTokens(userID, profile, profile.keys.token, profile.keys.secretToken);
            delete profile['keys'];
            logger.log('debug',"Tokens saved");
            done(null,userID);
        } catch (e) {
            logger.error("Tokens not saved",e);
            return done(err);
        }
    });

    /*
     Deserialize user = require( database
     = require( db id to complete wriouser profile
     */
    passport.deserializeUser(function (req, id, done) {

        logger.log('debug',"Deserializing user by id=" + id);
        webrunesUsers.findOne(ObjectID(id), function(err,user) {
            if (err) {
                logger.log('error',"Error while searching user");
                done(err);
                return;
            }
            if (!user) {
                logger.log('error',"User not found",err);
                req.session.destroy();
                done(err);
                return;
            }
            logger.log('info',"User deserialized " + id, user);
            done(err, user);
        });
    });


    // save Twitter tokens for existing user when
    // temporary account is connected with persistent account

    var saveTwitterTokens = async (userID, profile, token, tokenSecret) => {
        // create additional entries for persistent user
        try {
            var user = await Users.get({
                titterID: profile.id
            });
            logger.debug(user);
            logger.info("Found registered user with credentials", user.wrioID);
            return user._id;
        } catch (e) {
            logger.info("Registered user with credentials not found, making user persistent");
            await Users.update({_id: ObjectID(userID)},
                {
                        token: token,
                        tokenSecret: tokenSecret,
                        temporary:false,
                        titterID: profile.id,
                        lastName: profile.displayName
                });
            return userID;
        }


    };



};
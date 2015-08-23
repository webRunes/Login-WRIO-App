'use strict';
var ObjectID = require('mongodb').ObjectID;
var nconf = require("../wrio_nconf.js").init();
module.exports = function (app,passport,db) {



    var FacebookStrategy = require('passport-facebook').Strategy;
    var TwitterStrategy = require('passport-twitter').Strategy;
    var GitHubStrategy = require('passport-github').Strategy;

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
            console.log(profile + " " + token + " " + secretToken);
            saveTwitterCallbacks(profile, token, secretToken, function () {
                console.log("New user added")
            });

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

    var webrunesUsers = db.collection('webRunes_Users');
    var sessions = db.collection('sessions');

    passport.serializeUser(function (user, done) {
        // thats where we get user from twtiter
        console.log("Serializing user " + user);
        newWrioUser(user, function (err, res) {
            if (err || !res) {
                done(err);
            } else {
                done(null, res._id);
            }
        })
    });

    // used to deserialize the user
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


    function newWrioUser(profile, done) {
        // create the user
        var newUser = {
            titterID: profile.id,
            lastName: profile.displayName
        };

        webrunesUsers.findOne({titterID: newUser.titterID},function(err,user) {
            if (err || !user) {
                console.log("User not found, creating user");
                webrunesUsers.insertOne(newUser,function(err, user) {

                    if (err) {
                        console.log("Insert error", err);
                        done("Can't insert");
                        return;
                    }

                    console.log("Insert query done " + user._id);
                    return done(null, user); // TODO: check insert id
                });

            } else {
                console.log("User found ", user);
                done(err, user);
            }
        });
    }

    function saveTwitterCallbacks(profile, token, tokenSecret, done) {
        // create the user
        var newUser = {
            titterID: profile.id,
            lastName: profile.displayName,
            token: token,
            tokenSecret: tokenSecret
        };


        webrunesUsers.updateOne({titterID: newUser.titterID},newUser,{upsert:true},function(err,element) {
            if (err || !element) {
                console.log("Update wrio user record failure",err);
            } else {
                // newUserMysql.id = newUserMysql.userID = rows.insertId;
                return done(null, element);

            }
        });


    }



};
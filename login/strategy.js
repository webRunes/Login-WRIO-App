'use strict';
var nconf = require("../wrio_nconf.js").init();
module.exports = function (app,passport) {

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

    passport.serializeUser(function (user, done) {
        // thats where we get user from twtiter
        console.log("Serializing user " + user.id);
        newWrioUser(user, function (err, res) {
            if (err) {
                done(err);
            } else {
                done(null, res.userID);
            }
        })
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {

        console.log("Deserializing user by id=" + id);
        connection.query("select * from `webRunes_Users` where userID = " + id, function (err, rows) {
            if (err) {
                console.log("User not found");
                done(err);
                return;
            }
            if (rows[0] == undefined) {
                done("Empty row from db not found for id");
                return;
            }
            console.log("USere deserialized " + id, rows[0])
            done(err, rows[0]);
        });
    });


    function newWrioUser(profile, done) {
        // create the user
        var newUserMysql = new Object();

        newUserMysql.titterID = profile.id;
        newUserMysql.lastName = profile.displayName;


        connection.query("select * from `webRunes_Users` where titterID = " + newUserMysql.titterID, function (err, rows) {
            if (err || (rows[0] == undefined)) {
                console.log("Creating user");
                var insertQuery = "INSERT INTO `webRunes_Users` ( titterID, lastName ) values ('" + newUserMysql.titterID + "','" + newUserMysql.lastName + "');";
                console.log(insertQuery);
                connection.query(insertQuery, function (err, rows) {
                    if (err) {
                        console.log("Insert error", err);
                        done("Can't insert");
                        return;
                    }

                    console.log("Insert query done " + rows.insertId);
                    newUserMysql.userID = rows.insertId;
                    return done(null, newUserMysql);
                });

            } else {
                console.log("User found ", rows[0]);
                done(err, rows[0]);
            }
        });
    }

    function saveTwitterCallbacks(profile, token, tokenSecret, done) {
        // create the user
        var newUserMysql = new Object();

        newUserMysql.titterID = profile.id;
        newUserMysql.token = token; // use the generateHash function in our user model
        newUserMysql.tokenSecret = tokenSecret; // use the generateHash function in our user model


        function updateTokens() {
            console.log("Updating user");
            var insertQuery = "UPDATE `webRunes_Users` SET token='" + token + "',tokenSecret='" + tokenSecret + "' WHERE titterID = " + newUserMysql.titterID;
            console.log(insertQuery);
            connection.query(insertQuery, function (err, rows) {
                if (err) {
                    console.log("Update error", err);
                    done("Can't insert");
                    return;
                }

                console.log("Update query done " + rows.insertId);
                newUserMysql.id = newUserMysql.userID = rows.insertId;
                return done(null, newUserMysql);
            });
        }

        connection.query("select * from `webRunes_Users` where titterID = " + newUserMysql.titterID, function (err, rows) {
            if (err || (rows[0] == undefined)) {
                console.log("Create user request ");

                newWrioUser(profile, function (err, res) {
                    updateTokens();
                });


            } else {

                updateTokens();

            }
        });


    }



};
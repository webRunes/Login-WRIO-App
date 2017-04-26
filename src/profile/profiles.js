const {ObjectID} = require( 'mongodb');
const {Promise} = require( 'es6-promise');
const db = require( '../db');
const PassportSessions = require( '../dbmodels/session.js');
const WrioUsers = require( '../dbmodels/wriouser.js');
const {dumpError} = require( '../utils.js');
const request = require( 'superagent');
const nconf = require( '../wrio_nconf.js');
const ProfileSaverFactory = require( './ProfileSaver.js');
const logger = require( 'winston');

var requestSave = (new ProfileSaverFactory()).getRequestSave();


function generateWrioID() {
    var min = 100000000000;
    var max = 999999999999;
    var id = Math.floor(Math.random() * (max - min) + min);
    return id;
}

/* Helper func */

var checkIdExists = async (wrioID) => {
    var wrioUsers = new WrioUsers();
    try {
        await wrioUsers.getByWrioID(wrioID);
        return true;
    } catch (e) {
        return false;
    }
};

/* Creation of temporary wrioID */

var createTempAccount = async (session) => {
    var wrioUsers = new WrioUsers();
    var id = generateWrioID();
    if (await checkIdExists(id)) {
        return await createTempAccount(session); // call ourselves until we find unique ID
    } else {
        var profile = {
            wrioID: id.toString(),
            temporary: true,
            created: new Date().getTime()
        };
        logger.log("info","Creating new user profile",profile);
        var user = await wrioUsers.create(profile);
        return user;
    }
};

function hasPassportUser(request) {
    var sessionData = request.session;
    if (sessionData.passport) {
        if (sessionData.passport.user) {
            return sessionData.passport.user;
        }
    }
}

/*
 If session have no user information, then create temporary wrioID
 returns old or new wrioID
*/

var getUserOrCreateTemporary = async (ssid,request) => {

    var wrioUser = new WrioUsers();
    var sessionUser = hasPassportUser(request);
    if (sessionUser) {
        logger.log("debug","Session already have valid user, exit....");
        return await wrioUser.get({_id:ObjectID(sessionUser)});
    } else {
        var user = await createTempAccount();
        request.session.passport = { // persist newly created user into the current session
            user: user._id
        };
        await requestSave(user.wrioID);
        return user;
    }
};

module.exports = getUserOrCreateTemporary;
import {ObjectID} from 'mongodb';
import {Promise} from 'es6-promise';
import db from '../db';
import PassportSessions from '../dbmodels/session.js';
import WrioUsers from '../dbmodels/wriouser.js';
import {dumpError} from '../utils.js';
import request from 'superagent';
import nconf from '../wrio_nconf.js';
import {ProfileSaverFactory} from './ProfileSaver.js';
import logger from 'winston';

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

/*
 If session have no user information, then create temporary wrioID
 returns old or new wrioID
*/

var saveWrioIDForSession = async (ssid,request) => {

    var wrioUser = new WrioUsers();
    try {
        var sessionData = request.session;

        if (sessionData.passport) {
            if (sessionData.passport.user) {
                logger.log("debug","Session already have valid user, exit....");
                var user = await wrioUser.get({_id:ObjectID(sessionData.passport.user)});
                return user.wrioID;
            }
        }
        var user = await createTempAccount();

        request.session.passport = { // persist newly created user into the current session
            user: user._id
        };
        setTimeout(function () {
            // TODO this is just a hack, do more reliable solution
            requestSave(ssid) ;// give storage command to create S3 profile
            clearInterval(this);
        },3000);

        return user.wrioID;

    } catch (e) {
        logger.log("error","Error durion saveWrioIDForSession",e);
        dumpError(e);
    }

};

export default saveWrioIDForSession;
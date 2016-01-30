import nconf from "../wrio_nconf.js";
import saveWrioIDForSession from './profiles.js';
import WrioUsers from '../dbmodels/wriouser.js';
import db from '../db';
import {Router} from 'express';
import {dumpError} from '../utils.js';
import logger from 'winston';

export const router = Router();

var DOMAIN = nconf.get("db:workdomain");


var storagePrefix = "https://wr.io/";

function returndays(j, days, id) {
    j['url'] = storagePrefix + id + '/';
    j['cover'] = j['url'] + 'cover.htm';
    j['days'] = 30 - days;
    return j;
}

function returnPersistentProfile(j, id, name) {
    j['temporary'] = false;
    j['id'] = id;
    j['url'] = storagePrefix + id + '/';
    j['cover'] = j['url'] + 'cover.htm';
    j['name'] = name;
    return j;
}


router.get('/api/get_profile', async (request, response) => {
    response.set('Content-Type', 'application/json');
    try {
        logger.log("debug","GET_PROFILE CALLED");
        var json_resp = await CheckProfile(request);
        response.send(json_resp);
    }  catch (e) {
        logger.log("error","ERR");
        dumpError(e);
        response.status(403).send({});
    }
});



export var CheckProfile = async (request) => {
    var wrioUsers = new WrioUsers();
    logger.log("debug",request.sessionID);
    var json_resp = {
        "result": "success"
    };

    try {
        var wrioID = await saveWrioIDForSession(request.sessionID,request);
        var user = await wrioUsers.getByWrioID(wrioID);

        if (user.temporary) {
            var delta = new Date()
                    .getTime() - user.created;
            var deltadays = Math.round(delta / (24 * 60 * 60 * 1000));
            if (deltadays > 30) {
                logger.log("info","Profile expired");
                // TODO: fix delete temp profile
                profiles.deleteTempProfile(id);
            }
            logger.log("debug","Session exists", delta, deltadays);
            json_resp['temporary'] = true;
            json_resp['id'] = user.wrioID;
            returndays(json_resp, deltadays, user.wrioID);
            return json_resp;
        } else {
            return returnPersistentProfile(json_resp, user.wrioID, user.lastName);
        }

    } catch (e) {
        dumpError(e);
        return {};
    }
};




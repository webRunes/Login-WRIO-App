const nconf = require( "../wrio_nconf.js");
const getUserOrCreateTemporary = require('./profiles.js');
const WrioUsers = require( '../dbmodels/wriouser.js');
const {db} = require('wriocommon').db.db;
const {Router} = require('express');
const {dumpError} = require('wriocommon').utils;
const logger = require('winston');

const router = Router();
var DOMAIN = nconf.get("db:workdomain");
var storagePrefix = "https://wr.io/";

function getDeltaDays(user) {
    var delta = new Date().getTime() - user.created;
    var deltadays = Math.round(delta / (24 * 60 * 60 * 1000));
    if (deltadays > 30) {
        logger.log("info","Warning: profile expired");
    }
    logger.log("debug","Session exists", delta, deltadays);
    return deltadays;
}


function formatResponse(user) {
    var json_resp = {
        "result": "success"
    };
    if (user.ethereumWallet) {
        json_resp['ethereumWallet'] = user.ethereumWallet;
    }
    if (user.temporary) {
        var deltadays = getDeltaDays(user);
        json_resp['id'] = user.wrioID;
        return returnTemporaryProfile(json_resp, deltadays, user.wrioID);
    } else {
        return returnPersistentProfile(json_resp, user.wrioID, user.lastName);
    }
}

function returnTemporaryProfile(j, days, id) {
    j['url'] = storagePrefix + id + '/';
    j['cover'] = j['url'] + 'cover.htm';
    j['temporary'] = true;
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

const CheckProfile = async (request) => {
    try {
        var user = await getUserOrCreateTemporary(request.sessionID,request);
        logger.debug("Logging user", user.wrioID);
        return formatResponse(user);
    } catch (e) {
        dumpError(e);
        return {};
    }
};


router.get('/api/get_profile', async (request, response) => {
    response.set('Content-Type', 'application/json');
    try {
        logger.log("debug","GET_PROFILE CALLED");
        var json_resp = await CheckProfile(request);
        response.send(json_resp);
    }  catch (e) {
        logger.log("error",e);
        dumpError(e);
        response.status(403).send({});
    }
});

module.exports.CheckProfile = CheckProfile;

module.exports.router = router;

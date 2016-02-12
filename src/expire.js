import nconf from "./wrio_nconf.js";
import {init} from './db.js';
import Users from './dbmodels/wriouser.js';
import request from 'superagent';
import {Promise} from 'es6-promise';
import {dumpError} from './utils.js';

var DOMAIN= nconf.get("db:workdomain");

/*
import AWS from 'aws-sdk';
var keyid = nconf.get("aws:aws_access_key_id");
var secret = nconf.get("aws:aws_secret_access_key");

AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'wr.io', Key: 'test'},
});
*/
var delete_folders = (items) => {
    return new Promise((resolve,reject) => {
        var host = 'https://storage' + DOMAIN;
      //  var host = 'http://localhost:5002';
        request.post(host+'/api/delete_folder')
            .set('Content-Type', "application/json")
            .auth(nconf.get("service2service:login"), nconf.get("service2service:password"))
            .send(JSON.stringify({"items":items}))
            .end((err,res) => {
                if (err) {
                    return reject(err);
                }
                console.log(res.body);
                resolve();
            });
    });
};

function getExpireThreshold() {
    return new Date().getTime() - 30 * 24 * 60 * 60 * 1000;  // 30 days
}
function getAge(item) {
    return Math.round(( new Date().getTime() - item.created) / (1000 * 60 * 60*24));
}

export var expire = async (db) => {

    try {
        await doExpire(db);
    } catch (err) {
        dumpError(err);
    }
};

var doExpire = async (db) => {

    console.log("Expiring profiles");

    var db = await init();
    var WrioUsers = new Users();
    var thresh = getExpireThreshold();

    var query = {
        temporary: true,
        created: {$lt: thresh}
    };

    var expired_users = await WrioUsers.getAllUsers(query);
    var ids = expired_users.map(item => {
        console.log(item.wrioID, getAge(item));
        return item.wrioID;
    });
    await delete_folders(ids);
    await WrioUsers.deleteUsers(query);

    db.close();
    return;

};

const nconf = require( "./wrio_nconf.js");
const {init} = require( 'wriocommon').db;
const Users = require( './dbmodels/wriouser.js');
const request = require( 'superagent');
const {dumpError} = require('wriocommon').utils;

/*
import AWS = require( 'aws-sdk';
var keyid = nconf.get("aws:aws_access_key_id");
var secret = nconf.get("aws:aws_secret_access_key");

AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'wr.io', Key: 'test'},
});
*/
var delete_folders = (items) => {
    return new Promise((resolve,reject) => {
        var host = 'https://storage.wrioos.com';
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
    return new Date().getTime() - 7 * 24 * 60 * 60 * 1000;  // 7 days
}
function getAge(item) {
    return Math.round(( new Date().getTime() - item.created) / (1000 * 60 * 60*24));
}

module.exports = async (db) => {

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

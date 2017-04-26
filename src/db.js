const {MongoClient,ObjectID} = require('mongodb');
const nconf = require('./wrio_nconf');
const {Promise} = require('es6-promise');
const logger = require('winston');

var db = {
    db: {},
    ObjectID: ObjectID,
};

var init = async () => {
    let url;
    logger.log('debug',"ENV:",process.env.NODE_ENV);

    if (process.env.NODE_ENV == 'testing') {
        logger.log('info',"Mongodb testing mode entered");
        url = 'mongodb://mongo:27017/webrunes_test';
    } else {
        logger.log('info',"Normal mongodb mode entered");
        let host = nconf.get('mongo:host');
        let user = nconf.get('mongo:user');
        let password = nconf.get('mongo:password');
        let mongodbname = nconf.get('mongo:dbname');
        if (user) {
            url = `mongodb://${user}:${password}@${host}/${mongodbname}`;
        } else {
            url = `mongodb://${host}/${mongodbname}`;
        }
    }
    let database = await MongoClient.connect(url);
    db.db = database;
    return database;
};

db.init = init;

module.exports = db;
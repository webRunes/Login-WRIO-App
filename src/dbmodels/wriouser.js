/**
 * WRIO user db model
 * Created by michbil on 26.09.15.
 */

const db = require('wriocommon').db.getInstance();
const uuid = require('node-uuid');
const logger = require('winston');


class WebRunesUsers {
    constructor() {
        this.users = db.collection('webRunes_Users');
    }

    get(query) {
        return new Promise((resolve,reject) =>{
            this.users.findOne(query,function (err,data) {
                if (err) {
                    logger.log('error',"Db user search error");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user not found for',query);
                    reject('User not found');
                    return;
                }
                resolve(data);
            });
        });
    }

    getByWrioID(wrioID) {
        return new Promise((resolve,reject) =>{
            this.users.findOne({wrioID:wrioID},function (err,data) {
                if (err) {
                    logger.log('error',"Db user search error");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user not found');
                    reject('User not found '+wrioID);
                    return;
                }
                resolve(data);
            });
        });
    }

    getByEthereumWallet(wallet) {
        return new Promise((resolve,reject) =>{
            this.users.findOne({ethereumWallet:wallet},function (err,data) {
                if (err) {
                    logger.log('error',"Db user search error");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user not found');
                    reject('User not found '+wrioID);
                    return;
                }
                resolve(data);
            });
        });
    }

    getAllUsers(query) {
        query = query || {};
        return new Promise((resolve,reject) =>{
            this.users.find(query).toArray(function (err,users) {
                if (err) {
                    logger.log('error',"Db user search error");
                    reject(err);
                    return;
                }
                if (!users) {
                    logger.log('debug','Db user not found');
                    reject('Users not found');
                    return;
                }
                resolve(users);
            });
        });
    }


    deleteUsers(query) {
        query = query || {};
        return new Promise((resolve,reject) =>{
            this.users.remove(query,function (err) {
                if (err) {
                    logger.log('error',"Db user delete error");
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async updateByWrioID(wrioID, data) {
        return await this.update({wrioID:wrioID},data);
    }

    update(query, data) {
        return new Promise((resolve,reject) =>{
            this.users.updateOne(query, {$set:data}, function (err,data) {
                if (err) {
                    logger.error("Db user update error",err);
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user not found');
                    reject('User not found '+wrioID);
                    return;
                }
                resolve(data);
            });
        });
    }

    createByWrioID(wrioID, data) {
        return new Promise((resolve,reject) =>{
            this.users.updateOne({wrioID:wrioID},{$set:data},{upsert:true},function (err,data) {
                if (err) {
                    logger.log('error',"Db user search error");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user not found');
                    reject('User not found '+wrioID);
                    return;
                }
                resolve(data);
            });
        });
    }

    create(data) {
        return new Promise((resolve,reject) =>{
            this.users.insert(data,function (err,data) {
                if (err) {
                    logger.log('error',"Db user create error");
                    reject(err);
                    return;
                }
                if (!data) {
                    logger.log('debug','Db user create failed');
                    reject('User not found ');
                    return;
                }

                resolve(data.ops[0]);
            });
        });
    }

    /* create pre payment */
    createPrepayment(wrioID,amount,to) {
        return new Promise ((resolve,reject) => {

            this.users.updateOne({wrioID:wrioID},
                {
                    $inc:{
                      dbBalance:-amount
                    },
                    $push:{
                        prepayments: {
                            id: uuid.v1(),
                            amount: amount,
                            timestamp: new Date(),
                            to:to

                        }
                    }
                },
                (err,data) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!data) {
                        return reject("User not found");
                    }
                    logger.log('debug','Makeprepayment result',data);
                    resolve(data);
            });
        });
    }

    /*
    * Cancel pre payment, both if timeout passed or money on account arrived
    * make sure, that amount is correct value
    * */
    cancelPrepayment(wrioID,id,amount) {
        return new Promise ((resolve,reject) => {

            this.users.updateOne({wrioID:wrioID},
                {
                    $inc:{
                        dbBalance:amount
                    },
                    $pull:{
                        prepayments: {
                            id: id
                        }
                    }
                },
                (err,data) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!data) {
                        return reject("User not found");
                    }
                    //logger.log('debug','cancelPrepayment result',data);
                    resolve(data);
                });
        });
    }

    /*
     This method is uses before each unit test is taken to clear db
     */

    clearTestDb() {
        return new Promise((resolve,reject) => {

              //  logger.log('debug',db);

            if (db.s.databaseName != "webrunes_test") {
                return reject("Wipe can be made only on test db");
            }
            this.users.remove({},(err) => {
                if (err)  {
                    return reject(err);
                }
                resolve("Wipe ok");
            });
            }

        );
    }

}

module.exports =  WebRunesUsers;
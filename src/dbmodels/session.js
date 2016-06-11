/**
 * Created by michbil on 15.12.15.
 */
import database from '../db';
import {Promise} from 'es6-promise';
import logger from 'winston';

let db;

class PassportSessions {
    constructor() {
        db = database.db;
        this.sessions = db.collection('sessions');
    }

    /* finds session by ssid */

    findSession(ssid) {
        return new Promise((resolve,reject) => {
            this.sessions.findOne({_id:ssid}, (err,res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    /* updates session by ssid, saves sessionpayload json into session */

    updateSession(ssid,sessionPayload) {
        logger.log("debug","Saving session",ssid,sessionPayload);
        return new Promise((resolve,reject) => {
            var item = {
                session: JSON.stringify(sessionPayload)
            };
            this.sessions.updateOne({_id: ssid}, item, (err, res) => {
                if (err) {
                    return reject(err);
                }
                logger.log("debug",'success');
                resolve();
            });
        });
    }
}

export default PassportSessions;
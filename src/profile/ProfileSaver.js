/**
 * Created by michbil on 15.01.16.
 */

import request from 'superagent';
import nconf from '../wrio_nconf.js';
import logger from 'winston';
import {Promise} from 'es6-promise';

export class ProfileSaverFactory {
    constructor () {
        this.isInTest = typeof global.it === 'function';
        logger.log("debug","Mock:", this.isInTest);
    }

    getRequestSave() {
        if (this.isInTest) {
            return this.requestSaveMock;
        } else {
            return this.requestSave.bind(this);
        }
    }

    getStorageUrl(wrioID) {
        var proto = 'https:';
        var workdomain = nconf.get('server:workdomain');

        if (workdomain == '.wrioos.local') {
           proto = 'http:';
        }

        let api_request = proto + "//storage" + workdomain + '/api/save_templates?wrioID='+wrioID;
        logger.log("debug","Sending save profile request",api_request);
        return api_request;
    }

    requestSaveMock (sid) {
        logger.log("debug","Mocking profile save",sid);
    }

    requestSave  (wrioID) {
        return new Promise((resolve,reject) => {
            request.
                get(this.getStorageUrl(wrioID))
                .auth(nconf.get("service2service:login"), nconf.get("service2service:password"))
                .end((err,result) => {
                if (err) {
                    logger.log("error",err);
                    return reject(err);
                }
                logger.log("silly","Request save result",result.body);
                resolve();
            });
        });

    };

}

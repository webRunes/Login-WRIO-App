/**
 * Created by michbil on 15.01.16.
 */

import request from 'superagent';
import nconf from '../wrio_nconf.js';
import logger from 'winston';


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

    getStorageUrl(sid) {
        var proto = 'https:';
        var workdomain = nconf.get('server:workdomain');

        logger.log("debug",sid); // TODO: change to safer auth method

        if (workdomain == '.wrioos.local') {
           proto = 'http:';
        }

        let api_request = proto + "//storage" + workdomain + '/api/save_templates?sid='+sid;
        logger.log("debug","Sending save profile request",api_request);
        return api_request;
    }

    requestSaveMock (sid) {
        logger.log("debug","Mocking profile save",sid);
    }

    requestSave  (sid) {
        request.get(this.getStorageUrl(sid)).end((err,result) => {
            if (err) {
                logger.log("error",err);
                return;
            }
            logger.log("silly","Request save result",result.body);
        });
    };

}

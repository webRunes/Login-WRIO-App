/**
 * Created by michbil on 15.01.16.
 */

import request from 'superagent'
import nconf from '../wrio_nconf.js'

/* Save template records for the user to S3 */

var requestSave = (sid) => {
    console.log(sid); // TODO: change to safer auth method
    let api_request = "http://storage"+nconf.get('server:workdomain')+'/api/save_templates?sid='+sid;
    console.log("Sending save profile request",api_request);
    request.get(api_request).end((err,result) => {
        if (err) {
            console.log(err);
            return
        }
        //console.log("Request save result",result.body);
    });
};

/* Mock save template records for the user to S3 for unitTesing purposes */

var requestSaveMock = (sid) => {
    console.log("Mocking profile save")
};

export class ProfileSaverFactory {
    constructor () {
        this.isInTest = typeof global.it === 'function';
        console.log("Mock:", this.isInTest);
    }
    getRequestSave() {
        if (this.isInTest) {
            return requestSaveMock;
        } else {
            return requestSave;
        }
    }
}

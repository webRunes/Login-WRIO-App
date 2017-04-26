const request = require('supertest');
const assert = require('assert');
const should = require('should');
const app = require('../src/index.js');
const nconf = require('nconf');

var ready = false;
app.ready = () => {
    ready = true;
};

var waitdb = () => {
    return new Promise((resolve,reject) => {
        setInterval(function () {
            if (ready) {
                console.log("App ready, starting tests");
                resolve();
                clearInterval(this);
            }
        }, 1000);
    });
};


describe("API unit tests", () => {

    before(async () => {
        await waitdb();
    });

    it("should return default page", (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });

    it("should return user temporary profile via api", (done) =>{
        request(app)
            .get('/api/get_profile')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) throw err;
                var resp = res.body;
                console.log(resp);

                should(resp).have.property("result", "success");
                should(resp).have.property("temporary", true);
                should(resp).have.property("days", 30);

                var id = resp.id.toString();
                should(id.length).equal(12); // there must be 12 digit id

                done();
            });
    });

    it("should set CORS headers",(done)=> {

        var rundomain = 'https://core'+nconf.get('server:workdomain');

        request(app)
            .get('/api/get_profile')
            .set('origin', rundomain)
            .expect(200)
            .expect('Access-Control-Allow-Origin', rundomain)
            .end(done);
    });

    it("should return profile via twitter button iframe page", (done)=>{
        request(app)
            .get('/buttons/twitter')
            .expect(200)
            .end((err,res) => {
                var resp = res.body;
                should(resp).match(/profile/);
                done();
            });
    });

});




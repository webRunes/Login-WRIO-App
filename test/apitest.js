import request from 'supertest';
import assert from 'assert';
import should from 'should';
import app from '../src/index.js';

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

    it("shoud return profile via twitter button iframe page", (done)=>{
        request(app)
            .get('/buttons/twitter')
            .expect(200)
            .end((err,resp) => {
                var resp = res.body;
                should(resp).match(/profile/);

            });
    });

});




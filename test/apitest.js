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
        setInterval(() => {
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
        console.log("First test");
        request(app)
            .get('/')
            .expect(200, done);
    });

    it("should return user temporary profile via api", (done) =>{
        request(app)
            .post('/api/get_profile')
            .expect('Content-Type', /json/)
            .expect(200)
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

});




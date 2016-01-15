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
        request(app)
            .get('/')
            .expect(200, done);
    });

    it("/create should return core.htm page", (done) => {
        request(app)
            .get('/create')
            .expect(200, done);
    });

    it("/edit should return core.htm page", (done) => {
        request(app)
            .get('/edit')
            .expect(200, done);
    });

    after(()=>{

    });
});




/**
 * Created by michbil on 11.02.16.
 */

const expire = require('./src/expire');
expire.expire().then(function () {
   console.log("Expire finished");
}).catch(function (err) {
    console.log(err);
});
import bodyParser from 'body-parser';
import nconf from 'nconf';
import logger from 'winston';

var exports = module.exports = {};

exports.init = function (express) {
    var app = express();

    app.use(function (request, response, next) {
        var host = request.get('origin');
        if (host == undefined) host = "";
        logger.log('debug','Got host:',host);

        var domain = nconf.get("db:workdomain");

        if (host.match(/^localhost:[0-9]+$/m)) {
            response.setHeader('Access-Control-Allow-Origin', host);
            logger.log("debug","Allowing CORS for localhost");
        }

        domain = domain.replace(/\./g,'\\.')+'$';
        logger.log('silly',domain);

        if (host.match(new RegExp(domain,'m'))) {
            response.setHeader('Access-Control-Allow-Origin', host);
            logger.log("debug","Allowing CORS for webrunes domains");
        } else {
            logger.log("debug",'host not match');
        }

        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        response.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    return app;
};

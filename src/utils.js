/**
 * Created by michbil on 13.09.15.
 */
const logger = require( 'winston');

module.exports = function dumpError(err) {
    if (!err) return;
    if (typeof err === 'object') {
        if (err.message) {
            logger.log('error','\nMessage: ' + err.message);
        }
        if (err.stack) {
            logger.log('error','\nStacktrace:');
            logger.log('error','====================');
            logger.log('error',err.stack);
        }
    }
}

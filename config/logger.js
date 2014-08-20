/**
 * Created by nrkim on 2014. 8. 14..
 */
var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level : 'debug'			//error level 로하면 info 안보임
        }),
        new winston.transports.DailyRotateFile({
            level : 'error',
            filename : 'log/app-debug-log',
            datePattern : '.yyyy-MM-ddTHH-mm.log',
            maxsize : 1024 * 1024
        })
    ]
});

module.exports = logger;
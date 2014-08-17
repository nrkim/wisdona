/**
 * Created by nrkim on 2014. 8. 18..
 */
var schedule = require('node-schedule')
    ,logger = require('../config/logger')
    ,template_item = require('./template').template_item;


exports.auth_token_cron = function(){
    var scheduledRule1 = new schedule.RecurrenceRule();
    scheduledRule1.minute = 6;
    var scheduledJob2 = schedule.scheduleJob(scheduledRule1,
        function(){
            template_item(
                "DELETE FROM email_auth WHERE auth_id IN ( " +
                    "SELECT * FROM ( " +
                    "SELECT a.auth_id FROM email_auth a WHERE expiration_date < NOW()) " +
                    "AS TEMP )",
                null,
                function(err,rows,msg){
                    if(err) { logger.info('error occured',err.message); }
                    else {logger.info('this rule executes the function every at 52 minutes after the hour');}
                }
            )
        }
    );

}

/**
 * Created by onam on 2014. 8. 11..
 */
    config/gcm.js------------------------------
    module.exports = {
    apikey: '님꺼'

};



routs/index.js--------------------------------
var gcm = require('node-gcm'),
    gcmConfig = require('../config/gcm');

function registerId(req, res){
    connectionPool.getConnection(function(err, connection){
        if(err){
            res.json({error: err});
        }else{
            var updateSql = 'UPDATE users SET gcm_registration_id = ? WHERE id = ?';
            var registrationId = req.body.registrationId;
            connection.query(updateSql, [registrationId, req.user.id], function(err, result){
                if(err){
                    connection.release();
                    res.json({error: err});
                }else{
                    connection.release();
                    res.json({result: "Registration successful!!!"});
                }
            });
        }
    });
}

exports.sendMessage = function (req, res) {

};
function sendMessage(req, res){
    var message = new gcm.Message();
    message.addDataWithKeyValue('Key1', 'message1');
    message.addDataWithKeyValue('Key2', 'message2');
    message.collapseKey = 'demo';
    message.delayWhileIdle = true;
    message.timeToLive = 3;
    message.dryRun = true;

    var sender = new gcm.Sender(gcmConfig.apikey);
    var registrationIds = [];
    registrationIds.push('regId1');
    registrationIds.push('regId2');

    sender.send(message, registrationIds, 4, function(err, result){
        console.log(result);
    });
}
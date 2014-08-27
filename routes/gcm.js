/**
 * Created by onam on 2014. 7. 29..
 * email : nicekon@gmail.com
 */

var gcm = require('node-gcm'),
    gcmConfig = require('../config/gcm'),
    async = require('async'),
    logger = require('../config/logger');


// 유저 Device Id 업데이트
exports.updateDeviceId = function(user_id, userDeviceId, callback){
    if ( !userDeviceId) callback();
    
    connectionPool.getConnection(function(err, connection){
        if(err){
            callback(err);
        }else{
            var query = 'UPDATE users SET gcm_registration_id = ? WHERE user_id = ?';
            connection.query(query, [userDeviceId, user.id], function(err, result){
                if(err){
                    connection.release();
                    callback(err);
                }else{
                    connection.release();
                    callback();
                }
            });
        }
    });
};

// GCM 보내기
exports.sendMessage = function (userDeviceIds, userPushSettings, code, title, msg, callback ) {
    var type;
    if ( code == 2 ) type = 1;
    else type = 0;

    var message = new gcm.Message();
    message.addDataWithKeyValue('title', title);
    message.addDataWithKeyValue('message', msg);
    message.addDataWithKeyValue('type', type);
    message.collapseKey = 'wisdona';
    message.delayWhileIdle = true;
    message.timeToLive = 3;
   // message.dryRun = true;

    // 0. 요청
    // 1. 요청
    // 2. 평가
    // 3. 배송완료
    // 4. 철회
    // 5. 메시지

    // 사용자 별 푸쉬 설정에 따라 제외할 사람 빼기
    var sendUserDeviceIds = [];
    for(var i=0; i<userDeviceIds.length; i++){
        var pushSetting = userPushSettings[i].split(',');
        logger.debug('pushSetting', pushSetting);
        // 해당 푸쉬설정이 false이면 해당 사용자 제외
        if ( pushSetting[code] != 0 ){
            sendUserDeviceIds.push(userDeviceIds[i]);
        }
    }
    logger.debug('--------------------------------------------------------------------');
    logger.debug(sendUserDeviceIds);
    logger.debug('--------------------------------------------------------------------');
    var sender = new gcm.Sender(gcmConfig.apikey);

    sender.send(message, sendUserDeviceIds, 4, function(err, result){
        if (err){
            logger.error('GCM Error!!',result);
            callback(err);
        }else{
            if (result.success != 0 ){
                logger.debug('GCM Success!!!',result);
            }else{
                logger.debug('GCM failure!!!',result);
            }

            callback(null, result);
        }
    });
};
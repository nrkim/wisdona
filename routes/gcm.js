/**
 * Created by onam on 2014. 8. 11..
 */
var gcm = require('node-gcm'),
    gcmConfig = require('../config/gcm'),
    async = require('async');

// 유저 Device Id 업데이트
exports.updateDeviceId = function(user_id, userDeviceId, callback){
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
}

// 유저 Device Id 가져오기
function getUserDeviceID(user_id,  callback) {
    connectionPool.getConnection(function(err, connection){
        if(err){
            callback(err);
        }else{
            var query = 'SELECT gcm_registration_id FROM users WHERE user_id = ?';
            connection.query(query, [user_id], function(err, rows, fields){
                if(err){
                    connection.release();
                    callback(err);
                }else{
                    connection.release();
                    if ( rows.length ){
                        callback(null, rows[0].gcm_registration_id);
                    }else{
                        callback(new Error('해당 사용자가 없습니다.'));
                    }
                }
            });
        }
    });
}

// GCM 보내기
exports.sendMessage = function (userDeviceId, title, msg, callback ) {
    var message = new gcm.Message();
    message.addDataWithKeyValue('wisdona', title);
    message.addDataWithKeyValue('message', msg);
    message.collapseKey = 'wisdona';
    message.delayWhileIdle = true;
    message.timeToLive = 3;
   // message.dryRun = true;

    var sender = new gcm.Sender(gcmConfig.apikey);
//    var registrationIds = [];

    sender.send(message, userDeviceId, 4, function(err, result){
        if (err){
            console.log('console.log!!!');
            callback(err);
        }else{
            console.log('result is ...',result);
            callback();
        }
    });

    /*
    async.each(userDeviceIds,
        function (deviceId, cb) {
            sender.send(message, deviceId, 4, function(err, result){
                if (err){
                    cb(err);
                }else{
                    cb();
                }
            });
        },
        function (err) {
            if(err){
                callback(err);
            }else{
                callback();
            }
        }
    );
*/




    // 디바이스 아이디 등록
//    async.each(users,
//        function (user_id, cb) {
//            var userDeviceId = getUserDeviceID(user_id, function (err, userDeviceId) {
//                if (err){
//                    // 에러처리
//                    cb(err);
//                }else{
//                    registrationIds.push(userDeviceId);
//                    cb();
//                }
//            });
//        },
//        function (err) {
//            if(err){
//                callback(err);
//            }else{
//                sender.send(message, registrationIds, 4, function(err, result){
//                    if (err){
//                        callback(err);
//                    }else{
//                        callback();
//                    }
//                });
//            }
//        }
//    );
};
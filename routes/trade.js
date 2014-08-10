/**
 * Created by nrkim on 2014. 7. 29..
 */
var async = require('async');
var message = require('./message');

// 출력 JSON
function getJsonData( code, message, result ){
    var data = {
        code : code,
        message : message,
        result: result
    };

    return data;
}

exports.sendRequestPost = function(req,res){
    var user_id = req.params.user_id,
        post_id = req.body.post_id;


    // 파라미터 체크
    if ( !user_id || !post_id  ){
        return res.json(getJsonData(0, '값이 없습니다.', null));
    }

    // 쿼리 요청
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(getJsonData(0, 'DB 오류', null));
        }

        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                return res.json(getJsonData(0, err.message, null));
            }

            var query;
            var data;
            async.waterfall([
                function (callback) {

                    // 거래 테이블 생성
                    query = "INSERT INTO trade SET ?";
                    data = {req_user_id:user_id, post_id:post_id};
                    connection.query(query, data, function (err, result) {
                        if (err) {
                            callback(err);
                        }

                        callback(null, result.insertId);
                    });
                },
                function (trade_id, callback) {
                    // 거래 로그 추가 : 요청완료(요청자)
                    query = "INSERT INTO trade_log SET ?";
                    data = {trade_id:trade_id, trade_status_id:1};
                    connection.query(query, data, function (err, result) {
                        if (err) {
                            callback(err);
                        }
                        callback(null, trade_id);
                    });

                }

            ], function (err, trade_id) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        return res.json(getJsonData(0, err.message, null));
                    });
                }
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.json(getJsonData(0, err.message, null));
                        });
                    }
                    connection.release();
                    // trade_id로 요청 메시지 보내기
                    req.params.trade_id = trade_id;
                    req.body.message = "요청 신청 합니다.";
                    message.createMessage(req,res);

                });
            });
        });
    });
};

exports.acceptPost = function(req,res){

    // 요청자/기부자 판별
    // 1. 게시물 + trade



};

exports.cancelPost = function(req,res){



};
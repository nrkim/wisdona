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

            // 게시물 작성자와 요청한 사람이 같은지 체크
            // 이미 거래중인지 체크

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
                        }else{
                            callback(null, result.insertId);
                        }
                    });
                },
                function (trade_id, callback) {
                    // 거래 로그 추가 : 요청완료(요청자)
                    query = "INSERT INTO trade_log SET ?";
                    data = {trade_id:trade_id, trade_status_id:1};
                    connection.query(query, data, function (err, result) {
                        if (err) {
                            callback(err);
                        }else{
                            callback(null, trade_id);
                        }
                    });
                }
            ], function (err, trade_id) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        res.json(getJsonData(0, err.message, null));
                    });
                }else{
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                res.json(getJsonData(0, err.message, null));
                            });
                        }else{
                            connection.release();
                            // trade_id로 요청 메시지 보내기
                            //req.params.trade_id = trade_id;
                            //req.body.message = "배송지 정보는 아래와 같습니다.";
                            //message.createMessage(req,res);

                            res.json(getJsonData(1, "success", null));
                        }
                    });
                }
            });
        });
    });
};

exports.acceptPost = function(req,res){

    // 요청자/기부자 판별
    // 1. 게시물 + trade

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
                res.json(getJsonData(0, err.message, null));
            }else{
                var query;
                var data;
                async.waterfall([
                    function (callback) {

                        // 거래 테이블 생성
                        query =
                            "SELECT p.user_id, t.trade_id, t.req_user_id, t.current_status " +
                            "FROM post p " +
                            "LEFT JOIN (SELECT trade_id, post_id, current_status, req_user_id FROM trade WHERE current_status NOT IN(92, 91)) t ON p.post_id = t.post_id " +
                            "WHERE p.post_id = ?;";
                        data = [post_id];
                        connection.query(query, data, function (err, rows, fields) {
                            if (err) {
                                callback(err);
                            }else{
                                if ( rows ){
                                    if ( rows[0].req_user_id ){
                                        callback(null, rows);
                                    }else{
                                        callback(new Error("거래 데이터가 없습니다."));
                                    }
                                }else{
                                    callback(new Error("게시물 데이터가 없습니다."));
                                }
                            }
                        });
                    },
                    function (rows, callback) {

                        // 다음 거래 단계 파악
                        var next_status;
                        if ( user_id == rows[0].user_id ){
                            // 기부자
                            switch (rows[0].current_status) {
                                case 1 :
                                    // 요청완료
                                    next_status = 2;
                                    req.body.message = "배송을 완료 했습니다.";
                                    break;
                                case 2 :
                                    // 배송완료
                                    next_status = 3;
                                    req.body.message = "평가를 완료 했습니다.";
                                    break;
                                case 4 :
                                    // 수령완료 & 평가완료(요청자)
                                    next_status = 5;
                                    req.body.message = "평가를 완료 했습니다.";
                                    break;
                                default :
                                    return callback(new Error("작성자 요청 : 값이 잘못되었거나 다음 단계로 진행할 수 없습니다"));
                                    break;
                            }
                        }else if ( user_id == rows[0].req_user_id ) {
                            // 요청자
                            switch (rows[0].current_status) {
                                case 2 :
                                    // 배송완료
                                    next_status = 4;
                                    req.body.message = "수취 확인 및 평과 완료.";
                                    break;
                                case 3 :
                                    // 평가완료(기부자)
                                    next_status = 5;
                                    req.body.message = "수취 확인 및 평과 완료.";
                                    break;
                                default :
                                    return callback(new Error("요청자 요청 : 값이 잘못되었거나 다음 단계로 진행할 수 없습니다"));
                                    break;
                            }
                        }else{
                            return callback(new Error("user_id 값이 잘못 되었습니다."));
                        }

                        // 거래 단계 변경
                        query = "UPDATE trade SET current_status = ? WHERE trade_id = ?";
                        data = [next_status,rows[0].trade_id];
                        connection.query(query, data, function (err, result) {
                            if (err) {
                                callback(err);
                            }else{
                                req.params.trade_id = rows[0].trade_id;
                                callback(null);
                            }
                        });
                    }

                ], function (err) {
                    console.log("마지막 단계");
                    if (err) {
                        console.log("에러 발생!!" + err.message);
                        connection.rollback(function () {
                            console.log("롤백!!");
                            connection.release();
                            res.json(getJsonData(0, err.message, null));
                        });
                    }else{
                        connection.commit(function (err) {
                            if (err) {
                                console.log("커밋 에러!!" + err.message);
                                connection.rollback(function () {
                                    connection.release();
                                    return res.json(getJsonData(0, err.message, null));
                                });
                            }

                            console.log("커밋 완료!!");
                            connection.release();

                            // trade_id로 요청 메시지 보내기
                            //message.createMessage(req,res);

                        });
                    }
                });
            }
        });
    });

};

exports.cancelPost = function(req,res){



};
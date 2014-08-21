/**
 * Created by nrkim on 2014. 7. 29..
 */
var async = require('async');
var message = require('./message');
var post = require('./post');
var gcm = require('./gcm');;

// 출력 JSON
function getJsonData( code, message, result ){
    var data = {
        code : code,
        message : message,
        result: result
    };

    return data;
}

// 커넥션 풀, 트랜잭션 셋팅
function getConnection(callback) {
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(getJsonData(0, 'DB 오류', null));
        }else{
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    res.json(getJsonData(0, err.message, null));
                } else {
                    callback(connection);
                }
            });
        }
    });
}

// trade_log 인설트
function insertTradeLog(connection, trade_id, trade_status_id, callback) {
    var query = "INSERT INTO trade_log SET ?";
    var data = {trade_id:trade_id, trade_status_id:trade_status_id};
    connection.query(query, data, function (err, result) {
        if (err) {

            callback(err);
        }else{

            callback();
        }
    });
}

// trade 상태 업데이트
function updateTrade(connection, trade_id, status_id, callback) {
    var query = "UPDATE trade SET current_status = ? WHERE trade_id = ?";
    var data = [status_id,trade_id];
    connection.query(query, data, function (err, result) {
        if (err) {
            callback(err);
        }else{
            callback();
        }
    });
}


exports.sendRequestPost = function(req,res){
    logger.debug('/--------------------------------------- start ----------------------------------------/');
    logger.debug('/ 교환 요청 : ', {user_id:req.params.user_id, post_id : req.body.post_id});


    // 쿼리 요청
    getConnection(function (connection) {

        // 게시물 작성자와 요청한 사람이 같은지 체크
        // 이미 거래중인지 체크

        var query;
        var data;
        async.waterfall([
            function (callback) {

                // 거래 테이블 생성
                query = "INSERT INTO trade SET ?";
                data = {req_user_id:req.params.user_id, post_id : req.body.post_id};

                connection.query(query, data, function (err, result) {
                    if (err) {
                        callback(err);
                    }else{
                        callback(null, result.insertId);
                    }
                });
            },
            function (trade_id, callback) {
                async.parallel([
                    function (cb) {
                        // 책갈피 회수
                        query = "UPDATE user SET bookmark_total_cnt = bookmark_total_cnt - 1 WHERE bookmark_total_cnt > 0 AND user_id = ?;";
                        data = [req.params.user_id];

                        connection.query(query, data, function (err, result) {
                            if (err) {
                                cb(err);
                            }else{
                                if ( !result.affectedRows ) {
                                    err = new Error('책갈피가 부족합니다.');
                                    err.code = 99;
                                    cb(err);
                                }else{
                                    cb();
                                }
                            }
                        });
                    },
                    function (cb) {
                        // 거래 로그 추가 : 요청완료(요청자)
                        insertTradeLog(connection, trade_id, 1, function (err) {
                            if(err) cb(err);
                            else cb();
                        })
                    },
                    function (cb) {
                        req.params.trade_id = trade_id;
                        req.body.message = req.params.user_id + '님이 책을 요청하셨습니다.';
                        // 메시지 전송
                        message.createMessage(req, connection, function (err, result) {
                            if(err) cb(err);
                            else cb();
                        });
                    }
                ], function (err) {
                    if(err) callback(err);
                    else callback();
                })
            }
        ], function (err) {
            if (err) {
                connection.rollback(function () {
                    connection.release();

                    res.json(getJsonData(err.code || 0, err.message, null));

                });


                logger.error('/ 교환 요청 error : ', err.message);
                logger.error('/---------------------------------------- end -----------------------------------------/');

            }else{
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            res.json(getJsonData(0, err.message, null));
                        });
                    }else{
                        connection.release();

                        var result = {message:req.body.message};
                        res.json(getJsonData(1, "success", result));


                        // GCM 전송
                        query = "SELECT gcm_registration_id FROM user WHERE user_id = ?;";
                        data = [req.params.user_id];
                        connection.query(query, data, function (err, rows, fields) {
                            if (err) {
                                logger.error('교환 요청 GCM 에러!', err.message);
                            }else{
                                gcm.sendMessage([rows[0].gcm_registration_id], '위즈도나', req.body.message, 0, function (err) {
                                    // 완료
                                    if(err){
                                        logger.error('교환 요청 GCM error :', err);
                                    }else{
                                        logger.debug('교환 요청 GCM 성공!');
                                    }
                                });
                            }
                        });
                        logger.debug('/.');
                        logger.debug('/.');
                        logger.debug('/교환 요청 성공!');
                        logger.debug('/---------------------------------------- end -----------------------------------------/');
                    }
                });
            }
        });
    });

};

exports.acceptPost = function(req,res){
    logger.debug('/--------------------------------------- start ----------------------------------------/');
    logger.debug('/ 거래 단계별 수락 : ', {user_id:req.params.user_id, post_id : req.body.post_id});

    // 요청자/기부자 판별
    // 1. 게시물 + trade

    // 파라미터 체크
    if ( !req.params.user_id || !req.body.post_id  ){
        res.json(getJsonData(0, '값이 없습니다.', null));
    }else{
        getConnection(function (connection) {
            var query;
            var data;
            async.waterfall([
                function (callback) {

                    // 게시물 + 거래 테이블 조회
                    query =
                        "SELECT p.user_id, t.trade_id, t.req_user_id, t.current_status " +
                        "FROM post p JOIN trade t ON p.post_id = t.post_id " +
                        "WHERE p.post_id = ? and t.current_status NOT IN(92, 91);";
                    data = [req.body.post_id];
                    connection.query(query, data, function (err, rows, fields) {
                        if (err) {
                            callback(err);
                        }else{
                            if ( rows ){
                                if ( rows[0].current_status == 5){
                                    callback(new Error('해당 거래는 종료되었습니다.'));
                                }else{
                                    callback(null, rows);
                                }

                            }else{
                                callback(new Error("게시물 데이터가 없습니다."));
                            }
                        }
                    });
                },
                function (rows, callback) {
                    console.log(rows);
                    // 다음 거래 단계 파악
                    var status_id;
                    if ( req.params.user_id == rows[0].user_id ){
                        req.body.to_user_id = req.params.user_id;
                        // 기부자
                        switch (rows[0].current_status) {
                            case 1 :
                                // 요청완료
                                status_id = 2;
                                req.body.message = "책을 발송하였습니다.";
                                break;
                            case 2 :
                                // 평가완료(기부자)
                                status_id = 3;
                                //req.body.message = "평가를 완료 했습니다.";
                                break;
                            case 4 :
                                // 완료
                                status_id = 5;
                                //req.body.message = "평가를 완료 했습니다.";
                                break;
                            default :
                                return callback(new Error("작성자 요청 : 값이 잘못되었거나 다음 단계로 진행할 수 없습니다"));
                                break;
                        }
                    }else if ( req.params.user_id == rows[0].req_user_id ) {
                        req.body.to_user_id = rows[0].req_user_id;
                        // 요청자
                        switch (rows[0].current_status) {
                            case 2 :
                                // 수취 및 평가완료(요청자)
                                status_id = 4;
                                //req.body.message = "수취 확인 및 평과 완료.";
                                break;
                            case 3 :
                                // 완료
                                status_id = 5;
                                //req.body.message = "수취 확인 및 평과 완료.";
                                break;
                            default :
                                return callback(new Error("요청자 요청 : 값이 잘못되었거나 다음 단계로 진행할 수 없습니다"));
                                break;
                        }
                    }else{
                        return callback(new Error("user_id 값이 잘못 되었습니다."));
                    }

                    async.parallel([
                        function (cb) {
                            // 거래 단계 변경
                            updateTrade(connection, rows[0].trade_id, status_id, function (err) {
                                if (err) {
                                    cb(err);
                                }else{
                                    //req.params.trade_id = rows[0].trade_id;
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            // 거래 기록 추가(기부자 철회)
                            insertTradeLog(connection, rows[0].trade_id, status_id, function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            if ( status_id == 2 ){
                                req.params.trade_id = rows[0].trade_id;
                                // 메시지 전송
                                message.createMessage(req, connection, function (err, result) {
                                    if(err) cb(err);
                                    else cb();
                                });
                            }else{
                                cb();
                            }
                        },
                        function (cb) {
                            if ( status_id == 4 ){
                                // 기부자에게 책갈피 제공
                                query = "UPDATE user SET bookmark_total_cnt = bookmark_total_cnt + 1 WHERE user_id = ?;";
                                data = [req.body.to_user_id];

                                connection.query(query, data, function (err, result) {
                                    if (err) {
                                        cb(err);
                                    }else{
                                        cb();
                                    }
                                });
                            }else{
                                cb();
                            }
                        }
                    ], function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, status_id);
                        }
                    });
                }

            ], function (err, status_id) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        res.json(getJsonData(0, err.message, null));
                    });

                    logger.error('/ 거래 단계별 수락 error : ', err.message);
                    logger.error('/---------------------------------------- end -----------------------------------------/');
                }else{
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                res.json(getJsonData(0, err.message, null));
                            });
                        }else{


                            var result;
                            // 배송 완료 시 GCM 전송 / status_id == 2
                            if ( status_id == 2 ){
                                // GCM 전송
                                query = "SELECT gcm_registration_id FROM user WHERE user_id = ?;";
                                data = [req.body.to_user_id];
                                connection.query(query, data, function (err, rows, fields) {
                                    if (err) {
                                        logger.error('교환 요청 GCM 에러!', err.message);
                                    } else {
                                        gcm.sendMessage([rows[0].gcm_registration_id], '위즈도나', req.body.message, 0, function (err) {
                                            // 완료
                                            if (err) {
                                                logger.error('교환 수락 GCM error :', err.message);
                                            } else {
                                                logger.debug('교환 수락 GCM 성공!');
                                            }
                                        });
                                    }
                                });
                                result = {message:req.body.message};
                            }else{
                                result = null;
                            }

                            connection.release();
                            res.json(getJsonData(1, 'success', result));

                            logger.debug('/.');
                            logger.debug('/.');
                            logger.debug('/거래 단계별 수락 성공!');
                            logger.debug('/---------------------------------------- end -----------------------------------------/');
                        }
                    });
                }
            });
        });
    }
};

exports.cancelPost = function(req,res){
    logger.debug('/--------------------------------------- start ----------------------------------------/');
    logger.debug('/ 교환 취소/철회 : ', {req_user_id:req.params.user_id, post_id : req.body.post_id});


    // 1. post + trade SELECT
    // 2. 배송전인지 파악 -> current_status
    // 3. 배송후이면 에러 처리 / 배송전이면 다음 실행
    // 4. user_id로 기부자 or 요청자 파악
    // 5. 기부자
    //    5-1. trade의 current_status '철회'로 변경
    //    5-2. trade_log에 기록
    //    5-3. 게시물 삭제 처리(UPDATE)
    //    5-4. 사용자 제재 처리(user UPDATE, sanction_log INSERT)
    //    5-4. 특수 : 프로모션 해당 게시물일 경우 책갈피 회수(없으면 패스)
    // 6. 요청자
    //    6-1. trade의 current_status '취소'로 변경
    //    6-2. trade_log에 기록

    var query;
    var data;
    getConnection(function (connection) {

        async.waterfall([
                function (callback) {
                    query =
                        "SELECT p.user_id, t.trade_id, t.req_user_id, t.current_status " +
                        "FROM post p JOIN trade t ON p.post_id = t.post_id " +
                        "WHERE p.post_id = ? and t.current_status NOT IN(92, 91);";
                    data = req.body.post_id;
                    connection.query(query, data, function (err, rows, fields) {
                        if (err) {
                            callback(err);
                        } else {
                            if (!rows.length) {
                                callback(new Error("해당 게시물은 거래 정보가 없습니다."));
                            } else {
                                // 배송이후이면 에러 처리
                                if (rows[0].current_status != 1) {
                                    callback(new Error("현재 단계에서는 취소를 할 수 없거나 거래가 종료되었습니다."));
                                } else if ( req.params.user_id != rows[0].user_id && req.params.user_id != rows[0].req_user_id ){
                                    callback(new Error("user_id가 잘못 되었습니다."));

                                }else{
                                    callback(null, rows);
                                }
                            }
                        }
                    });
                },
                function (rows, callback) {
                    // 게시물 삭제
                    if (rows[0].user_id == req.params.user_id) {
                        req.body.connection = connection;
                        // req.body.post_id =  fields.post_id;
                        req.body.callback = function (err) {
                            if (err) {
                                callback(err)
                            }else{
                                callback(null, rows);
                            }
                        };
                        post.destroyPost(req, res);
                    }else{
                        callback(null, rows);
                    }
                },
                function (rows, callback) {

                    logger.debug('rows[0].user_id', rows[0].user_id);
                    logger.debug('req.params.user_id', req.params.user_id);
                    var trade_status;
                    // 기부자
                    if (rows[0].user_id == req.params.user_id) {
                        console.log('이리로 들어왔따고?');
                        //    5-1. trade의 current_status '철회'로 변경
                        //    5-2. trade_log에 기록
                        //    5-3. 게시물 삭제 처리(UPDATE)
                        //    5-4. 사용자 제재 처리(user UPDATE, sanction_log INSERT)
                        //    5-4. 특수 : 프로모션 해당 게시물일 경우 책갈피 회수(없으면 패스)
                        req.body.to_user_id = rows[0].req_user_id;
                        req.body.message = '기부자가 요청을 철회하였습니다.';
                        trade_status = 92;
                    } else {
                        // 요청자
                        //    6-1. trade의 current_status '취소'로 변경
                        //    6-2. trade_log에 기록
                        req.body.to_user_id = rows[0].user_id;
                        req.body.message = '요청자님이 책을 취소하셨습니다.';
                        trade_status = 91;
                    }
                    req.params.trade_id = rows[0].trade_id;

                    async.parallel([
                        function (cb) {
                            // 책갈피 요청자에게 반납
                            query = "UPDATE user SET bookmark_total_cnt = bookmark_total_cnt + 1 WHERE user_id = ?;";
                            data = [rows[0].req_user_id];

                            connection.query(query, data, function (err, result) {
                                if (err) {
                                    cb(err);
                                }else{
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            // 거래 단계 변경
                            updateTrade(connection, rows[0].trade_id, trade_status, function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            // 거래 기록 추가
                            insertTradeLog(connection, rows[0].trade_id, trade_status, function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb();
                                }
                            });
                        },
                        function (cb) {
                            message.createMessage(req, connection, function (err, result) {
                                if(err) cb(err);
                                else cb();
                            });
                        }
                    ], function (err) {
                        if (err) {
                            callback(err);
                        } else {

                            callback();
                        }
                    });
                }],
            function (err) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        res.json(getJsonData(0, err.message, null));
                    });

                    logger.error('/ 거래 취소/철회 error : ', err.message);
                    logger.error('/---------------------------------------- end -----------------------------------------/');
                }else{
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                res.json(getJsonData(0, err.message, null));
                            });
                        }else{
                            connection.release();

                            var result = {message:req.body.message};
                            res.json(getJsonData(1, "success", result));

                            // GCM 전송
                            query = "SELECT gcm_registration_id FROM user WHERE user_id = ?;";
                            data = [req.body.to_user_id];
                            connection.query(query, data, function (err, rows, fields) {
                                if (err) {
                                    logger.error('교환 요청 GCM 에러!', err.message);
                                } else {
                                    gcm.sendMessage([rows[0].gcm_registration_id], '위즈도나', req.body.message, 0, function (err) {
                                        // 완료
                                        if (err) {
                                            logger.error('교환 취소/철회 GCM error :', err.message);
                                        } else {
                                            logger.debug('교환 취소/철회 GCM 성공!');
                                        }
                                    });
                                }
                            });

                            logger.debug('/.');
                            logger.debug('/.');
                            logger.debug('/거래 취소/철회 요청 성공!');
                            logger.debug('/---------------------------------------- end -----------------------------------------/');
                        }
                    });
                }
            }
        );
    });

};
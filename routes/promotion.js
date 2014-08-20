
var async = require('async');

function presentBookmark(connection, user_id, callback) {
    var query =
        "UPDATE user SET bookmark_total_cnt = bookmark_total_cnt + 1 " +
        "WHERE user_id = ?;";
    var data = [user_id];
    connection.query(query, data, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
}

// 책갈피 회수
function withdrawBookmark(connection, user_id, callback){
    var query;
    var data;

    async.waterfall([
        function (cb) {

            query =
                "SELECT bookmark_total_cnt " +
                "FROM user " +
                "WHERE user_id = ?";
            data = [user_id];

            connection.query(query, data, function (err, rows, fields) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, rows);
                }
            });
        },
        function (rows, cb) {
            if (!rows.length){
                cb(new Error('해당 사용자가 없습니다.'));
            }else{
                if ( rows[0].bookmark_total_cnt > 0){
                    query =
                        "UPDATE user SET bookmark_total_cnt = bookmark_total_cnt - 1 " +
                        "WHERE user_id = ?;";
                    data = [user_id];

                    connection.query(query, data, function (err, result) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, true);
                        }
                    });

                }else{
                    cb(null, false);
                }
            }
        }
    ], function (err, is_withdraw) {
        if ( err ){
            callback(err);
        }else{
            callback(null, is_withdraw);
        }
    })
};


function addPromotionLog(connection, post_id, user_id, promotion_id, type_num, callback) {
    var query = "INSERT INTO promotion_log (post_id, user_id, type_num, promotion_id) VALUES(?, ?, ?, ?);";
    var data = [post_id, user_id, type_num, promotion_id];
    connection.query(query, data, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
}



// 프로모션 게시물인지 체크
exports.destroyPostCheck = function (connection, post_id, user_id, callback) {
    var query = "SELECT pl.post_id, pl.type_num, p.promotion_id, p.interval_num, p.max_count " +
        "FROM promotion_log pl " +
        "JOIN promotion p ON pl.promotion_id = p.promotion_id " +
        "WHERE user_id = ?;";
    var data = [user_id];
    connection.query(query, data, function (err, rows, fields) {
        if (err) {
            callback(err);
        }else{
            if( !rows.length ){
                callback();
            }else{
                var is_promotion = false;
                var total_type_num = 0;
                for(var i = 0; i < rows.length; i++){

                    // type_num 총합 구하기
                    total_type_num +=rows[i].type_num;

                    // 프로모션 게시물 이력 있으면 체크
                    if ( rows[i].post_id == post_id ){
                        is_promotion = true;
                    }
                }
                // 프로모션 게시물 이력 없으면 패스
                if ( !is_promotion ){
                    callback();
                }else{
                    async.waterfall([
                        function (cb) {
                            // interval_num이 배수이면 책갈피 회수 아니면 패스
                            if ( total_type_num % rows[0].interval_num == 0){
                                //책갈피 회수

                                withdrawBookmark(connection, user_id, function (err, is_withdraw) {
                                    if (err){
                                        cb(err);
                                    }else{

                                        // 회수 했으면 -1
                                        if( is_withdraw){
                                            cb(null, -1, is_withdraw);
                                        }else{
                                            // 못했으면 0
                                            cb(null, 0, is_withdraw);
                                        }
                                    }
                                });
                            }else{

                                //패스 프로모션 로그 -1
                                cb(null, -1, true);
                            }
                        },
                        function (type_num, is_withdraw, cb) {

                            // 책갈피 회수 했을 경우 패스
                            // 책갈피 회수 못했을 경우 제재
                            // 프로모션 로그 기록
                            async.parallel([
                                function (cb2) {
                                    if ( is_withdraw ){
                                        cb2();
                                    }else{
                                        var sanction = require('./sanction');
                                        var cause = '책갈피 이미 사용';
                                        sanction.addSanction(connection, user_id, cause, 30, function (err) {
                                            if(err){
                                                cb2(err);
                                            }else{
                                                cb2();
                                            }
                                        });
                                    }
                                },
                                function (cb2) {
                                    // 프로모션 로그 기록
                                    addPromotionLog(connection, post_id, user_id, rows[0].promotion_id, type_num, function (err) {
                                        if (err){
                                            cb(err);
                                        }else{
                                            cb();
                                        }
                                    });
                                }
                            ], function (err) {
                                if ( err){
                                    cb(err);
                                }else{
                                    cb();
                                }
                            })
                        }
                    ], function (err) {
                        if(err){
                            callback(err);
                            logger.errror('/ 프로모션 게시물 삭제시 처리 error : ', err.message);
                            logger.errror('/---------------------------------------- end -----------------------------------------/');

                        }else{
                            callback();
                        }
                    })
                }
            }
        }
    });
};

exports.createPostCheck = function (connection, post_id, user_id, callback) {


    logger.debug('게시물 프로모션 체크!');

    var query;
    var data;
    async.waterfall([
        function (cb) {

            // 현재 프로모션 진행중인지 파악
            // 진행 중 아니면 패스
            // 진행중이면 다음 단
            query =
                "SELECT promotion_id, max_count, interval_num " +
                "FROM promotion " +
                "WHERE is_promotion = TRUE;";
            connection.query(query, function (err, rows, fields) {
                if (err) {
                    callback(err);
                }else{
                    if ( rows.length ){
                        cb(null, rows);
                    }else{
                        callback();
                    }
                }
            });
        },
        function (promotion_rows, cb) {
            // 사용자의 프로모션 참여 횟수 파악
            // 프로모션 모두 완료 했을 경우면 패스
            // interval_num의 배수이면 책갈피 제공
            // 프로모션 로그 기록
            query =
                "SELECT SUM(type_num) total_type_num " +
                "FROM promotion_log " +
                "WHERE user_id = ? AND promotion_id = ?;";

            data = [user_id, promotion_rows[0].promotion_id];
            connection.query(query, data, function (err, rows, fields) {
                if (err) {
                    cb(err);
                }else{

                    var max_total = promotion_rows[0].interval_num * promotion_rows[0].max_count;
                    if ( rows[0].total_type_num == max_total){
                        // 해당 프로모션에 대한 책 등록이 모두 찼을 경우 제외
                        callback();
                    }else{
                        // interval_num의 배수이면 책갈피 제공 아니면 패스 & 프로모션 로그 작성
                        async.parallel([
                            function (cb2) {
                                if ( rows[0].total_type_num % promotion_rows[0].interval_num != 0 ){
                                    // 책갈피 제공
                                    presentBookmark(connection, user_id, function (err) {
                                        if(err){
                                            cb2(err);
                                        }else{
                                            cb2();
                                        }
                                    })
                                }else{
                                    cb2();
                                }
                            },
                            function (cb2) {

                                // 기록
                                addPromotionLog(connection, post_id, user_id, promotion_rows[0].promotion_id, 1, function (err) {
                                    if(err){
                                        cb2(err);
                                    }else{
                                        cb2();
                                    }
                                })
                            }
                        ], function (err) {
                            if (err){
                                cb(err);
                            }else{
                                cb();
                            }
                        })
                    }
                }
            });
        }
    ], function (err) {
        if ( err){
            callback(err);
            logger.errror('/ 프로모션 게시물 생성시 처리 error : ', err.message);
            logger.errror('/---------------------------------------- end -----------------------------------------/');
        }else{
            callback();
        }
    })
}

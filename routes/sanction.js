var async = require('async');


// post_id로 trade검색 후 요청한 상태이면 제재 처리 (거래 정보 없거나 있는 경우 요청전, 수취완료, 완료 상태는 패스)
// 프로모션 체크 : 기록이 있는 게시물이면 기록 및 책갈피 회수(회수 책갈피 없으면 제재)
exports.checkSanctionPost = function (connection, post_id, user_id, callback) {
    // 쿼리 요청
    var query = "SELECT trade_id, current_status " +
        "FROM trade " +
        "WHERE current_status NOT IN(92, 91) and post_id = ?;";
    var data = [post_id];
    connection.query(query, data, function (err, rows, fields) {
            if (err) {
                req.body.callback(err);
            }else{
                // 거래 정보 없을 경우, 있을 경우 요청전, 수취완료, 완료 상태는 패스
                if ( !rows.length || rows[0].current_status == 4 || rows[0].current_status == 5 ){
                    callback(null, false)
                }else{
                    callback(null, true);
                }
            }
        }
    );
};



exports.addSanction = function(connection, user_id, cause, period, callback){

    logger.debug('/--------------------------------------- start ----------------------------------------/');
    logger.debug('/ 사용자 제재 : ', {user_id:user_id, cause:cause, period:period});

    var query;
    var data;

    async.waterfall([
        function (cb) {
            query = "SELECT sanction_date FROM user WHERE user_id = ?";
            data = [user_id];

            connection.query(query, data, function (err, rows, fields) {
                if (err) {
                    cb(err);
                }else{
                    cb(null, rows);
                }
            });
        }, function (rows, cb) {

            var nowDate = new Date();
            var userSanctionDate = new Date(rows[0].sanction_date);
            var sanctionDate;
            if (userSanctionDate <= nowDate) {
                sanctionDate = nowDate;
                sanctionDate.setDate(nowDate.getDate() + period);

            } else {
                sanctionDate = userSanctionDate;
                sanctionDate.setDate(userSanctionDate.getDate() + period);
            }

            // sanctionDate : 제재 만료 날짜
            // period : 기간
            // cause : 사유

            async.parallel([
                // 제재 로그 기록
                function (cb2) {
                    query = "INSERT INTO sanction_log (user_id, cause, period, expiration_date) VALUES(?, ?, ?, ?);";
                    data = [user_id, cause, period, sanctionDate];
                    connection.query(query, data, function (err, result) {
                        if (err) {
                            cb2(err);
                        } else {
                            cb2();
                        }
                    });
                },
                function (cb2) {
                    // 사용자 제재
                    query =
                        "UPDATE user SET sanction_date = ? " +
                        "WHERE user_id = ?;";
                    data = [sanctionDate, user_id];
                    connection.query(query, data, function (err, result) {
                        if (err) {
                            cb2(err);
                        } else {
                            cb2();
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
        }], function (err) {
            if (err) {
                callback(err);


                logger.error('/ 사용자 제재 error : ', err.message);
                logger.error('/---------------------------------------- end -----------------------------------------/');
            } else {
                callback();
            }
        }
    );
};


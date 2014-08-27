/**
 * Created by nrkim on 2014. 8. 6..
 */

var json = require('./json');
var trans_json = json.trans_json;
var async = require("async");
var _= require('underscore');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');


// 커넥션 풀 클로저 함수
// 중첩 쿼리를 사용 하더라도 커넥션을 계속 유지 할 수 있는 함수
// 별로 필요는 없는거 같음 ...
exports.connection_closure = function(next){
    async.waterfall(
        [
            function (callback){
                connectionPool.getConnection(function (err,connection){
                    if (err){callback(err);}
                    else {callback(null,connection);}
                });
            }
        ],function(err,pool){
            if(err) { next(err); }
            else {
                next (null,{
                    get_conn : function() {
                        return pool;
                    },
                    get_query : function(query,params,verify){
                        pool.query(query,params,function(err,rows){
                            verify(err,rows);
                        });
                    },
                    close_conn : function() {
                        pool.release();
                    }
                });
            }
        }
    );
};

// 커넥션 관련 탬플릿
exports.template_list = function(query,params,get_json,verify){
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            verify(err);
        } else {
            connection.query(query, params, function (err, rows) {
                if (err) {
                    connection.release();
                    verify(err);
                }
                else {
                    if(rows.length === 0) { verify(null,rows);}
                    else {
                    async.map(rows,
                        function (item, callback) {
                            callback(null, get_json(item));
                        },
                        function (err, results) {
                            if (err) {
                                connection.release();
                                console.log('실패',err.stack);
                                verify(err);
                            } else {
                                connection.commit();
                                connection.release();
                                console.log('성공');
                                verify(null, results);    //rows가져 와야 하나?
                            }
                        }
                    );
                    }
                }
            });
        }
    });
};

exports.template_item = function(query,params,verify){
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            verify(err,false,'데이터베이스 연결오류 입니다.');
        }
        connection.query(query, params, function (err, rows) {
            if (err) {
                connection.release();
                verify(err,false,'sql쿼리 오류입니다.'+err.message);
            }
            else{
                connection.commit();
                connection.release();
                verify(null,rows,'success');
            }
        });
    });
};


exports.transaction_closure = function(next) {
    async.waterfall(
        [
            function (callback) {
                connectionPool.getConnection(function (err, connection) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        connection.beginTransaction(function (err) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback(null, connection);
                            }
                        });
                    }
                });
            }
        ], function (err, pool) {
            if (err) {
                next(err);
            }
            else {
                next(null, {
                    get_conn: function () {
                        return pool;
                    },
                    get_query: function (query, params, verify) {
                        pool.query(query, params, function (err, rows) {
                            console.log('rows... is ',rows);
                            verify(err, rows);
                        });
                    },
                    get_commit: function (verify) {
                        pool.commit(function(err){
                            if (err) {
                                pool.rollback(function () {
                                    verify(err);
                                });
                            }
                            else {
                                verify();
                            }
                        });
                    },
                    get_rollback : function(error_fun){
                        pool.rollback(function () {
                            error_fun('롤백작업에 실패하였습니다.');
                        });
                    },
                    get_transaction: function (err, verify) {
                        verify(err);
                    },
                    close_conn: function () {
                        pool.release();
                    }
                });
            }
        }
    );
};

// 해쉬 패스워드 생성

exports.create_password = function (password,verify){
    async.waterfall([
            function generateSalt(callback) {
                var rounds = 10;
                console.log('salt function');
                bcrypt.genSalt(rounds, function(err, salt) {
                    if (err) {
                        console.log('genSalt');
                        callback("salt 를 생성하지 못했습니다.");
                    }
                    else {
                        console.log('salt를 생성했습니다.',salt);
                        callback(null, salt);
                    }
                });
            },
            function hashPassword(salt, callback) {
                console.log('hash Pass!!!');
                bcrypt.hash(password, salt, null,
                    function(err, hashPass) {
                        if(err) {callback('해시 패스워드를 생성하지 못했습니다.');}
                    else {console.log('callback!!!!'); callback(null, hashPass,salt);}
                });
            }
        ],
        function(err, hashPass,salt) {
            if (err) {console.log( 'verify err!!!'); verify(err);}
            else {console.log('verify err!!!'); verify(null,hashPass,salt);}
        });
};


exports.duplication_check = function (rows,nickname,email){
    var dup_nickname = _.some(rows,
        function (item) {return item.nickname === nickname;});

    if (email) {
        var dup_email = _.some(rows,
            function (item) {return item.email === email;});

        if (dup_nickname) {
            if (dup_email) return {'signupMessage': '닉네임과 이메일이 중복됩니다.'};
            else return {'signupMessage': '닉네임이 중복됩니다.'};
        }
        else return {'signupMessage': '이메일이 중복됩니다.'};

    } else{
        if(dup_nickname) return {'signupMessage': '닉네임이 중복됩니다.'};
        else return {'signupMessage': 'success'}
    }
};

exports.create_hash = function (password,operation){
    async.waterfall([
            function generateSalt(callback) {
                var rounds = 10;
                bcrypt.genSalt(rounds, function(err, salt) {
                    console.log('bcrypt.genSalt ====> ', salt, '(', salt.toString().length,')');
                    callback(null, salt);
                });
            },
            function hashPassword(salt, callback) {
                bcrypt.hash(password, salt, null, function(err, hashPass) {
                    console.log('bcrypt.hash ====> ', hashPass, '(', hashPass.length,')');
                    callback(null, hashPass);
                });
            }
        ],
        function(err, hashPass) {
            if (err) {
                result(err);
                connection.release();
                operation('암호화된 비밀번호 생성에 실패하였습니다.'); //res.json(trans_json('암호화된 비밀번호 생성에 실패하였습니다.', 0));
            }
            else{
                console.log('password is',hashPass);
                operation(null,hashPass);
            }
        });
}

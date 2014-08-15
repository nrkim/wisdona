/**
 * Created by nrkim on 2014. 8. 6..
 */

var json = require('./json');
var trans_json = json.trans_json;
var async = require("async");
var _= require('underscore');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

// 커넥션 관련 탬플릿
exports.template_list = function(query,params,get_json,verify){
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            verify(err,false,"데이터 베이스 연결 오류 입니다.");
        } else {
            connection.query(query, params, function (err, rows) {
                if (err) {
                    connection.release();
                    verify(err,false,'sql 쿼리 오류입니다.');
                }

                console.log('rows is ',rows);
                if (rows.length == 0) {
                    connection.release();
                    verify(null,false,"일치하는 결과가 없습니다.");
                } else {
                    async.map(rows,
                        function(item, callback) {
                            callback(null, get_json(item));
                        },
                        function(err, results) {
                            console.log('result is ', results);
                            if (err) {
                                connection.release();
                                verify(err,false, "리스트를 가져오지 못했습니다");
                            } else {
                                connection.release();
                                verify(null,results,'success');
                            }
                        }
                    );
                }
            });
        }
    });
};

exports.template_item = function(query,params,verify){
    console.log('template_post');
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            verify(err,false,'데이터베이스 연결오류 입니다.');
        }
        connection.query(query, params, function (err, rows) {
            if (err) {
                connection.release();
                verify(err,false,'sql쿼리 오류입니다.');
            }
            else{
                connection.commit();
                connection.release();
                verify(null,rows,'success');
            }
        });
    });
};


exports.connection_chain = function(){

};

exports.template_transaction = function(connection, sql, funcs ){
    connection.beginTransaction(function (err) {
        if (err) {
            verify(err,'트렌젝션 연결에 실패하였습니다.',0);
        }

        async.waterfall(funcs , function (err) {
            if (err) {
                connection.rollback(function () {
                    verify(err,'롤백 작업에 실패하였습니다');
                });
            }
            p.connection.commit(function (err) {
                if (err) {
                    connection.rollback(function () {
                        verify(err,'커밋 작업에 실패하였습니다');
                    });
                }
                verify(err,'success');
            });
        });
    });
};


/*
exports.template_transaction = function(){
    connection.beginTransaction(function (err) {
        if (err) {
            connection.release();
            verify(err,false,'트렌젝션 연결에 실패하였습니다.',0);
            //return res.json(trans_json("트렌젝션 연결에 실패했습니다.",0));
        }

        async.waterfall(func_list, function (err) {
            if (err) {
                connection.rollback(function () {
                    connection.release();
                    verify(err,false,'롤백 작업에 실패하였습니다');
                    //return p.res.json(trans_json("롤백 작업에 실패했습니다.",0));
                });
            }
            p.connection.commit(function (err) {
                if (err) {
                    p.connection.rollback(function () {
                        p.connection.release();
                        //return p.res.json(trans_json("작업이 취소하였습니다."),0);
                    });
                }
                p.connection.release();
                p.res.json(trans_json("success",1));
            });
        });
    });
};

*/
// 해쉬 패스워드 생성
exports.create_password = function (password,verify){
    async.waterfall([
            function generateSalt(callback) {
                var rounds = 10;
                bcrypt.genSalt(rounds, function(err, salt) {
                    callback(null, salt);
                });
            },
            function hashPassword(salt, callback) {
                bcrypt.hash(password, salt, null,
                    function(err, hashPass) {
                    callback(null, hashPass);
                });
            }
        ],
        function(err, hashPass) {
            if (err) verify(err);
            else verify(null,hashPass);
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

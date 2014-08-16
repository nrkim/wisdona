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
                    console.log('err',err.message);
                    connection.release();
                    verify(err,false,'sql 쿼리 오류입니다.');
                }
                console.log('rows... is : ',rows);
                if (rows.length==0) {
                    connection.release();
                    verify(null,false,"일치하는 결과가 없습니다.");
                } else {
                    async.map(rows,
                        function(item, callback) {
                            callback(null, get_json(item));
                        },
                        function(err, results) {
                            if (err) {
                                connection.release();
                                verify(err,false, "리스트를 가져오지 못했습니다");
                            } else {
                                console.log(results);
                                connection.release();
                                verify(null,results,'success',rows);
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
            console.log('데이터베이스 연결 오류');
            verify(err,false,'데이터베이스 연결오류 입니다.');
        }
        connection.query(query, params, function (err, rows) {
            if (err) {
                console.log('query');
                console.log(err.message);
                connection.release();
                verify(err,false,'sql쿼리 오류입니다.');
            }
            else{
                console.log('벼됵');
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

exports.template_get = function(res,query,params,get_json,callback){
    console.log('template get!!!');
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        } else {
            connection.query(query, params, function (err, rows, fields) {
                if (err) {
                    connection.release();
                    res.json(trans_json("",0));      // 에러 처리
                }

                //데이터 결과가 없을 떄 에러인 경우도 있고 에러가 아닌 경우도 있음 / 두가지경우가 있기 때문에 flag parameter 필요
                //for문을 forEach함수로 바꿈

                if (rows.length == 0) {
                    console.log('length is 0');
                    connection.release();
                    res.json(trans_json("No data found!!!",0));      // 에러 처리
                }
                else {
                    async.map(rows,
                        function(item, callback) {
                            callback(null, get_json(item));
                        },
                        function(err, results) {
                            if (err) {
                                connection.release();
                                res.json({ error : err });
                            } else {
                                connection.release();
                                res.json(trans_json("success", 1, results));
                            }
                        }
                    );
                }


            });
        }
    });

};

//req,res,query,params,callback){
exports.template_post = function(res,query,params,error_handle,callback){
    console.log('template_post');
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }
        console.log('template_post');
        connection.query(query, params, function (err, rows, fields) {
            if (err) {
                console.log('connectinon query err: ',err);
                connection.release();
                res.json(trans_json(err.code + " sql 에러입니다. ", 0));        //에러 코드 처리 - 중복 데이터 처리
            }
            else{
                console.log('connection success');
                //if(callback) callback();
                connection.commit();
                connection.release();
                console.log('connection released');
                res.json(trans_json("success", 1));
            }
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
                console.log('salt function');
                bcrypt.genSalt(rounds, function(err, salt) {
                    if (err) {
                        console.log('genSalt');
                        callback("salt 를 생성하지 못했습니다.");
                    }
                    else {
                        console.log('salt를 생성했습니다.');
                        callback(null, salt);
                    }
                });
            },
            function hashPassword(salt, callback) {
                console.log('hash Pass!!!');
                bcrypt.hash(password, salt, null,
                    function(err, hashPass) {
                        if(err) {callback('해시 패스워드를 생성하지 못했습니다.');}
                    else {console.log('callback!!!!'); callback(null, hashPass);}
                });
            }
        ],
        function(err, hashPass) {
            if (err) {console.log( 'verify err!!!'); verify(err);}
            else {console.log('verify err!!!'); verify(null,hashPass);}
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
                return res.json(trans_json('암호화된 비밀번호 생성에 실패하였습니다.', 0));
            }
            else{
                console.log('password is',hashPass);
                return hashPass;
            }
        });
}

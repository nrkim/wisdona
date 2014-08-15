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

//에러 핸들링 구문 추가
//req,res,query,params,get_json,callback
exports.template_get = function(res,query,params,get_json){
        console.log('template get!!!');
        console.log(query);
    console.log(params);
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                console.log('template.get err..');
                res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
            } else {
                connection.query(query, params, function (err, rows, fields) {
                    if (err) {
                        console.log(err.message);
                        connection.release();
                        res.json(trans_json("",0));      // 에러 처리
                    }

                    console.log('log!!');

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
                                console.log('item', item);
                                callback(null, item);
                            },
                            function(err, results) {
                                if (err) {
                                    connection.release();
                                    res.json({ error : err });
                                } else {
                                    var item = results[0];

                                    connection.release();
                                    res.json(trans_json("success", 1, get_json(item)));


                                    ////////////////////////////////////////////////
                                    // 수정자 : 오남
                                    // 수정 내용 : async.map에서 callback(null, get_json(item));으로 넘길 경우
                                    // [item] <- 처럼 배열 형태로 넘어가서 es.json(trans_json("success", 1, results);를
                                    // 출력 할 경우 json -> result : [{}]; 왼쪽처럼 배열로 묶여서 처리됨
                                    // 그래서 results로 넘어온값의 0번째 값으로 접근하도록 수정
                                    // ps. 일단 상협이 작업해야되서 수정해놨으니깐 보고 변경 해~~
                                    ////////////////////////////////////////////////
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

exports.template_user = function(query,params,result){
    console.log('template_post');
    connectionPool.getConnection(function (err, connection) {
        if (err) {
            result(err);
        }
        connection.query(query, params, function (err, rows, info) {
            if (err) {
                connection.release();
                result(err);
            }
            else{
                console.log('query is : ',query);
                console.log('param is: ',params);
                console.log('info is!!',info);
                connection.commit();
                connection.release();
                result(null,rows,info);
            }
        });
    });
};

//req,res,user_id,get_query,update_query){
exports.template_transaction = function(){
    p.connection.beginTransaction(function (err) {
        if (err) {
            connection.release();
            return res.json(trans_json("트렌젝션 연결에 실패했습니다.",0));
        }

        async.waterfall(p.func_list, function (err) {
            if (err) {
                p.connection.rollback(function () {
                p.connection.release();
                return p.res.json(trans_json("롤백 작업에 실패했습니다.",0));
                });
            }
            p.connection.commit(function (err) {
                if (err) {
                    p.connection.rollback(function () {
                        p.connection.release();
                        return p.res.json(trans_json("작업이 취소하였습니다."),0);
                    });
                }
                p.connection.release();
                p.res.json(trans_json("success",1));
            });
        });
    });
};


// 해쉬 패스워드 생성
exports.create_password = function (password,result){
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
            }
            else{
                result(null,hashPass);
            }
        });
}


exports.duplication_check = function (rows,nickname,email){

    if (email) {
        var dup_nickname = _.some(rows, function (item) {return item.nickname === nickname;});
        var dup_email = _.some(rows, function (item) {return item.email === email;});

        if (dup_nickname) {
            if (dup_email) {
                return {'signupMessage': '닉네임과 이메일이 중복됩니다.'};
            }
            else {
                return {'signupMessage': '닉네임이 중복됩니다.'};
            }
        }
        else {
            return {'signupMessage': '이메일이 중복됩니다.'};
        }
    } else{
        var dup_nickname = _.some(rows, function (item) {return item.nickname === nickname;});
        if(dup_nickname){
            return {'signupMessage': '닉네임이 중복됩니다.'};
        }
        else{
            return {'signupMessage': 'success'}
        }
    }
}
//return res.json(trans_json('암호화된 비밀번호 생성에 실패하였습니다.', 0));
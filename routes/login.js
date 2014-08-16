/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');

var trans_json = json.trans_json
,bcrypt = require('bcrypt-nodejs')
    ,template = require('./template')
    ,template_get = template.template_get
    ,template_post = template.template_post
    ,template_item = template.template_item
    ,create_password = template.create_password;
var formidable = require('formidable');
var create_hash = template.create_hash;
var async = require('async');
var request = require('request');


exports.facebookLogin = function(req,res){
	if (req.user) {
		res.json(trans_json("success",1));
	} else {
		res.json(trans_json("페이스북 로그인에 실패하였습니다.",0));
	}
};

exports.facebookLogout = function(req,res){
    request(
        {
            url: "https://graph.facebook.com/v2.1/me/permissions?access_token=" + req.user.facebookToken,
            method: 'DELETE'
        },
        function(err, response, body) {
            if (err) {
                res.redirect('/profile');
            } else {
                req.logout();
                res.json(trans_json('로그아웃 하였습니다.',0));
            }

        }
    );
};


exports.requestActivationEmail = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};

exports.requestSendEmail = function(req,res){

    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

// logout 은 일반적으로 get??
exports.logout = function(req,res){
    req.logout();
    if (!req.session.passport.user) {
        console.log('성공!!');
        res.json(trans_json("success", 1));
    }
    else {
        res.json(trans_json("fail", 0));
    }
};

exports.activationEmail = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.updatePassword = function(req,res){

    console.log('update password!!!');
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        req.body = fields;

        console.log(fields);

        var user_id = req.session.passport.user || res.json(trans_json("로그아웃되었습니다. 다시 로그인 해주세요.", 0));
        var old_password = req.body.old_password || res.json(trans_json("현재 비밀번호를 입력하지 않았습니다.",0));
        var new_password = req.body.new_password || res.json(trans_json("새로운 비밀번호를 입력하지 않았습니다.",0));


        console.log('user id : ',user_id);
        console.log("old password is : ",old_password);
        console.log("new password is : ",new_password);



        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
            }

            var query = "SELECT password FROM user WHERE user_id = ?"
            connection.query(query,[user_id], function(err, rows, fields) {
                if(err){
                    connection.release();
                    res.json(trans_json(err.code+" sql 에러입니다. ", 0));        //에러 코드 처리 - 중복 데이터 처리
                }
                if (!rows){
                    res.json(trans_json("존재하지 않는 사용자입니다.",0));
                }
                bcrypt.compare(old_password,rows[0].password, function(err, result) {
                    if (!result){
                        return res.json(trans_json('현재 비밀번호가 틀렸습니다. 다시입력해 주십시오',0));
                    }

                    create_password(new_password,function(err,pass){
                        if(err){ res.json(trans_json('비밀번호 생성에 실패했습니다.',0));}
                        else {
                            var query = "update user set password = ? where user_id = ?"
                            template_post(
                                res,
                                query,
                                [pass, user_id]
                            );
                        }
                    });


                });
                connection.release();

            });
        });
    });
/*
        //비밀번호
        var old_password = req.body.old_password || res.json(trans_json("현재 비밀번호를 입력하지 않았습니다.", 0));
        var new_password = req.body.new_password || res.json(trans_json("새로운 비밀번호를 입력하지 않았습니다.", 0));

        //타입검사
        if (typeof user_id       != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
        if (typeof old_password  != "string") res.json('현재 비밀번호 타입은 문자여야 합니다.',0);
        if (typeof new_passoword != "string") res.json('새로운 비밀번호 타입은 숫자여야 합니다',0);

        console.log(user_id);
        console.log('old_password',old_password);
        console.log('new_password',new_password);



        async.waterfall([
            function (cb) {
                console.log('console. log   ');
                var query = "SELECT password FROM user WHERE user_id = ?";
                template_item(
                    query,
                    [user_id],
                    function (err, rows, msg) {
                        console.log('console.log(((');
                        if (err) { console.log('console.err',err); cb("업데이트에 실패했습니다."); }    //res.json(trans_json(msg,0));
                        else {
                            if (rows.length == 0) {
                                console.log('whadd');
                                cb("존재하지 않는 사용자 입니다.");
                            }
                            else {
                                bcrypt.compare(old_password, rows[0].password, function (err, result) {
                                    console.log('sdf');
                                    console.log(result);
                                    cb(null, result);
                                });
                            }
                        }
                    }
                )
            },
            function (result, cb) {
                if (!result) {
                    console.log('result err');
                    cb('현재 비밀번호가 틀렸습니다. 다시입력해 주십시오');
                }
                else {
                    console.log('create password')
                    create_password(new_password,
                        function (err, hashPass) {
                            if (err) { console.log('암호 생성 실패'); cb('암호화된 비밀번호 생성에 실패하였습니다.'); }
                            else {  console.log(hashPass); cb(null, hashPass);}
                        }
                    );
                }
            },
            function (hashPass, cb) {
                console.log('hashPass', hashPass);
                var update_query = "UPDATE user SET password = ? WHERE user_id = ?"
                template_item(
                    update_query,
                    [hashPass, user_id],
                    function (err, rows, msg) {
                        console.log('update is success');
                        if (err) {console.log('.....'); cb(err);}
                        else {console.log('err....'); cb(null,rows);}
                    }
                );
            }
        ], function (err,result) {
            console.log('err section');
            if (err) {console.log(err); res.json(trans_json(err, 0))}
            else {console.log('not err...'); res.json(trans_json("success", 1)) };
        });
    });

*/
};
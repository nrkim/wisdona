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


// api : /activation-email/:authkey
exports.activationEmail = function(req,res){

    var authkey = req.params.authkey || res.send('인증 토큰을 입력하지 않았습니다.');
    console.log('authkey....',authkey);

    if(typeof authkey != "string") res.send('인증토큰 타입은 문자열 타입이어야 합니다.');

    console.log('wow!!')

    template_item(
       "SELECT email, auth_token FROM email_auth WHERE ?",
        {auth_token : authkey},
        function(err,rows,msg){
            console.log('rows...',rows);
            if(err) { res.send('인증이 완료되지 못했습니다.');}
            else {
                console.log('!!');
                if(rows.length == 0){res.send('인증이 만료되었습니다. 다시 시도해 주세요.');}
                else{
                    template_item(
                        "UPDATE user SET email_auth = 1 WHERE email = ?",
                        [rows[0].email],
                        function(err,rows,msg){
                            console.log('alks;djf');
                            if(err){ res.send('이메일 인증 상태를 업데이트 하지 못했습니다.');}
                            else { res.send('이메일 인증을 완료했습니다.');}
                        }
                    );
                }
            }
        }
    );
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

async로 풀기
*/
};
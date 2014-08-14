/**
 * Created by nrkim on 2014. 7. 29..
 */
var json = require('./json');
var trans_json = json.trans_json
,bcrypt = require('bcrypt-nodejs')
    ,template = require('./template')
    ,template_get = template.template_get
    ,template_post = template.template_post;
var formidable = require('formidable');
var create_password = template.create_password;
var async = require('async');


exports.facebookLogin = function(req,res){
	if (req.user) {
		res.json(trans_json("success",1));
	} else {
		res.json(trans_json("페이스북 로그인에 실패하였습니다.",0));
	}
}


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

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        req.body = fields;

        console.log('update password section!!');

        var user_id = req.session.passport.user  || res.json(trans_json("로그아웃되었습니다. 다시 로그인 해주세요.",0));

        console.log('user id is :',  user_id);
        var old_password = req.body.old_password || res.json(trans_json("현재 비밀번호를 입력하지 않았습니다.",0));
        var new_password = req.body.new_password || res.json(trans_json("새로운 비밀번호를 입력하지 않았습니다.",0));


        console.log(old_password);
        console.log(new_password);

        console.log('update console');

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
                    else{

                        async.waterfall([
                                function generateSalt(callback) {
                                    var rounds = 10;
                                    bcrypt.genSalt(rounds, function(err, salt) {
                                        console.log('bcrypt.genSalt ====> ', salt, '(', salt.toString().length,')');
                                        callback(null, salt);
                                    });
                                },
                                function hashPassword(salt, callback) {
                                    bcrypt.hash(new_password, salt, null, function(err, hashPass) {
                                        console.log('bcrypt.hash ====> ', hashPass, '(', hashPass.length,')');
                                        callback(null, hashPass);
                                    });
                                }
                            ],
                            function(err, hashPass) {
                                if (err) {
                                    console.log("error occured");
                                    console.log(err.code);
                                    console.log(err);
                                    connection.release();
                                    return res.json(trans_json('암호화된 비밀번호 생성에 실패하였습니다.', 0));
                                }
                                else{
                                    var query = "update user set password = ? where user_id = ?"
                                    template_post(
                                        res,
                                        query,
                                        [hashPass, user_id]
                                    );
                                }
                            });


                    }
                });
                connection.release();

            });
        });
    });
};
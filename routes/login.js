/**
 * Created by nrkim on 2014. 7. 29..
 */
var json = require('./json');
var trans_json = json.trans_json
,bcrypt = require('bcrypt-nodejs')
    ,template = require('./templete')
    ,template_get = template.template_get
    ,template_post = template.template_post;
var formidable = require('formidable');

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
        var user_id = req.session.passport.user  || res.json(trans_json("로그아웃되었습니다. 다시 로그인 해주세요.",0));

        var old_password = req.body.old_password || res.json(trans_json("현재 비밀번호를 입력하지 않았습니다.",0));
        var new_password = req.body.new_password || res.json(trans_json("새로운 비밀번호를 입력하지 않았습니다.",0));

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
                    var query = "update user set password = ? where user_id = ?"

                    template_post(
                        res,
                        query,
                        [new_password, user_id]
                    );
                });
                connection.release();

            });
        });
    });
};
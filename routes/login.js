/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');

var trans_json = json.trans_json
,bcrypt = require('bcrypt-nodejs')
    ,template = require('./template')
    ,gcm = require('./gcm')
    ,template_get = template.template_get
    ,template_post = template.template_post
    ,template_item = template.template_item
    ,create_password = template.create_password
    ,create_user = json.create_user
    ,updateDeviceId = gcm.updateDeviceId
    ,connection_closure = template.connection_closure
    ,logger = require('../config/logger');
var async = require('async');
var request = require('request');



exports.registerLocal = function(req,res){
    logger.debug('/--------------------------------------- registerLocal ----------------------------------------/');
    logger.debug('session : ',req.session.passport.user);
    logger.debug('body : ', req.body);

    template_item(
        "UPDATE user SET nickname = ?, gcm_registration_id  = ?, email_auth = true WHERE user_id = ?",
        [req.body.nickname, req.body.gcm_registration_id, req.session.passport.user],
        function(err,rows){
            if (err){
                console.log('error 2222',err.message);
                res.json(trans_json('로그인에 실패했습니다.',0));
            }
            else {
                if(req.json_file){
                    console.log('jsonfile is exist!!');
                    res.json(trans_json('로그인에 성공했습니다.',1,req.json_file));
                } else {
                    console.log('json file is not exist!!!');
                    res.json(trans_json('로그인에 실패했습니다.',0));
                }
            }
        }
    );
};

exports.login = function(req,res){
    if (req.session.passport.user) {
        req.session.save(function() {
            console.log(req.session);
        });
        res.json(trans_json(req.signup_msg,1,create_user(req.user.user_id)));
    } else {
        res.json(trans_json(req.signup_msg,0));
    }
};


exports.facebookLogout = function(req,res){
    logger.debug('/--------------------------------------- facebookLogout ----------------------------------------/');

    request(
        {
            url: "https://graph.facebook.com/v2.1/me/permissions?access_token=" + req.user.facebookToken,
            method: 'DELETE'
        },
        function(err, response, body) {
            if (err) {
                res.json(trans_json(err.message + '로그아웃에 실패하였습니다.',0));
            } else {
                req.logout();
                res.json(trans_json('로그아웃 하였습니다.',1));
            }
        }
    );
};


// logout 은 일반적으로 get??
exports.logout = function(req,res){
    logger.debug('/--------------------------------------- logout ----------------------------------------/');

    req.session.destroy();
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

    logger.debug('/--------------------------------------- activationEmail ----------------------------------------/');
    logger.debug('params : ', {authkey : req.params.authkey});

    var authkey = req.params.authkey || res.send('인증 토큰을 입력하지 않았습니다.');

    if(typeof authkey != "string") res.send('인증토큰 타입은 문자열 타입이어야 합니다.');

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

    logger.debug('/--------------------------------------- updatePassword ----------------------------------------/');
    logger.debug('session : ',req.session.passport.user);
    logger.debug('body : ', req.body);

    var user_id = req.session.passport.user || res.json(trans_json("로그아웃되었습니다. 다시 로그인 해주세요.", 0));
    var old_password = req.body.old_password || res.json(trans_json("현재 비밀번호를 입력하지 않았습니다.",0));
    var new_password = req.body.new_password || res.json(trans_json("새로운 비밀번호를 입력하지 않았습니다.",0));

    connection_closure(function(err,connection){
        if(err){
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        } else {
            async.waterfall([
                function check_password(callback) {
                    connection.get_query(
                        "SELECT password FROM user WHERE user_id = ?",
                        [user_id],
                        function (err, rows) {
                            if (err) {res.json(trans_json('sql에러입니다. ' + err.code, 0));}
                            else {
                                if (rows.length === 0) {res.json(trans_json('존재하지 않는 사용자 입니다.', 0));}
                                else {callback(null);}
                            }
                        }
                    );
                },
                function compare_password(callback) {
                    bcrypt.compare(old_password, rows[0].password, function (err, result) {
                        if (err) {res.json(trans_json('비밀번호 비교하면서 오류가 발생했습니다.', 0));}
                        else {
                            if (rows.length == 0) {
                                res.json(trans_json('현재 비밀번호가 틀렸습니다. 다시 입력해 주십시오', 0));
                            } else {
                                callback(null);
                            }
                        }
                    });
                },
                function update_password(callback) {
                    create_password(new_password, function (err, pass) {
                        if (err) {
                            res.json(trans_json('비밀번호 생성에 실패했습니다.', 0));
                        }
                        else {
                            var query = "update user set password = ? where user_id = ?"
                            connection.get_query(
                                query,
                                [pass, user_id],
                                function (err, rows) {
                                    if (err) {
                                        res.json(trans_json('비밀번호 변경에 실패했습니다.', 0));
                                    }
                                    else {
                                        callback(null);
                                    }
                                }
                            );
                        }
                    });
                }
            ], function (err) {
                if (err) {
                    res.json(trans_json('비밀번호 변경에 실패했습니다.', 0));
                }
                else {
                    res.json(trans_json('비밀번호 변경에 성공했습니다.', 1));
                }
            });
        }
    });
    // });
/*
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
                        template_item(
                            query,
                            [pass, user_id],
                            function (err,rows){
                                if(err) {res.json(trans_json('비밀번호 변경에 실패했습니다.',0));}
                                else {res.json(trans_json('비밀번호 변경에 성공했습니다.',1));}
                            }
                        );
                    }
                });
            });
        });
    });*/

};
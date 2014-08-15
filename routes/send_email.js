/**
 * New node file
 */
var nodemailer = require('nodemailer')
	,smtpPool = require('nodemailer-smtp-pool')
	,cuid = require('cuid')
	,authConfig = require('../config/smtp_auth')
    ,logger = require('../config/logger')
    ,template = require('../routes/template')
    , bcrypt = require('bcrypt-nodejs')
    , async = require('async')
    ,tmplate_post = template.template_post
    ,template_item = template.template_item
    ,trans_json = require('../routes/json').trans_json;
var formidable = require('formidable');


exports.requestSendEmail = function (req,res){


    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        req.body = fields;
        var user_email = req.body.email;
        var tempPass = cuid.slug();

        // 먼저 insert 먼저 하고 transporting 하도록 template 수정 필요.
        // 해시 함수를 이용한 패스워드 생성 함수 필요

        console.log('requestActivationEmail!!');

        async.waterfall([
                function generateSalt(callback) {
                    var rounds = 10;
                    bcrypt.genSalt(rounds, function(err, salt) {
                        console.log('bcrypt.genSalt ====> ', salt, '(', salt.toString().length,')');
                        callback(null, salt);
                    });
                },
                function hashPassword(salt, callback) {
                    bcrypt.hash(tempPass, salt, null, function(err, hashPass) {
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
                    res.json(trans_json('비밀번호 재발급 메일 생성에 실패하였습니다.', 0));
                }

                connectionPool.getConnection(function (err, connection) {
                    if (err) {
                        res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
                    }
                    var update_sql = 'UPDATE user SET password = ? WHERE email = ?';
                    connection.query(update_sql, [hashPass,user_email], function (err, result) {
                        if (err) {
                            console.log("log7!!");
                            console.log(err.code);
                            connection.release();
                            res.json(trans_json('임시 비밀번호발급에 실패하였습니다.', 0));
                        }
                        connection.release();

                        var transporter = nodemailer.createTransport({
                            service: authConfig.gmailAuth.service,
                            auth: {
                                user: authConfig.gmailAuth.user,
                                pass: authConfig.gmailAuth.pass
                            }
                        });

                        var mailOptions = {
                            from: 'nrkim1122@gmail.com',
                            to: [user_email],
                            subject: '[위즈도나] 임시비밀번호 입니다.',
                            html: '임시비밀번호 : <strong>' + tempPass + '</strong>'
                        };

                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err) {
                                console.log(err.message);
                                //logger.error(err);
                            } else {
                                console.log('????');
                                //logger.debug(info);
                                //logger.info("Message sent: ", info.response);
                                res.json(trans_json('임시비밀번호 발급에 성공하였습니다.', 1));
                            }
                        });

                    });
                });
            });
    });
};


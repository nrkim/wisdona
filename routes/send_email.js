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
var crypto = require('crypto');


// api : /request-activation-email/:user_id
exports.requestActivationEmail = function(req,res){

    //이메일 파라미터 전달
    var email = req.params.email || res.json(trans_json('이메일을 입력하지 않았습니다.',0));

    console.log(email);

    //타입 체크
    if(typeof email !== 'string') res.json(trans_json('이메일 타입은 문자열 타입이어야 합니다.',0));

    //인증 토큰 생성
    var random_token = function (callback){
        crypto.randomBytes(48, function(err,buf){
            if (err) { res.json(trans_json('랜덤 암호 토큰 생성에 실패했습니다.',0)); }
            else {
                var token =  buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
                template_item(
                    "SELECT auth_token FROM email_auth WHERE auth_token = ? ",
                    [token],
                    function(err,rows,msg){
                        if (err) { callback('sql 쿼리 오류 입니다.'); }
                        else {
                            if(rows.length == 0){ callback(null,token); }
                            else{ random_token(callback); }
                        }
                    }
                );
            }
        });
    }

    // 토큰 저장
    var insert_auth = function (token,callback){
        console.log('암호 생성 성공 ',token);
        template_item(
            "SELECT email FROM email_auth WHERE email = ?",
            [email],
            function(err,rows,msg){
                if(err){callback(msg);}
                else{
                    var now = new Date();
                    var expire = function(n){ var v = new Date(); v.setDate(n.getDate() + 1); return v;}(now);
                    now = now.format("yy-M-dd h:mm:ss");
                    expire = expire.format("yy-M-dd h:mm:ss");

                    console.log('now is ',now);
                    console.log('expires is : ',expire);
                    if(rows.length == 0){
                        console.log('이메일이 auth에 있지 않을 때');
                        template_item(
                            "INSERT INTO email_auth(email,auth_token," +
                            "create_date,expiration_date) VALUES(?,?,?,?) ",
                            [email,token,now,expire],
                            function(err,rows,msg){
                                if(err) {callback(msg);}
                                else {callback(null,token);}
                            }
                        );
                    }
                    else{
                        console.log('else case!!!');
                        template_item(
                            "UPDATE email_auth SET auth_token = ?,create_date = ?, " +
                            "expiration_date = ? WHERE email = ? ",
                            [token,now,expire,email],
                            function(err,rows,msg){
                                if(err) {callback(msg);}
                                else {callback(null,token);}
                            }
                        );
                    }
                }
            }
        );
    }

    // 송신부
    var send_mail = function (token,callback){
        // 로컬 테스트 ; localhost:3000
        template = '<a href="http://54.92.19.218/activation-email/'+token+'"> 계정 인증 url입니다. 클릭하세요. </a>';
        console.log('template : ',template);
        var transporter = nodemailer.createTransport({
            service: authConfig.gmailAuth.service,
            auth: {
                user: authConfig.gmailAuth.user,
                pass: authConfig.gmailAuth.pass
            }
        });

        var mailOptions = {
            from: 'nrkim1122@gmail.com',
            to: [email],
            subject: '[위즈도나] 인증 메일입니다.',
            html: template
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log("err is : ",err.message);
                res.json(trans_json('인증메일 전송에 실패했습니다.',0));
                //logger.error(err);
            } else {
                res.json(trans_json('인증메일 전송에 성공했습니다.',1));
            }
        });
    }

    async.waterfall([
        random_token,
        insert_auth,
        send_mail
    ], function(err,result){
        if (err){res.json(trans_json(err,0));}
        else {res.json(trans_json('인증 메일을 전송 했습니다.', 1));}
    });

};

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


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
var sesTransport = require('nodemailer-ses-transport');

// api : /request-activation-email/:user_id
exports.requestActivationEmail = function(req,res){

    //이메일 파라미터 전달
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json('유저 아이디를 입력하지 않았습니다.',0));
    //전역 이메일
    var email ='';

    //타입 체크
    if(typeof user_id !== 'number') res.json(trans_json('유저 아이디는 숫자 타입이어야 합니다.',0));

    //이메일 얻는 함수
    var get_email = function(callback){
        template_item(
            "SELECT email FROM user WHERE user_id = ?",
            [user_id],
            function(err, result, msg){
                console.log('err is :',err);
                console.log('result is :', result);
                console.log('message is .. ',msg);

                if(err) {callback('sql에러 입니다 : '+ err.message);}
                else {
                    if(result.length == 0) {
                        callback('등록되지 않은 유저 입니다.');
                    }
                    else {
                        email=result[0].email;
                        callback(null);
                    }
                }
            }
        )
    };

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
                            else{ random_token(callback); } //같은 인증 토큰이 있으면 다시 수행.
                        }
                    }
                );
            }
        });
    };

    // 토큰 저장
    var insert_auth = function (token,callback){
        console.log('암호 생성 성공 ',token);
        template_item(
            "SELECT email FROM email_auth WHERE user_id = ?",
            [user_id],
            function(err,rows,msg){
                if(err){callback(msg);}
                else{
                    var expire = function(){ var v = new Date(); v.setDate(v.getDate() + 1); return v;}();
                    expire = expire.format("yy-M-dd h:mm:ss");

                    console.log('expires is : ',expire);
                    if(rows.length == 0){
                        console.log('이메일이 auth에 있지 않을 때');
                        console.log('user_id',user_id);
                        console.log('email',email);
                        console.log('token',token);
                        console.log('token',expire);
                        template_item(
                            "INSERT INTO email_auth(user_id,email,auth_token,expiration_date) " +
                            "VALUES(?,?,?,?)"
                            [user_id,email,token,expire],
                            function(err,rows,msg){
                                if(err) {console.log('err');callback(msg);}
                                else {console.log('not err.....');callback(null,token,rows.insertId);}
                            }
                        );
                    }
                    else{
                        console.log('else case!!!');
                        template_item(
                            "UPDATE email_auth SET auth_token = ?, " +
                            "expiration_date = ? WHERE user_id = ? ",
                            [token,expire,user_id],
                            function(err,rows,msg){
                                if(err) {callback(msg);}
                                else {callback(null,token,rows.insertId);}
                            }
                        );
                    }
                }
            }
        );
    };

    // 송신부
    var send_mail = function (token,callback){
        // 로컬 테스트 ; localhost:3000
        template = '<a href="http://54.92.19.218/activation-email/'+token+'"> 계정 인증 url입니다. 클릭하세요. </a>';
        console.log('template : ',template);
        var transporter = nodemailer.createTransport(sesTransport({
            accessKeyId : authConfig.sesAuth.key,
            secretAccessKey : authConfig.sesAuth.secret,
            region : authConfig.sesAuth.region,
            rateLimit :1
        }));

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
    };

    async.waterfall([
        get_email,
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

                        var transporter = nodemailer.createTransport(sesTransport({
                            accessKeyId : authConfig.sesAuth.key,
                            secretAccessKey : authConfig.sesAuth.secret,
                            region : authConfig.sesAuth.region,
                            rateLimit :1
                        }));

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


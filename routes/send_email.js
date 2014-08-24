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
    ,trans_json = require('../routes/json').trans_json
    ,connection_closure = template.connection_closure
    ,create_password = template.create_password;
var crypto = require('crypto');
var sesTransport = require('nodemailer-ses-transport');



var send_mail = function (email,subject,content,verify){
    // 로컬 테스트 ; localhost:3000

    console.log('email',email);
    console.log('subject ',subject);
    console.log('content ',content);

    console.log('send email is executed...');
    var transporter = nodemailer.createTransport(sesTransport({
        accessKeyId : authConfig.sesAuth.key,
        secretAccessKey : authConfig.sesAuth.secret,
        region : authConfig.sesAuth.region,
        rateLimit :1
    }));

    var mailOptions = {
        from: 'nrkim1122@gmail.com',
        to: [email],
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log("err is : ",err.message);
            verify(err);
        } else {
            console.log('메일 전송 성공 !!');
            verify(null);
        }
    });
};

// api : /request-activation-email/:user_id
exports.requestActivationEmail = function(req,res){

    //이메일 파라미터 전달
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json('유저 아이디를 입력하지 않았습니다.',0));
    //전역 이메일
    var email ='';

    //타입 체크
    if(typeof user_id !== 'number') res.json(trans_json('유저 아이디는 숫자 타입이어야 합니다.',0));

    connection_closure(function(err,connection){
        async.waterfall([
            function send_email(callback){
                connection.get_query(
                    "SELECT email FROM user WHERE user_id = ?",
                    [user_id],
                    function(err, result, msg){
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
            },
            function random_token (callback){
                crypto.randomBytes(48, function(err,buf){
                    if (err) { res.json(trans_json('랜덤 암호 토큰 생성에 실패했습니다.',0)); }
                    else {
                        var token =  buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
                        connection.get_query(
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
            },
            function insert_auth(token,callback){
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
                                connection.get_query(
                                    "INSERT INTO email_auth(user_id,email,auth_token,expiration_date) VALUES(?,?,?,?)",
                                    [user_id,email,token,expire],
                                    function(err,rows,msg){
                                        if(err) {console.log('err');callback(msg);}
                                        else {console.log('not err.....');callback(null,token,rows.insertId);}
                                    }
                                );
                            }
                            else{
                                connection.get_query(
                                        "UPDATE email_auth SET auth_token = ?, " +
                                        "expiration_date = ? WHERE user_id = ? ",
                                    [token,expire,user_id],
                                    function(err,rows,msg){
                                        if(err) {console.log('token',token);callback(msg);}//rows.insertId
                                        else {console.log('token',token);callback(null,token);}
                                    }
                                );
                            }
                        }
                    }
                )
            },
            function send_message(token,callback){
                template = '<a href="http://54.92.19.218/activation-email/'+token+'"> 계정 인증 url입니다. 클릭하세요. </a>';
                console.log('template : ',template);
                send_mail(email,'[위즈도나] 인증 메일입니다.',template,function(err){
                    if(err) {callback(err);}
                    else {callback(null);}
                });
            }
        ], function(err){
            if (err){
                connection.close_conn();
                res.json(trans_json('인증메일 전송에 실패했습니다.',0));
            }
            else {
                connection.close_conn();
                res.json(trans_json('인증메일 전송에 성공했습니다.',1));
            }
        })
    });

};

exports.requestSendEmail = function (req,res){

    var user_email = req.body.email;

    console.log('request send email is ...',req.body.email);
    var tempPass = cuid.slug();

        // 먼저 insert 먼저 하고 transporting 하도록 template 수정 필요.
        // 해시 함수를 이용한 패스워드 생성 함수 필요

    create_password(tempPass,function(err,hashPass){
        if (err) {
            res.json(trans_json('비밀번호 재발급 메일 생성에 실패하였습니다.', 0));
        }
        else {
            template_item(
                'UPDATE user SET password = ? WHERE email = ?',
                [hashPass,user_email],
                function(err,result){
                    if (err) {
                        console.log("log7!!");
                        console.log(err.code);
                        res.json(trans_json('임시 비밀번호발급에 실패하였습니다.', 0));
                    } else{
                        console.log('tempPass is...',tempPass);
                        console.log('user email is ...',user_email);

                        send_mail(
                            user_email,
                            '[위즈도나] 임시비밀번호 입니다.',
                            '임시비밀번호 : <strong>' + tempPass + '</strong>',
                            function(err){
                                if(err) {res.json(trans_json('임시비밀번호 발급에 실패하였습니다.', 0));}
                                else {res.json(trans_json('임시 비밀번호 발급에 성공하였습니다.',1));}
                            }
                        );
                    }
                }
            );
        }
    });
};


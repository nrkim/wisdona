/**
 * Created by nrkim on 2014. 8. 4..
 */
var LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt-nodejs')
    , _ = require('underscore')
    , async = require('async')
    ,template = require('../routes/template')
    ,template_item = template.template_item
    ,create_password = template.create_password
    ,duplication_check = template.duplication_check;

//passport 커스터마이징
module.exports = function(passport) {

    // 세션 얻기
    passport.serializeUser(function (user, done) {
        console.log('passport.serializeUser ====> ', user);

        console.log("user id???", user.user_id);
        done(null, user.user_id);
    });

    // 세션 지우기
    passport.deserializeUser(function (id, done) {
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            console.log("deserializeUser : ", id);
            var selectSql = 'SELECT user_id, email, password, nickname FROM user WHERE user_id = ?';
            connection.query(selectSql, [id], function (err, rows, fields) {
                if (err) {
                    console.log('db error!!');
                    connection.release();
                    return done(null, false, {'deserializeUser': 'deserialize에 실패 했습니다.'});
                }
                else {
                    var user = rows[0];
                    connection.release();
                    console.log('passport.deserializeUser ====> ', user);
                    return done(null, user);
                }
            });
        });
    });

    //회원 가입
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {

/*
            process.nextTick(function(){

            });
*/

            process.nextTick(function () {
                connectionPool.getConnection(function (err, connection) {
                    if (err){ console.log(err); return done(err); }

                    var selectSql = 'SELECT user_id, email, nickname  FROM user WHERE email = ? or nickname = ?';
                    connection.query(selectSql, [email, req.body.nickname], function (err, rows, fields) {
                        if (err) {
                            console.log('err1');
                            connection.release();
                            return done(err);
                        }
                        if (rows.length) {
                            console.log('err2');
                            connection.release();
                            return done(null, false,duplication_check(rows,req.body.nickname, email));
                        }
                        else {
                            console.log('err3');
                            create_password(password, function (err, hashPass) {
                                if (err) {
                                    console.log('err4');
                                    connection.release();
                                    return done(err);
                                }
                                else {
                                    console.log('err5');
                                    var user = {};
                                    user.email = email;
                                    user.password = hashPass;

                                    var insertSql = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,' +
                                        'like_total_cnt,sad_total_cnt,sleep_mode,create_date)' +
                                        'VALUES(?,?,?,0,0,0,0,now())';

                                    console.log('err6');
                                    template_item(
                                        insertSql,
                                        [user.email, user.password, req.body.nickname],
                                        function (err, rows, info) {
                                            console.log('err7');
                                            if (err) {console.log('err8'); return done(err);}
                                            else {
                                                console.log('err 9');
                                                console.log('rows : insertId', rows.insertId);
                                                user.user_id = rows.insertId;
                                                return done(null, user);
                                            }
                                        }
                                    );
                                }
                            });
                        }
                    });
                });
            });
        }
    ));

    //로그인
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            console.log('email',email);
            console.log('password',password);
            process.nextTick(function() {
                connectionPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log('err1');
                        return done(err);
                    }
                    console.log('err3');
                    var selectSql = 'SELECT user_id, email, password FROM user WHERE email = ?';
                    template_item(
                        selectSql,
                        [email],
                        function(err,rows,msg){
                            if (err) {
                                console.log("log2");
                                connection.release();
                                return done(err);
                            }
                            if (!rows.length) {
                                console.log('log4');
                                connection.release();
                                return done(null, false, {'loginMessage' : '존재하지 않는 사용자 입니다.'});
                            }
                            console.log('err54');
                            var user = rows[0];
                            connection.release();
                            bcrypt.compare(password, user.password, function(err, result) {
                                if (!result){
                                    console.log('errfff');
                                    return done(null, false, {'loginMessage' : '비밀번호가 틀렸습니다.'});
                                }
                                console.log('err1dsdfsdf');
                                console.log('bcrypt.compare ====> ', user.password, '(', user,')');
                                return done(null, user);
                            });
                        }
                    );

                });
            });
        })
    );

};


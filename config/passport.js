/**
 * Created by nrkim on 2014. 8. 4..
 */
var LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt-nodejs')
    , _ = require('underscore')
    , async = require('async')
    ,template = require('../routes/template')
    ,connection_closure = template.connection_closure
    ,create_password = template.create_password
    ,duplication_check = template.duplication_check;

//passport 커스터마이징
module.exports = function(passport) {

    // 세션 얻기
    passport.serializeUser(function (user, done) {
        console.log('serialize user -------->',user);
        done(null, user.user_id);
    });

    // 세션 지우기
    passport.deserializeUser(function (id, done) {
        console.log('deserialize user ------>',id);
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            var selectSql = 'SELECT user_id, email, password, nickname FROM user WHERE user_id = ?';
            connection.query(selectSql, [id], function (err, rows, fields) {
                if (err) {
                    connection.release();
                    return done(null, false, {'deserializeUser': 'deserialize에 실패 했습니다.'});
                }
                else {
                    var user = rows[0];
                    connection.release();
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

            process.nextTick(function () {
                connection_closure(function(err,connection){
                    if(err){ return done(err);}
                    else {
                        var selectSql = 'SELECT user_id, email, nickname  FROM user WHERE (email = ? or nickname = ?) and sleep_mode = 0';
                        connection.get_query(
                            selectSql,
                            [email,req.body.nickname],
                            function(err,rows){
                                if(err) {
                                    connection.close_conn();
                                    return done(err);
                                } else{
                                    if(rows.length == 0){
                                        create_password(password, function (err, hashPass,salt) {
                                            if (err) {
                                                connection.release();
                                                return done(err);
                                            }
                                            else {
                                                var user = {};
                                                user.email = email;
                                                user.password = hashPass;

                                                var insert_query = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,' +
                                                    'like_total_cnt,sad_total_cnt,sleep_mode,create_date,salt)' +
                                                    'VALUES(?,?,?,0,0,0,0,now(),?)';

                                                connection.get_query(
                                                    insert_query,
                                                    [user.email, user.password, req.body.nickname,salt],
                                                    function (err, rows, info) {
                                                        if (err) {
                                                            connection.close_conn();
                                                            return done(err);
                                                        }
                                                        else {
                                                            connection.close_conn();
                                                            user.user_id = rows.insertId;
                                                            return done(null, user);
                                                        }
                                                    }
                                                );
                                            }
                                        });

                                    } else{
                                        connection.close_conn();
                                        return done(null, false,duplication_check(rows,req.body.nickname, email));
                                    }
                                }
                            }
                        )
                    }
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
                connection_closure(function(err,connection){
                    if(err){ return done(err);}
                    else {
                        connection.get_query(
                            'SELECT user_id, email, password, salt FROM user WHERE email = ? and sleep_mode = 0',
                            [email],
                            function(err,rows){
                                if(err){
                                    connection.close_conn();
                                    return done(err);
                                } else{
                                    if(rows.length ==0){
                                        connection.close_conn();
                                        return done(null, false, {'loginMessage' : '존재하지 않는 사용자 입니다.'});
                                    } else{
                                        var user = rows[0];
                                        connection.close_conn();
                                        bcrypt.compare(password, user.password, function(err, result) {
                                            console.log('password?!?!?1',password,user.password);
                                            if(err){
                                                return done(err);
                                            }else{
                                                if (!result){
                                                    console.log('err!! not match...');
                                                    return done(null, false, {'loginMessage' : '비밀번호가 틀렸습니다.'});
                                                }
                                                else {
                                                    console.log('its..... match!!!');
                                                    console.log('user is !!!',user);
                                                    return done(null, user,{'loginMessage' : 'success'});
                                                }
                                            }
                                        });

                                    }
                                }
                            }
                        )
                    }
                });
            });
        })
    );
};


/**
 * Created by nrkim on 2014. 8. 4..
 */
var LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt-nodejs')
    , _ = require('underscore')
    , async = require('async');

//passport 커스터마이징

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        console.log('passport.serializeUser ====> ', user);

        console.log("user id???",user.user_id);
        done(null, user.user_id);
    });

    passport.deserializeUser(function(id, done) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                return done(err);
            }
            console.log("deserializeUser : ",id);
            var selectSql = 'SELECT user_id, email, password, nickname FROM user WHERE user_id = ?';
            connection.query(selectSql, [id], function(err, rows, fields) {
                if(err){
                    console.log('db error!!');
                    connection.release();
                    return done(null,false,{'deserializeUser' : 'deserialize에 실패 했습니다.'});
                }
                else{
                    var user = rows[0];
                    connection.release();
                    console.log('passport.deserializeUser ====> ', user);
                    return done(null, user);
                }
            });
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password,done) {
            console.log("nickname is :",req.body.nickname);
            console.log("password is : ",password);
            console.log('email is',email);



            process.nextTick(function() {
                connectionPool.getConnection(function(err, connection) {
                    if (err) {
                        return done(err);
                    }

                    var selectSql = 'SELECT user_id, email, nickname  FROM user WHERE email = ? or nickname = ?';
                    connection.query(selectSql, [email,req.body.nickname], function(err, rows, fields) {
                        if (err) {
                            console.log(err.code);
                            connection.release();
                            return done(err);
                        }
                        if (rows.length) {

                            var dup_nickname =_.some(rows,function(item){return item.nickname === req.body.nickname;});
                            var dup_email = _.some(rows,function(item){return item.email === email;});
                            //console.log('nickname dup :',dup_nickname, 'email dup :',dup_email);
                            if (dup_nickname){
                                if (dup_email){
                                    connection.release();
                                    return done(null,false,{'signupMessage' : '닉네임과 이메일이 중복됩니다.'});
                                }
                                else{
                                	connection.release();
                                    return done(null,false,{'signupMessage' : '닉네임이 중복됩니다.'});
                                }
                            }
                            else {
                            	connection.release();
                                return done(null, false, {'signupMessage' : '이메일이 중복됩니다.'});
                            }
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
                                        bcrypt.hash(password, salt, null, function(err, hashPass) {
                                            console.log('bcrypt.hash ====> ', hashPass, '(', hashPass.length,')');
                                            var newUser = {};
                                            newUser.email = email;
                                            newUser.password = hashPass;
                                            callback(null, newUser);
                                        });
                                    }
                                ],
                                function(err, user) {
                                    if (err) {
                                        console.log("error occured");
                                        console.log(err.code);
                                        console.log(err);
                                        connection.release();
                                        return done(err);
                                    }

                                    console.log(typeof(user.nickname));

                                    var insertSql = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,like_total_cnt,sad_total_cnt,sleep_mode,create_date)'+
                                        'VALUES(?,?,?,0,0,0,0,now())';

                                    connection.query(insertSql, [user.email, user.password, req.body.nickname], function(err, result) {
                                        if (err) {
                                            console.log("log7!!");
                                            console.log(err.code);
                                            connection.release();
                                            return done(err);
                                        }
                                        console.log("log8!!");
                                        console.log(result.insertId);
                                        user.user_id = result.insertId;
                                        connection.release();
                                        return done(null, user);
                                    });
                                });
                        }
                    });
                });
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                connectionPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("log1");

                    var selectSql = 'SELECT user_id, email, password FROM user WHERE email = ?';
                    connection.query(selectSql, [email], function(err, rows, fields) {
                        if (err) {
                            console.log("log2");
                            connection.release();
                            return done(err);
                        }
                        console.log('log3');
                        if (!rows.length) {
                            console.log('log4');
                            connection.release();
                            return done(null, false, {'loginMessage' : '존재하지 않는 사용자 입니다.'});
                        }
                        console.log('log5');

                        var user = rows[0];
                        console.log(user.password);
                        console.log(password);
                        connection.release();
                        bcrypt.compare(password, user.password, function(err, result) {
                            if (!result){
                                console.log('log6');
                                return done(null, false, {'loginMessage' : '비밀번호가 틀렸습니다.'});
                            }

                            console.log('log7');
                            console.log('bcrypt.compare ====> ', user.password, '(', user,')');
                            return done(null, user);
                        });
                    });
                });
            });
        }));
};


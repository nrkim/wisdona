/**
 * Created by nrkim on 2014. 8. 12..
 */
var FacebookTokenStrategy = require('passport-facebook-token').Strategy
    , async = require('async')
    , configAuth = require('./facebook_auth')
    , template_item = require('../routes/template').template_item
    , logger = require('./logger');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        console.log('passport.serializeUser ====> ', user);
        done(null, user.user_id);
    });

    passport.deserializeUser(function(id, done) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                return done(err);
            }
            var selectSql = 'SELECT user_id, facebook_id, facebook_token, email, ' +
                'image FROM user WHERE user_id = ?';

            connection.query(selectSql, [id], function(err, rows, fields) {
                var user = {};
                user.user_id = rows[0].user_id;
                user.facebookId = rows[0].facebook_id;
                user.facebookToken = rows[0].facebook_token;
                user.facebookEmail = rows[0].email;
                user.facebookPhoto = rows[0].image;
                connection.release();
                console.log('passport.deserializeUser ====> ', user);
                connecgtion.release();
                return done(null, user);
            });
        });
    });

    //face book sign up / 로그인 페이지

    passport.use('facebook-signup',new FacebookTokenStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret
        },
        function(accessToken, refreshToken, profile, done) {
        	process.nextTick(function() {
            	connectionPool.getConnection(function(err, connection) {
                    if (err) {
                    	console.log('log0');
                        return done(err);
                    }
                    console.log(profile);

                    var facebookPhoto = "https://graph.facebook.com/v2.1/me/picture?access_token=" + accessToken;
                    var selectSql = 'SELECT user_id, facebook_id, facebook_token, nickname ' +
                        'email, image FROM user WHERE facebook_id = ? ';

                    connection.query(selectSql, [profile.id], function(err, rows, fields) {
                        if (err) {
                        	console.log('log1');
                            connection.release();
                            return done(err);
                        }
                        if (rows.length) {
                            var user = {};
                            user.user_id = rows[0].user_id;
                            user.facebookId = rows[0].facebook_id;
                            user.facebookToken = rows[0].facebook_token;
                            user.facebookEmail = rows[0].email;
                            user.facebookPhoto = rows[0].image;
                            if (accessToken !== user.facebookToken) {
                                var updateSql = 'UPDATE user SET facebook_token = ?, image = ? WHERE facebook_id = ?';
                                connection.query(updateSql, [accessToken, facebookPhoto, profile.id], function(err, result) {
                                    if (err) {
                                        console.log('err 1');
                                        connection.release();
                                        return done(err);
                                    }
                                    else {
                                        console.log('not err 1');
                                        connection.release();
                                        return done(null, user);
                                    }
                                });
                            } else {
                                console.log('not err 2');
                                connection.release();
                                return done(null, user);
                            }
                        } else {
                            var query = "SELECT email FROM user WHERE email = ?"
                            template_item(
                                query,
                                [profile.emails[0].value],
                                function(err,rows,info){
                                    if(err){
                                        done(err);
                                    }
                                    else {
                                        if(rows.length == 0){
                                            console.log('not err 5');
                                            var newUser = {};
                                            newUser.facebookId = profile.id;
                                            newUser.facebookToken = accessToken;
                                            logger.debug('email',profile.emails[0].value);
                                            newUser.facebookEmail = profile.emails[0].value;
                                            newUser.facebookName = profile.name.givenName + ' ' + profile.name.familyName;
                                            newUser.facebookPhoto = "https://graph.facebook.com/v2.1/me/picture?access_token=" + accessToken;
                                            var insertSql = 'INSERT INTO user (facebook_id, facebook_token, email, ' +
                                                'image, nickname) VALUES(?, ?, ?, ?, ?)';
                                            connection.query(insertSql, [newUser.facebookId,
                                                newUser.facebookToken, newUser.facebookEmail,
                                                newUser.facebookPhoto, "이름없음"], function(err, result) {
                                                if (err) {
                                                    console.log('err 1222',err.message);
                                                    connection.release();
                                                    return done(err);
                                                }
                                                else {
                                                    console.log('not err222')
                                                    newUser.user_id = result.insertId;
                                                    connection.release();
                                                    return done(null, newUser);
                                                }
                                            });
                                        } else {
                                            console.log('이메일 중복!QQQ');
                                            done(null,false,'이메일이 중복됩니다.');
                                        }
                                    }
                                }
                            );


                        }
                    });
                });
            });
        }));


    passport.use('facebook-login',new FacebookTokenStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                connectionPool.getConnection(function(err, connection) {
                    if (err) {
                        return done(err);
                    }

                    var facebookPhoto = "https://graph.facebook.com/v2.1/me/picture?access_token=" + accessToken;
                    var selectSql =  'SELECT user_id, facebook_id, facebook_token, nickname ' +
                                     'email, image FROM user WHERE facebook_id = ? ';

                    connection.query(selectSql, [profile.id], function(err, rows, fields) {
                        if (err) {
                            connection.release();
                            return done(err);
                        }
                        if (rows.length) {
                            var user = {};
                            user.user_id = rows[0].user_id;
                            user.facebookId = rows[0].facebook_id;
                            user.facebookToken = rows[0].facebook_token;
                            user.facebookEmail = rows[0].email;
                            user.facebookPhoto = rows[0].image;
                            if (accessToken !== user.facebookToken) {
                                var updateSql = 'UPDATE user SET facebook_token = ?, image = ? WHERE facebook_id = ?';
                                connection.query(updateSql, [accessToken, facebookPhoto, profile.id], function(err, result) {
                                    if (err) {
                                        connection.release();
                                        return done(err);
                                    }
                                    else {
                                        connection.release();
                                        return done(null, user);
                                    }
                                });
                            } else {
                                connection.release();
                                return done(null, user);
                            }
                        } else {
                            done(null,false,"등록된 정보가 없습니다. 회원가입 화면으로 넘어갑니다.");
                        }
                    });
                });
            });
        }));
};

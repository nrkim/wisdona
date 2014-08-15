/**
 * Created by nrkim on 2014. 8. 12..
 */
var FacebookTokenStrategy = require('passport-facebook-token').Strategy
    , async = require('async')
    , configAuth = require('./facebook_auth');

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
            console('deserialize!!!');
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
                return done(null, user);
            });
        });
    });

    passport.use(new FacebookTokenStrategy({
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

                    var facebookPhoto = "https://graph.facebook.com/v2.1/me/picture?access_token=" + accessToken;
                    var selectSql = 'SELECT user_id, facebook_id, facebook_token, ' +
                        'email, image FROM user WHERE facebook_id = ?';
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
                                    	connection.release();
                                        return done(err);
                                    }
                                    connection.release();
                                    return done(null, user);
                                });
                            } else {
                            	connection.release();
                                return done(null, user);
                            }
                        } else {
                        	var newUser = {};
                            newUser.facebookId = profile.id;
                            newUser.facebookToken = accessToken;
                            newUser.facebookEmail = profile.emails[0].value;
                            newUser.facebookName = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebookPhoto = "https://graph.facebook.com/v2.1/me/picture?access_token=" + accessToken;
                            var insertSql = 'INSERT INTO users(facebook_id, facebook_token, email, ' +
                                ' image) VALUES(?, ?, ?, ?, ?)';
                            connection.query(insertSql, [newUser.facebookId, 
                                newUser.facebookToken, newUser.facebookEmail, 
                                newUser.facebookPhoto], function(err, result) {
                                if (err) {
                                    connection.release();
                                    return done(err);
                                }
                                newUser.id = result.insertId;
                                connection.release();
                                return done(null, newUser);
                            });
                        }
                    });
                });
            });
        }));
};

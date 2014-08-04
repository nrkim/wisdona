/**
 * Created by nrkim on 2014. 8. 4..
 */
var LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt-nodejs')
    , async = require('async')
    , dbConfig = require('../config/database');

var mysql = require('mysql');

//var connection = mysql.createConnection(dbConfig.url);

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        console.log('passport.serializeUser ====> ', user);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query('SELECT id, email, password FROM users WHERE id = ?', [id], function(err, rows, fields) {
            console.log('passport.deserializeUser ====> ', rows[0]);
            done(null, rows[0]);
            connection.end();
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                var connection = mysql.createConnection(dbConfig.url);
                var selectSql = 'SELECT id FROM users WHERE email = ?';
                connection.query(selectSql, [email], function(err, rows, fields) {
                    if (err) {
                        connection.end();
                        return done(err);
                    }
                    if (rows.length) {
                        connection.end();
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
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
                                    connection.end();
                                    return done(err);
                                }
                                var insertSql = 'INSERT INTO users(email, password) VALUES(?, ?)';
                                connection.query(insertSql, [user.email, user.password], function(err, result) {
                                    if (err) {
                                        connection.end();
                                        return done(err);
                                    }
                                    user.id = result.insertId;
                                    connection.end();
                                    return done(null, user);
                                });
                            });
                    }
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
                var connection = mysql.createConnection(dbConfig.url);
                var selectSql = 'SELECT id, email, password FROM users WHERE email = ?';
                connection.query(selectSql, [email], function(err, rows, fields) {
                    if (err) {
                        connection.end();
                        return done(err);
                    }
                    if (!rows.length) {
                        connection.end();
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }

                    bcrypt.compare(password, rows[0].password, function(err, result) {
                        if (!result){
                            connection.end();
                            return done(null, false, req.flash('loginMessage', 'Oops! wrong password.'));
                        }
                        console.log('bcrypt.compare ====> ', rows[0].password, '(', rows[0],')');
                        connection.end();
                        return done(null, rows[0]);
                    });
                });
            });
        }));
};

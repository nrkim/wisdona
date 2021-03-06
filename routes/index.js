/**
 * Created by nrkim on 2014. 7. 29..
 */
var express = require('express');
var account = require('../routes/account')
    ,category = require('../routes/category')
    ,login = require('../routes/login')
    ,message = require('../routes/message')
    ,post = require('../routes/post')
    ,review = require('../routes/review')
    ,trade = require('../routes/trade')
    ,user = require('../routes/user')
    ,other = require('../routes/other')
    ,trans_json = require('../routes/json').trans_json
    ,create_user = require('../routes/json').create_user
    ,send_email = require('../routes/send_email')
    ,template_item = require('../routes/template').template_item
    ,logger = require('../config/logger')
    ,fileManager = require('./fileManager');

var isLoggedIn = function (req, res, next) {

    if (req.isAuthenticated() ){
        return next();
    }
    else {
        res.json(trans_json("로그아웃되어 있습니다. 다시 로그인 해 주세요.",0));
    }
};
//ㄴㄴㄴ


module.exports = function(app,passport) {

    // 로그인
    //
    app.post('/login',express.bodyParser(), function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (user === false) {
                res.json(trans_json(info.loginMessage,0));
            } else {
                template_item(
                    "UPDATE user SET gcm_registration_id = ? WHERE user_id = ? ",
                    [req.body.gcm_registration_id,user.user_id],
                    function(err,result,msg){
                        if (err) {
                            req.err_info = err;
                            next();
                        }
                        else {
                            req.session.passport.user = user.user_id;
                            console.log('error 아니죠!! user는...',user);
                            next();
                        }
                    }
                );
            }
        })(req, res, next);
    },login.login);

    app.post('/facebook-signup',
        express.bodyParser(),
        function(req, res, next) {
            template_item(
                "SELECT nickname FROM user WHERE nickname = ? ",
                [req.body.nickname],
                function (err, rows, msg) {
                    if (err){
                        res.json(trans_json(err.message,0));
                    }
                    if (rows.length == 0) {
                        passport.authenticate('facebook-signup',
                         function(err, user, info) {
                            if(user){
                                req.session.passport.user = user.user_id;
                                next();
                            }
                            else{
                                res.json(trans_json(info,0));
                            }
                        })(req, res, next);
                    } else {
                        res.json(trans_json('닉네임이 중복됩니다.',0));
                    }
                }
            );
        },login.registerLocal);


    app.post('/facebook-login',
        express.bodyParser(),
        function(req, res, next) {
            passport.authenticate('facebook-login', function(err, user, info) {
                if (err){
                    res.json(trans_json('sql 에러입니다 : '+err.message,0));
                } else{
                    if(user){
                        template_item(
                            "UPDATE user SET gcm_registration_id = ? WHERE user_id = ? ",
                            [req.body.gcm_registration_id,user.user_id],
                            function(err,result,msg){
                                if (err) { console.log('ldd :',err.message);res.json(trans_json('로그인에 실패했습니다.',0));}
                                else {
                                    req.session.passport.user = user.user_id;
                                    res.json(trans_json("success",1,create_user(user.user_id)));
                                }
                            }
                        );
                    } else{
                        res.json(trans_json(info,2));
                    }
                }
            })(req, res, next);
        });

    app.post('/facebook-logout',login.facebookLogout);

    app.post('/users/:user_id/account-settings/password/update', express.bodyParser(),login.updatePassword);
    app.get('/request-activation-email/:user_id', send_email.requestActivationEmail);
    app.post('/request-send-email', send_email.requestSendEmail);
    app.post('/logout', isLoggedIn,login.logout);
    app.get('/activation-email/:authkey', login.activationEmail);

    // 계정 생성,정보 관련

    app.post('/users/create',express.bodyParser(), function(req, res, next) {
        console.log('sign up user');
        passport.authenticate('local-signup', function(err, user, info) {
            if (user === false) {
                res.json(trans_json(info.signupMessage,0));
            } else {
                req.session.passport.user = user.user_id;
                res.json(trans_json("success",1,create_user(user.user_id)));
            }
        })(req, res, next);
    });

    app.get('/users/:user_id/profile/show', account.getUserInfo);
    app.post('/users/destroy', isLoggedIn, account.destroyUserAccount);
    app.get('/users/:user_id/account-settings/show', isLoggedIn, account.getAccountSettings);
    app.post('/users/:user_id/account-settings/update', account.uploadImage, account.updateAccountSettings);

    // 사용자
    app.get('/users/:user_id/posts/list', user.getUserPostList);
    app.get('/users/:user_id/reviews/list', user.getReviewList);
    app.get('/users/:user_id/req-posts/list',isLoggedIn, user.getRequestPostList);

    // 대화
    app.get('/users/:user_id/message-groups/list',isLoggedIn,message.getMessageGroupList);
    app.post('/users/:user_id/message-groups/destroy',isLoggedIn, message.destroyMessageGroup);
    app.post('/users/:user_id/message-groups/:trade_id/create',isLoggedIn,message.createMsg);//express.bodyParser()
    app.get('/users/:user_id/message-groups/:trade_id/list',isLoggedIn, message.getMessageList);
    app.get('/users/:user_id/message-groups/unreadlist',message.getUnreadMessgeList);//getUnreadMessgeLis t //
    app.post('/users/:user_id/message-groups/:trade_id/unread/confirm',isLoggedIn,message.confirmMessage);

    // 평가
    app.post('/users/:user_id/reviews/create',isLoggedIn, review.createUserReview);

    // 게시물
    app.post('/users/:user_id/posts/create',isLoggedIn, post.createPost, post.insertPostQuery);
    app.post('/users/:user_id/posts/update',isLoggedIn, post.updatePost);
    app.post('/users/:user_id/posts/destroy',isLoggedIn, post.destroyPost);
    app.get('/posts/:post_id/show', post.getPostDetail);
    app.get('/posts/list', post.getPostList);
    app.get('/posts/search', post.searchPosts);
    app.post('/users/:user_id/posts/report',isLoggedIn, post.reportPost);


    // 교환
    app.post('/users/:user_id/posts/send-request',isLoggedIn, trade.sendRequestPost);
    app.post('/users/:user_id/posts/accept',isLoggedIn, trade.acceptPost);
    app.post('/users/:user_id/posts/cancel',isLoggedIn, trade.cancelPost);

    // 카테고리
    app.get('/categories', category.getCategoryList);

    // 기타
    app.get('/genres',other.getGenreList);
    app.get('/book_conditions',other.getBookConditionList);
    app.post('/users/:user_id/ask/create',isLoggedIn,other.getQnaList);
    app.get('/rules/terms',other.getServiceTerms);
    app.get('/rules/privacy',other.getPrivacy);
    app.get('/news', other.getNewsList);
    app.get('/faq', other.getFaqList);

    // 파일 매니저
    app.get('/images/:imagepath', fileManager.getImage);

    // 최종 발표회 시연용 API
    app.post('/change-trade-day', trade.changeDay);
};
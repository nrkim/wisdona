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
    ,trans_json = require('../routes/json').trans_json;

var isLoggedIn = function (req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }

    res.json(trans_json("로그아웃되어 있습니다. 다시 로그인 해 주세요.",0));
}

module.exports = function(app,passport) {

    // 로그인
    app.post('/login', express.bodyParser(), function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (user === false) {
                res.json(trans_json(info.loginMessage,0));
            } else {
                res.json(trans_json("success",1));
            }
        })(req, res, next);
    });
    //app.post('/auth/facebook/token',
    //    express.bodyParser(), function(req, res, next) {
    //        passport.authenticate('facebook-token', function(err, user, info) {
    //            if (user === false) {
    //                res.json(trans_json(info.loginMessage,0));
    //            } else {
    //                res.json(trans_json("success",1));
    //            }
    //        })(req, res, next);
    //    });

    //app.post('/auth/facebook/token',
    //    express.bodyParser(),
    //    passport.authenticate('facebook-token', { scope: ['email'] }),
    //    login
    //);

    app.post('/users/:user_id/account-settings/password/update', login.updatePassword);
    app.get('/request-activation-email/:user_id', login.requestActivationEmail);
    app.post('/request-send-email', login.requestSendEmail);
    app.post('/logout',isLoggedIn,login.logout);
    app.post('/activation-email/:authkey', login.activationEmail);

    // 계정 생성,정보 관련
    app.post('/users/create',express.bodyParser(),function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (user === false) {
                res.json(trans_json(info.signupMessage,0));
            } else {
                res.json(trans_json("success",1));
            }
        })(req, res, next);
    });
    app.get('/users/:user_id/profile/show',isLoggedIn, account.getUserInfo);
    app.post('/users/destroy',isLoggedIn, account.destroyUserAccount);
    app.get('/users/:user_id/account-settings/show', account.getAccountSettings);
    app.post('/users/:user_id/account-settings/update', account.uploadImage, account.updateAccountSettings);

    // 사용자
    app.get('/users/:user_id/posts/list', user.getUserPostList);
    app.get('/users/:user_id/reviews/list', user.getReviewList);
    app.get('/users/:user_id/req-posts/list',isLoggedIn, user.getRequestPostList);

    // 대화
    app.get('/users/:user_id/message-groups/list',isLoggedIn, message.getMessageGroupList);
    app.post('/users/:user_id/message-groups/destroy',isLoggedIn, message.destroyMessageGroup);
    app.post('/users/:user_id/message-groups/:trade_id/create',isLoggedIn, message.createMessage);
    app.get('/users/:user_id/message-groups/:trade_id/list',isLoggedIn, message.getMessageList);
    app.get('/users/:user_id/message-groups/:trade_id/unread/list',isLoggedIn,message.getUnreadMessgeList);
    app.post('/users/:user_id/message-groups/:trade_id/unread/confirm',isLoggedIn,message.confirmMessage);


    // 평가
    app.post('/users/:user_id/reviews/create',isLoggedIn, review.createUserReview);

    // 게시물
    app.post('/users/:user_id/posts/create',isLoggedIn, post.createPost, post.uploadImages);
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

    // GCM

}
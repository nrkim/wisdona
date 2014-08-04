
var express = require('express');
var routes = require('./routes')
    ,account = require('./routes/account')
    ,category = require('./routes/category')
    ,login = require('./routes/login')
    ,message = require('./routes/message')
    ,post = require('./routes/post')
    ,review = require('./routes/review')
    ,trade = require('./routes/trade')
    ,user = require('./routes/user');

var app = express();
//var favicon = require('static-favicon');


//app.use(favicon());
app.use(express.bodyParser());
//app.use(bodyParser.urlencoded());


// 로그인

app.post('/login',login.login);
app.get('/request-activation-email/:user_id',login.requestActivationEmail);
app.post('/request-send-email',login.requestSendEmail);
app.post('/logout',login.logout);
app.post('/activation-email/:authkey',login.activationEmail);
app.get('/update-password/:authkey',login.updatePassword);

// 계정 생성,정보 관련
app.get('/users/:user_id/profile/show',account.getUserInfo);
app.post('/users/create',account.createUser);
app.post('/users/destroy',account.destroyUserAccount);

app.get('/users/:user_id/account-settings/show',account.getAccountSettings);
app.post('/users/:user_id/account-settings/update',account.updateAccountSettings);

// 사용자
app.get('/users/:user_id/posts/list',user.getUserPostList);
app.get('/users/:user_id/reviews/list',user.getReviewList);
app.get('/users/:user_id/req-posts/list',user.getRequestPostList);

// 대화
app.get('/users/:user_id/message-groups/list',message.getMessageGroupList);
app.post('/users/:user_id/message-groups/destroy',message.destroyMessageGroup);
app.post('/users/:user_id/message-groups/:trade_id/create',message.createMessage);
app.get('/users/:user_id/message-groups/:trade_id/list',message.getMessageList);

// 평가
app.post('/users/:user_id/reviews/create',review.createUserReview);

// 게시물
app.post('/users/:user_id/posts/create',post.createPost);
app.post('/users/:user_id/posts/update',post.updatePost);
app.post('/users/:user_id/posts/destroy',post.destroyPost);
app.get('/posts/:post_id/show',post.getPostDetail);
app.get('/posts/list',post.getPostList);
app.get('/posts/search',post.searchPosts);
app.post('/users/:user_id/posts/report',post.reportPost);

// 교환
app.post('/users/:user_id/posts/send-request',trade.sendRequestPost);
app.post('/users/:user_id/posts/accept',trade.acceptPost);
app.post('/users/:user_id/posts/cancel',trade.cancelPost);

// 카테고리
app.get('/categories',category.getCategoryList);

app.listen(3000);
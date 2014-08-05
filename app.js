
var express = require('express')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , util = require('util');

require('./config/passport')(passport);

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('short'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({ secret: 'wisdona' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

//require('./routes')(app, passport);

require('./routes')(app);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


// connection pool 만들기
// 다쓰면 반납 시키기


var express = require('express')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , mysql = require('mysql')
    , util = require('util')
    , dbConfig = require('./config/database');

var MySQLStore = require('connect-mysql')(express);
global.connectionPool = mysql.createPool(dbConfig);

var options = {
    pool: connectionPool
};

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




app.use(express.session({
    secret: 'tacademymobileserverexpert',
    store: new MySQLStore(options),
    cookie: {
        maxAge: 60000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

//require('./routes')(app, passport);

require('./routes')(app, passport);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


// connection pool 만들기
// 다쓰면 반납 시키기

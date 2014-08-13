
var express = require('express')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , mysql = require('mysql')
    , util = require('util')
    , dbConfig = require('./config/database')
    , gcmConfig = require('./config/gcm');

var MySQLStore = require('connect-mysql')(express);
global.connectionPool = mysql.createPool(dbConfig);

var options = {
    pool: connectionPool
};

require('./config/passport')(passport);
require('./config/facebook')(passport);

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('short'));
app.use(express.cookieParser());
app.use(express.compress());

app.use(express.json());
app.use(express.urlencoded());

app.use(express.methodOverride());

app.use(express.session({
    secret: 'tacademymobileserverexpert',
    store: new MySQLStore(options),
    cookie: {
        maxAge: 2160000
    }
}));
app.use(passport.initialize());
app.use(passport.session({pauseStream:  true}));
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

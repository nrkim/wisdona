
var express = require('express')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , mysql = require('mysql')
    , util = require('util')
    , dbConfig = require('./config/database')
    , gcmConfig = require('./config/gcm')
    , cron_job = require('./routes/cron_job').auth_token_cron;

var MySQLStore = require('connect-mysql')(express);
global.connectionPool = mysql.createPool(dbConfig);

var options = {
    pool: connectionPool
};

function handleDisconnect() {
    connectionPool = mysql.createPool(dbConfig);


    connectionPool.getConnection(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connectionPool.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

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
        maxAge: 31536000000
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

cron_job();

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

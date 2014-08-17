
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

function handleDisconnect() {
    connectionPool = mysql.createPool(dbConfig);        // Recreate the connection, since
                                                        // the old one cannot be reused.

    connectionPool.getConnection(function (err) {       // The server is either down
        if (err) {                                      // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);         // We introduce a delay before attempting to reconnect,
        }                                               // to avoid a hot loop, and to allow our node script to
    });                                                 // process asynchronous requests in the meantime.
                                                        // If you're also serving http, display a 503 error.
    connectionPool.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {  // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                        // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
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


Date.prototype.format = function(format) //author: meizz
{
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
                RegExp.$1.length==1 ? o[k] :
                ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

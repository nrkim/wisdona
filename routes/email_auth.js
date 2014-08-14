/**
 * New node file
 */
var nodemailer = require('nodemailer')
	,smtpPool = require('nodemailer-smtp-pool')
	,winston = require('winston')
	,cuid = require('cuid')
	,authConfig = require('./config/auth');


var logger = new winston.Logger({
	transports: [
	             new winston.transports.Console({
	            	 level : 'error'			//error level 로하면 info 안보임
	             }),
	             new winston.transports.DailyRotateFile({
	            	 level : 'debug',
	            	 filename : 'app-debug-log',
	            	 datePattern : '.yyyy-MM-ddTHH-mm',
	            	 maxsize : 1024
	             })
	 ]
});

var transporter = nodemailer.createTransport({
	service : authConfig.gmailAuth.service,
	auth : {
		user : authConfig.gmailAuth.user,
		pass : authConfig.gmailAuth.pass
	}	
});

var tempPass = cuid.slug();

var mailOptions = {
		from : 'nrkim1122@gmail.com',
		to : ['khnanalll@gmail.com','krabat198@gmail.com'],
		subject : 'Temporary Password',
		html : 'Temporary Password : <strong>' + tempPass + '</strong>'
}

transporter.sendMail(mailOptions, function(err, info){
	if (err){
		logger.error(err);	
	}else {
		logger.debug(info);
		logger.info("Message sent: ",info.response);
	}
});

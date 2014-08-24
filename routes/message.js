/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 불러오기
var json = require("./json");
var async = require("async");
var trans_json = json.trans_json;
var message_list = json.message_list;
var message_window = json.message_window
    ,template = require('./template')
    ,template_item = template.template_item
    ,template_list = template.template_list
    ,unread_msg_lst= json.unread_msg_lst
    ,connection_closure = template.connection_closure
    ,transaction_closure = template.transaction_closure;
var _ = require('underscore');
var sendMessage = require('./gcm').sendMessage;


// api : /users/:user_id/message-groups/list
exports.getMessageGroupList = function(req,res){

    logger.debug('/--------------------------------------- getMessageGroupList ----------------------------------------/');
    logger.debug('session : ',req.session.passport.user);
    logger.debug('query : ',{page : req.query.page, count : req.query.count});

    //parameter로 받은 사용자 아이디
    var user_id = req.session.passport.user;
    //var user_id = Number(req.params.user_id);
    console.log('user_id ',user_id);

    // query string 처리
    var page = Number(req.query.page) || 0;
    var count = Number(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") { res.json('유저 아이디 타입은 숫자여야 합니다.',0); }
    if (typeof user_id != "number") { res.json('페이지 타입은 숫자여야 합니다.',0); }
    if (typeof count   != "number") { res.json('카운트 타입은 숫자여야 합니다',0); }

    var query =
        "select m.trade_id, (CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END) from_user_id, " +
        "nickname, image, m.trade_id, title, message, m.be_message_cnt, m.create_date from ( select trade_id as trade_id, " +
        "from_user_id as from_user_id, to_user_id as to_user_id, message as message, create_date as create_date, d.be_message_cnt " +
        "as be_message_cnt from message m join (select max(create_date) AS max_date, SUM(CASE WHEN to_user_id = ? AND " +
        "is_read = 0 then 1 ELSE 0 END) " +
        "as be_message_cnt from message group by trade_id ) d where m.create_date = d.max_date) m " +
        "JOIN user u ON u.user_id = (CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END) " +
        "JOIN trade t ON m.trade_id = t.trade_id JOIN post p ON p.post_id = t.post_id JOIN book b ON b.book_id = p.book_id " +
        "where (m.from_user_id = ? or m.to_user_id = ?) and (CASE WHEN req_user_id = ? THEN be_show_group ELSE do_show_group END) = 1 " +
        "order by m.create_date desc limit ?, ? ";


    template_list(
        query,
        [user_id,user_id,user_id,user_id,user_id,user_id,start,count],
        message_list,
        function(err,result,msg){
            if(err) {
                res.json(trans_json(msg,0));
            }
            else {
                if(result) {
                    res.json(trans_json(msg,1,result));
                }
                else {
                    res.json(trans_json(msg,1));
                }
            }
        }
    );

};

exports.destroyMessageGroup = function(req,res){

    logger.debug('/--------------------------------------- destroyMessageGroup ----------------------------------------/');
    logger.debug('session : ',{user_id : req.session.passport.user});
    logger.debug('body : ',req.body);

    var user_id = req.session.passport.user;
    var trade_id_list = req.body.trade_id_list || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0)) ;

    var query = "UPDATE trade t JOIN post p ON p.post_id = t.post_id " +
        "SET be_show_group = (CASE WHEN req_user_id = ? THEN false ELSE true END), " +
        "do_show_group = (CASE WHEN user_id = ? THEN false ELSE true END) " +
        "WHERE trade_id = ?";

    transaction_closure(function(err,connection){
        if (err){res.json(trans_json('데이터 베이스 커넥션 오류입니다.',0));}
        else{
            async.each(trade_id_list, function( trade_id, callback) {
                connection.get_query(
                    query,
                    [user_id,user_id,trade_id],
                    function(err,rows,msg){
                        if(err) { callback(err); }
                        else { callback(null) }
                    }
                )
            }, function(err){
                if (err) {
                    connection.get_rollback(function(err_msg){
                       connection.close_conn();
                       res.json(trans_json(err_msg,0));
                    });
                } else {
                    connection.get_commit(function (err) {
                        if (err) {
                            connection.close_conn();
                            res.json(trans_json('커밋 작업에 실패하였습니다',0));
                        }
                        else {
                            connection.close_conn();
                            res.json(trans_json('success',1));
                        }
                    });
                }
            });
        }
    });
};

// api : /users/:user_id/message-groups/:trade_id/create
exports.createMsg = function(req,res){

    logger.debug('/--------------------------------------- createMsg ----------------------------------------/');
    logger.debug('session : ',{user_id : req.session.passport.user});
    logger.debug('body : ',req.body);
    logger.debug('params : ',{trade_id : req.params.trade_id});

    //파라미터
    var user_id = req.session.passport.user  || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));
    var message = req.body.message   || res.json(trans_json("메시지를 입력하지 않았습니다.",0));

    //타입 검사
    if (typeof user_id  != "number") { res.json('유저 아이디 타입은 숫자여야 합니다.',0); }
    if (typeof message  != "string") { res.json('메시지 타입은 문자열여야 합니다.',0); }
    if (typeof trade_id != "number") { res.json('교환 아이디 타입은 숫자여야 합니다',0); }


    connection_closure(function(err,connection){
        if(err){ res.json(trans_json('커넥션을 얻는데 실패했습니다 : ',+err,0)); }
        else {
            async.waterfall([
                function saveMessage(callback){             // 메시지 저장
                    var query =
                        'INSERT INTO message(from_user_id, to_user_id, message, is_read, trade_id, is_sended) ' +
                        'SELECT ?, (CASE WHEN req_user_id = ? THEN p.user_id ELSE req_user_id END), ?, 0, t.trade_id, 0 ' +
                        'FROM trade t ' +
                        'JOIN post p ON t.post_id = p.post_id ' +
                        'WHERE t.trade_id = ? ';
                    connection.get_query(
                        query,
                        [user_id,user_id,message,trade_id],
                        function(err,rows){
                           // console.log('log1',insert_query);
                            if (err) {console.log('log2');callback(err); }
                            else {
                                var message_id =rows.insertId;
                                console.log('log3');callback(null,message_id);
                            }
                        }
                    )
                },
                function getDeviceId (message_id,callback){            // 디바이스 아이디 추출
                    connection.get_query(
                        'SELECT to_user_id, gcm_registration_id, push_settings FROM user u JOIN message m ON u.user_id = m.to_user_id '+
                        'WHERE m.message_id = ? ',
                        [message_id],
                        function(err,rows,info){
                            console.log('log4');
                            var device_list=_.map(rows, function(item){
                                return item.gcm_registration_id;
                            });
                            console.log('device_list',device_list);
                            var push_settings_arr = _.map(rows, function(item) {
                                return item.push_settings
                            });
                            console.log('push ',push_settings_arr);
                            callback(null,device_list,push_settings_arr);
                        }
                    )
                },
                function sendGCM (device_list, push_settings_arr, callback){       //GCM 보내는 함수
                    //userDeviceIds, userPushSettings, code, title, msg, callback ) {
                    sendMessage(device_list,push_settings_arr,5,"wisdona",message,
                        function(err){
                            if(err) { console.log('log7');callback(err); }
                            //console.log('log....');res.json(trans_json('메시지 전송에 실패했습니다.'+err,0));}
                            else { console.log('log8');callback(null);}
                            //console.log('loglognnbb');res.json(trans_json('메시지 전송에 성공했습니다.',1));}
                        });
                }
            ],function(err){
                if(err) {

                    //console.log('log11',err.message);
                    connection.close_conn();
                    res.json(trans_json('메시지 전송에 실패했습니다.'+err,0));
                }
                else {
                    //console.log('log12');
                    connection.close_conn();
                    res.json(trans_json('메시지 전송에 성공했습니다.',1));
                }
            })
        }
    });

};

exports.createMessage = function(req,connection,next){

    // 파라미터
    var user_id = req.session.passport.user;
    var trade_id = Number(req.params.trade_id) || next(new Error("거래 아이디를 입력하지 않았습니다."));
    var message = req.body.message   || next(new Error("메시지를 입력하지 않았습니다."));

    //타입 검사
    if (typeof user_id  != "number") { next(new Error('유저 아이디 타입은 숫자여야 합니다.'));}
    if (typeof message  != "string") { next(new Error('메시지 타입은 문자열여야 합니다.'));}
    if (typeof trade_id != "number") { next(new Error('트레이드 아이디 타입은 숫자여야 합니다'));}

    var query =
        "INSERT INTO message(from_user_id, to_user_id, message,is_read, trade_id, is_sended) " +
        "SELECT ?, (CASE WHEN req_user_id = ? THEN p.user_id ELSE req_user_id END), ?,0, t.trade_id, 0 " +
        "FROM trade t " +
        "JOIN post p ON t.post_id = p.post_id " +
        "WHERE t.trade_id = ? ";

    connection.query(query,[user_id,user_id,message,trade_id],function(err,rows){
        if (err){ next(err); }
        else { next(null,rows) }
    });

};

exports.getMessageList = function(req,res){

    logger.debug('/--------------------------------------- getMessageList ----------------------------------------/');
    logger.debug('session : ',{user_id : req.session.passport.user});
    logger.debug('params : ',{trade_id :req.params.trade_id});
    logger.debug('query : ',{page : req.query.page, count : req.query.count});

    //parameter로 받은 사용자 아이디
    var user_id = req.session.passport.user  || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = req.params.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    // query string 처리
    var page = Number(req.query.page) || 0;
    var count = Number(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof user_id != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    //쿼리문
    var query =
        "SELECT user_id, nickname, image, message, m.create_date " +
        "FROM trade t JOIN message m ON t.trade_id = m.trade_id " +
        "JOIN user u ON m.from_user_id = u.user_id WHERE t.trade_id = ? LIMIT ?, ? ";
    //sample 예제 trade_id =3, 0, 10

    template_list(
        query,
        [trade_id,start,count],
        message_window,
        function(err,result,msg){
            if(err) { res.json(trans_json(msg,0)); }
            else {
                if(result) res.json(trans_json(msg,1,result));
                else res.json(trans_json(msg,1));
            }
        }
    );
};

//api : /users/:user_id/message-groups/unreadlist
exports.getUnreadMessgeList = function(req,res){

    logger.debug('/--------------------------------------- getUnreadMessgeList ----------------------------------------/');
    logger.debug('session : ',{user_id : req.session.passport.user});

    var user_id = req.session.passport.user;

    var get_query =
        'SELECT trade_id, message, DATE_FORMAT(convert_tz(m.create_date , "UTC", "Asia/Seoul"), "%Y-%m-%d %H:%i" ) AS create_date, ' +
        'from_user_id AS user_id , nickname, image ' +
        'FROM user u JOIN message m ON u.user_id = m.from_user_id ' +
        'WHERE to_user_id = ? AND m.is_sended = 0 ';

    template_list(
        get_query,
        [user_id],
        unread_msg_lst,
        function(err,result,msg){
            if (err) {
                logger.error('select message error',err.message);
                res.json(trans_json("읽지 않은 메시지를 찾는 과정에서 에러가 일어났습니다."+err.message,0));
            }
            else {
                if (result.length == 0){
                    res.json(trans_json("읽지 않은 메시지가 없습니다.",1,result));
                } else{
                    template_item(
                        "UPDATE message SET is_sended = TRUE WHERE to_user_id = ? and is_sended = FALSE",
                        [user_id],
                        function(err,rows){
                            if(err) {
                                logger.error('update message error',err.message);
                                res.json(trans_json(err.message,0));
                            }
                            else {
                                res.json(trans_json('success',1,result));
                            }
                        }
                    );
                }
            }
        }
    );
};

exports.confirmMessage = function(req,res){

    logger.debug('/--------------------------------------- confirmMessage ----------------------------------------/');
    logger.debug('session : ',{user_id : req.session.passport.user});
    logger.debug('params : ',{trade_id : req.params.trade_id});

    var user_id = req.session.passport.user  || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var query = "UPDATE message m " +
                "SET m.is_read = true " +
                "WHERE m.trade_id = ? AND to_user_id = ? ";

    template_item(
        query,
        [trade_id,user_id],
        function(err,rows,msg){
            if(err) res.json(trans_json(msg,0));
            else res.json(trans_json(msg,1));
        }
    );
};
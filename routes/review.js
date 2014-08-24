/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');
var trans_json = json.trans_json
    ,template = require('./template')
    ,template_item = template.template_item
    ,connection_closure = template.connection_closure
    ,async = require('async')
    ,_ = require('underscore')
    ,sendMessage=require('./gcm').sendMessage;

// api : /users/:user_id/reviews/create
exports.createUserReview = function(req,res){

    var user_id  = req.session.passport.user  || res.json(trans_json("아이디를 입력하지 않았습니다.",0));

    console.log('session is ',user_id);

    var trade_id = Number(req.body.trade_id) || res.json(trans_json("아이디를 입력하지 않았습니다.",0));
    var comments = req.body.comment || res.json(trans_json("아이디를 입력하지 않았습니다.",0));
    var point   = Number(req.body.point)    || 0;

    //타입 검사
    if (typeof user_id  != "number") { res.json(trans_json('유저 아이디 타입은 숫자여야 합니다.',0));}
    if (typeof trade_id != "number") { res.json(trans_json('트레이드 아이디 타입은 숫자여야 합니다.',0));}
    if (typeof point   != "number")  { res.json(trans_json('점수 타입은 숫자여야 합니다',0));}
    if (typeof comments != "string") { res.json(trans_json('코멘트 타입은 문자열이여야 합니다',0));}

    var query =
        "INSERT INTO review(from_user_id, to_user_id, comments, point, create_date, trade_id) " +
        "SELECT (CASE WHEN user_id = ? THEN user_id ELSE req_user_id end), " +
        "(CASE WHEN req_user_id = ? THEN user_id ELSE req_user_id END), " +
        "? , ?, NOW(), trade_id " +
        "FROM trade t " +
        "JOIN post p ON t.post_id = p.post_id " +
        "WHERE t.trade_id = ? ";

    connection_closure(function (err, connection) {
        if (err) {
            res.json(trans_json(msg, 0));
        }
        else {
            async.waterfall([
                function saveMessage(callback) {
                    connection.get_query(
                        query,
                        [user_id, user_id, comments, point, trade_id],
                        function (err, rows) {
                            console.log('save message is review list row is =====> ',rows);
                            if (err) { callback(err); }
                            else { callback(null); }
                        }
                    )
                },
                function getDeviceId(callback) {
                    connection.get_query(
                        "SELECT to_user_id, gcm_registration_id, push_settings, comments, r.create_date " +
                        "FROM user u JOIN review r ON u.user_id = r.to_user_id " +
                        "JOIN trade t ON t.trade_id = r.trade_id JOIN post p ON p.post_id = t.post_id " +
                        "WHERE from_user_id = ? AND t.req_user_id = from_user_id and t.trade_id = ?",
                        [user_id,trade_id],
                        function (err, rows) {
                            console.log('review rows is !!!!!!!',rows);
                            var device_list = _.map(rows, function (item) {
                                return item.gcm_registration_id;
                            });
                            var push_settings_arr = _.map(rows, function (item) {
                                return item.push_settings
                            });
                            // code, title, msg, callback)          //리뷰 리스트 일 때는 message 는 ~ 로 하면 될 듯
                            callback(null, device_list, push_settings_arr);
                        }
                    )
                },
                function sendGCM(device_list, push_settings_arr, callback) {
                    sendMessage(device_list, push_settings_arr, 2, "wisdona", comments,
                        function (err) {
                            if (err) { callback(err); }
                            else { callback(null); }
                        }
                    );
                }
            ], function (err){
                if (err) {
                    connection.close_conn();
                    res.json(trans_json('라뷰 등록에 실패했습니다.' + err, 0));
                }
                else{
                    console.log('trade id : ',trade_id);
                    //connection.close_conn();
                    connection.query(
                        "select req_user_id, p.user_id " +
                        "from trade t " +
                        "join post p on p.post_id = t.post_id " +
                        "where trade_id = ?",
                        [trade_id],
                        function(err,rows){
                            if(err) {
                                console.log('리뷰등록 마지막 ',err);
                                connection.close_conn();
                                res.json(trans_json('리뷰 등록에 실패 했습니다. '+err.message,0));
                            }
                            else {
                                console.log(rows);
                                //var json = { message : comments, trade_id : trade_id};
                                if(rows[0].req_user_id === user_id){            //요청자일 경우
                                    if (point === 1){
                                        console.log('point ==!!1');
                                        connection.close_conn();
                                        res.json(trans_json('success', 1,
                                        { message : '기부자님을 좋아합니다.', trade_id : trade_id}));
                                    }
                                    else {
                                        console.log('point ==!!0');
                                        connection.close_conn();
                                        res.json(trans_json('success', 1,
                                        { message : '기부자님에게 서운해 합니다.', trade_id : trade_id}));
                                    }
                                } else {                                        //기부자일 경우
                                    console.log('point ==!!기부자');
                                    connection.close_conn();
                                    res.json(trans_json('success',1,{message : '담벼락에 글을 남겼습니다.'}));
                                }
                            }
                        }
                    );
                }
            });
        }
    });

/*
        template_item(
            query,
            [user_id,user_id,comments,point,trade_id],
            function(err,rows,msg){
                if(err) {res.json(trans_json(msg,0));}
                else {
                    template_item(
                        "SELECT to_user_id, gcm_registration_id FROM user u JOIN message m ON u.user_id = m.to_user_id " +
                        "JOIN trade t ON t.trade_id = m.trade_id JOIN post p ON p.post_id = t.post_id " +
                        "WHERE from_user_id = ? AND t.req_user_id = from_user_id ",
                        [user_id],
                        function(err,rows,info){
                            var device_list=_.map(rows, function(item){ return item.gcm_registration_id; });
                            var push_settings_arr = _.map(rows, function(item) {
                                return item.push_settings
                            });
                            // code, title, msg, callback)          //리뷰 리스트 일 때는 message 는 ~ 로 하면 될 듯
                            sendMessage(device_list,push_settings_arr,"wisdona",comments,2,
                                function(err){
                                    if(err) {console.log('log....');res.json(trans_json('메시지 전송에 실패했습니다.'+err,0));}
                                    else { res.json(trans_json('메시지 전송에 성공했습니다.',1)); }
                                }
                            );
                        }
                    );
                }
            }
        );
    }
*/

/*
*/
};
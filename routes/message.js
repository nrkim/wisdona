/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 불러오기
var json = require("./json");
var async = require("async");
var trans_json = json.trans_json;
var message_list = json.message_list;
var message_window = json.message_window
    ,template = require('./templete')
    ,template_get = template.template_get
    ,template_post = template.template_post
    ,template_transaction = template.template_transaction
    ,unread_msgs=json.unread_msgs
    ,unread_msg_lst= json.unread_msg_lst;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');

//async 셋팅 할 것인가 안 할 것인가??


exports.getMessageGroupList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var end = start+count;

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    // 메시지 그룹의 리스트를 가져오는 쿼리문
    // 해당 거래의 메시지를 가저옴
    var query =
        "SELECT m.from_user_id, nickname, image, m.trade_id, title, message, be_message_cnt, m.create_date " +
        "FROM (SELECT * FROM user WHERE sleep_mode = 0) JOIN message m ON m.from_user_id = u.user_id " +
            "JOIN trade t ON m.trade_id = t.trade_id " +
            "JOIN post p ON t.post_id = p.post_id " +
            "JOIN book b ON p.book_id = b.book_id " +
            "INNER JOIN ( SELECT max(create_date) AS max_date " +
            "FROM message GROUP BY from_user_id ) d " +
            "WHERE m.to_user_id = ? AND m.create_date  = d.max_date " +
            "GROUP BY t.trade_id LIMIT ?, ? ";

    //sample 예제 to_user_id =5, 1, 10
    template_get(
        res,
        query,
        [user_id,start,end],
        message_list
    );

};

exports.destroyMessageGroup = function(req,res){

    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;
    var trade_id = req.body.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0)) ;

    var query = "UPDATE trade t JOIN post p ON p.post_id = t.post_id " +
        "SET be_show_group = (CASE WHEN req_user_id = ? THEN false ELSE true END), " +
        "do_show_group = (CASE WHEN user_id = ? THEN false ELSE true END) " +
        "WHERE trade_id = ?";

    template_post(
        res,
        query,
        [user_id,user_id,trade_id]
    );
};


exports.createMessage = function(req,res){


    //var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    var user_id = JSON.parse(req.params.user_id)      || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));
    var message = req.body.message   || res.json(trans_json("메시지를 입력하지 않았습니다.",0));


    if (typeof(user_id) != "number" || typeof(trade_id) != "number" ||
        typeof(message) != "string" ) {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query =
        "INSERT INTO message(from_user_id, to_user_id, message,is_read, trade_id, is_sended) " +
        "SELECT ?, (CASE WHEN req_user_id = ? THEN p.user_id ELSE req_user_id END), ?,0, t.trade_id, 0 " +
        "FROM trade t " +
        "JOIN post p ON t.post_id = p.post_id " +
        "WHERE t.trade_id = ? ";

    template_post(
        res,
        query,
        [user_id,user_id,message,trade_id]
    );

};

exports.getMessageList = function(req,res){
    console.log("??");
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var end = start+count;
    var messages = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    //쿼리문
    var query =
        "SELECT user_id, nickname, image, message, m.create_date " +
        "FROM trade t JOIN message m ON t.trade_id = m.trade_id " +
        "JOIN user u ON m.from_user_id = u.user_id WHERE t.trade_id = ? LIMIT ?, ? ";
    //sample 예제 trade_id =3, 0, 10

    template_get(
        res,
        query,
        [trade_id,start,end],
        message_window
    );
};


exports.getUnreadMessgeList = function(req,res){


    console.log('hello hello');
    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    //var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var get_query =
        "SELECT trade_id, message, m.create_date, from_user_id, nickname, image " +
        "FROM user u JOIN message m ON u.user_id = m.from_user_id " +
        "WHERE m.to_user_id = ? AND m.is_sended = FALSE";

    var update_query =
        "UPDATE message m SET is_sended = true WHERE m.to_user_id = ? AND is_sended = FALSE";


    // 테스트 케이스 trade_id =4, user_id = 5

    connectionPool.getConnection(function(err,connection) {
        template_transaction(
            req,
            res,
            get_query,
            update_query,
            [user_id],
            [user_id],
            connection,
            [
                function (callback) {
                    connection.query(get_query, [user_id], function (err, rows, info) {
                        if (err) {
                            console.log("err : ", err);
                            callback(err);
                        }
                        if (rows.length == 0) {
                            console.log('length : ', rows.length);
                            return res.json(trans_json("읽지 않은 메시지가 없습니다", 1));
                        } else {
                            console.log("callback!!!");
                            callback(null, user_id);
                        }
                    });
                },
                function (user_id, callback) {
                    connection.query(update_query, [user_id], function (err, rows, info) {
                        if (err) {
                            console.log(err);
                            callback(err);
                        }
                        console.log('err no !!');
                        callback(null);
                    });

                }]
        );
    });
};

exports.confirmMessage = function(req,res){

    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var query = "UPDATE message m " +
        "SET m.is_read = true " +
        "WHERE m.trade_id = ? AND to_user_id = ? ";


    template_post(
        res,
        query,
        [trade_id,user_id]
    );
};
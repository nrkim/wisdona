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
    var messages = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    //쿼리문
    var query =
        "SELECT m.from_user_id, nickname, image, m.trade_id, title, message, be_message_cnt, m.create_date " +
        "FROM user u JOIN message m ON m.from_user_id = u.user_id " +
            "JOIN ( select * " +
            "FROM trade " +
            "WHERE current_status = 0 " +
            ") t ON m.trade_id = t.trade_id " +
            "JOIN post p ON t.post_id = p.post_id " +
            "JOIN book b ON p.book_id = b.book_id " +
            "INNER JOIN ( SELECT max(create_date) AS max_date " +
            "FROM message GROUP BY from_user_id ) d " +
            "WHERE m.to_user_id = ? AND m.create_date  = d.max_date " +
            "GROUP BY t.trade_id LIMIT ?, ? ";

    //sample 예제 to_user_id =5, 1, 10

    template_get(
        req,res,
        query,
        [user_id,start,end],
        message_list
    );

};

exports.destroyMessageGroup = function(req,res){

    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;
    var trade_id = req.body.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0)) ;

    var query = "update trade t join post p on p.post_id = t.post_id " +
        "set be_show_group = (case when req_user_id = ? then false else true end), " +
        "do_show_group = (case when user_id = ? then false else true end) " +
        "where trade_id =?";

    template_post(
        req,res,
        query,
        [user_id,user_id,trade_id]
    );
};


exports.createMessage = function(req,res){


    //var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    var user_id = JSON.parse(req.params.user_id)      || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));
    var message = JSON.parse(req.body.message)   || res.json(trans_json("메시지를 입력하지 않았습니다.",0));

    console.log('user_id :',user_id);
    console.log('trade id :',trade_id);
    console.log('ddds : ',message);

    if (typeof(user_id) != "number" || typeof(trade_id) != "number" ||
        typeof(message) != "string" ) {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query =
        "insert into message(from_user_id, to_user_id, message,is_read, trade_id, is_sended) " +
        "select ?, (case when req_user_id = ? then p.user_id else req_user_id end), ?,0, t.trade_id, 0 " +
        "from trade t " +
        "join post p on t.post_id = p.post_id " +
        "where t.trade_id = ? ";

    // 생성 시간 저장해 주기

    template_post(
        req,res,
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
      req,res,
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
        "UPDATE message SET is_sended = true WHERE m.to_user_id = ? AND is_sended = FALSE";

    console.log('success???!!!');


    //template_get(req,res,get_query,[user_id],unread_msg_lst);


    // 테스트 케이스 trade_id =4, user_id = 5
    async.series([
        template_get(req,res,get_query,[user_id],unread_msg_lst),
        template_post(req,res,update_query,[user_id])
    ],function(err,results){
        if (err){
            return console.log(err);
            //rollback;
        }
    });     // transaction 처리

};

exports.confirmMessage = function(req,res){

    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var query = "UPDATE message m " +
        "SET m.is_read = true " +
        "WHERE m.trade_id = ? AND to_user_id = ? ";

    template_post(
        req,res,
        query,
        [trade_id,user_id]
    );
};
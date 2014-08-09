/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 불러오기
var json = require("./json");
var trans_json = json.trans_json;
var message_list = json.message_list;
var message_window = json.message_window
    ,template = require('./templete')
    ,template_get_list = template.template_get_list
    ,template_get_element = template.template_get_element
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

    template_get_list(
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
    var user_id = req.body.user_id      || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = req.body.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));
    var message = req.body.message   || res.json(trans_json("메시지를 입력하지 않았습니다.",0));

    if (typeof(user_id) != "number" || typeof(trade_id) != "number" ||
        typeof(message) != "string" ) {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query = 'INSERT INTO message(email,password,nickname,bookmark_total_cnt,' +
        'like_total_cnt,sad_total_cnt,sleep_mode) '+
        'VALUES(?,?,?,0,0,0,0)';

    // 생성 시간 저장해 주기

    template_post(
        req,res,
        query,
        [email,password,nickname]
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

    template_get_list(
      req,res,
        query,
        [trade_id,start,end],
        message_window
    );
};


exports.getUnreadMessgeList = function(req,res){
    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var query = "select u.user_id, nickname, image, message, m.create_date " +
        "from user u join message m on u.user_id= m.to_user_id " +
        "where trade_id = ? and u.user_id =? order by create_date desc ";

    // 테스트 케이스 trade_id =4, user_id = 5

        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
            }

            var list=[];

            connection.query(query,[trade_id,user_id], function(err, rows, fields) {
                if(err){
                    connection.release();
                    res.json(trans_json(err.code+" 중복된 데이터를 금지합니다.", 0));        //에러 코드 처리
                }

                for(var i =0; i<rows.length; i++) {
                    list.push(unread_msg_lst(rows,i));
                }

                connection.release();
                res.json(trans_json("success",1,unread_msgs(rows,0,list)));
            });
        });
};

exports.confirmMessage = function(req,res){
    var user_id = JSON.parse(req.params.user_id)   || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var query = "update message m " +
        "set m.is_read = true " +
        "where m.trade_id = ? and to_user_id = ? ";

    template_post(
        req,res,
        query,
        [trade_id,user_id]
    );
};
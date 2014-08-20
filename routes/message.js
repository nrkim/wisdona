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
    ,unread_msg_lst= json.unread_msg_lst;


// api : /users/:user_id/message-groups/list
exports.getMessageGroupList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = req.session.passport.user;
    //var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof user_id != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    //다시 한번 보기
    // 메시지 그룹의 리스트를 가져오는 쿼리문
    // 해당 거래의 메시지를 가저옴
    // do_show = 0인 메시지를 삭제한 모습을 구현 해야함

    var query =
        "SELECT m.from_user_id, nickname, image, m.trade_id, title, message, be_message_cnt, m.create_date " +
        "FROM (SELECT * FROM user WHERE sleep_mode = 0) u JOIN message m ON m.from_user_id = u.user_id " +
            "JOIN trade t ON m.trade_id = t.trade_id " +
            "JOIN post p ON t.post_id = p.post_id " +
            "JOIN book b ON p.book_id = b.book_id " +
            "INNER JOIN ( SELECT max(create_date) AS max_date " +
            "FROM message GROUP BY from_user_id ) d " +
            "WHERE m.to_user_id = ? AND m.create_date  = d.max_date " +
            "GROUP BY t.trade_id LIMIT ?, ? ";

    //sample 예제 to_user_id =5, 1, 10
    template_list(
        query,
        [user_id,start,count],
        message_list,
        function(err,result,msg){
            if(err) {res.json(trans_json(msg,0));}
            if(result) {res.json(trans_json(msg,1,result));}
            else { res.json(trans_json(msg,1));}
        }
    );

};

exports.destroyMessageGroup = function(req,res){

    var user_id = req.session.passport.user;
    //var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;
    var trade_id = req.body.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0)) ;

    console.log('trade id is ',trade_id);
    console.log('user_id is ',user_id);

    var query = "UPDATE trade t JOIN post p ON p.post_id = t.post_id " +
        "SET be_show_group = (CASE WHEN req_user_id = ? THEN false ELSE true END), " +
        "do_show_group = (CASE WHEN user_id = ? THEN false ELSE true END) " +
        "WHERE trade_id = ?";

    template_item(
        query,
        [user_id,user_id,trade_id],
        function(err,rows,msg){
            if(err) {res.json(trans_json(msg,0));}
            else {res.json(trans_json(msg,1));}
        }
    );
};

// api : /users/:user_id/message-groups/:trade_id/create
exports.createMsg = function(req,res){

    var user_id = req.session.passport.user  || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));
    var message = req.body.message   || res.json(trans_json("메시지를 입력하지 않았습니다.",0));

    //타입 검사
    if (typeof user_id  != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof message  != "string") res.json('메시지 타입은 문자열여야 합니다.',0);
    if (typeof trade_id != "number") res.json('트레이드 아이디 타입은 숫자여야 합니다',0);

    var query =
        "INSERT INTO message(from_user_id, to_user_id, message,is_read, trade_id, is_sended) " +
        "SELECT ?, (CASE WHEN req_user_id = ? THEN p.user_id ELSE req_user_id END), ?,0, t.trade_id, 0 " +
        "FROM trade t " +
        "JOIN post p ON t.post_id = p.post_id " +
        "WHERE t.trade_id = ? ";

    // 클로저로 바꿀 예정
    template_item(
        query,
        [user_id,user_id,message,trade_id],
        function(err,rows,msg){
            if(err) {res.json(trans_json(msg,0));}
            else {
                template_item(
                    "SELECT * FROM message m JOIN "
                );

                sendMessage([user_id],title,message,function(){

                });
                res.json(trans_json(msg,1));
            }
        }
    );
}

exports.createMessage = function(req,connection,next){

    // 파라미터
    var user_id = req.session.passport.user;
    var trade_id = JSON.parse(req.params.trade_id) || next(new Error("거래 아이디를 입력하지 않았습니다."));
    var message = req.body.message   || next(new Error("메시지를 입력하지 않았습니다."));

    //타입 검사
    if (typeof user_id  != "number") { next(new Error('유저 아이디 타입은 숫자여야 합니다.'));}
    else if (typeof message  != "string") { next(new Error('메시지 타입은 문자열여야 합니다.'));}
    else if (typeof trade_id != "number") { next(new Error('트레이드 아이디 타입은 숫자여야 합니다'));}
    else{
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
    }
};

exports.getMessageList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = req.session.passport.user  || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var trade_id = JSON.parse(req.params.trade_id) || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

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
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

//api : /users/:user_id/message-groups/:trade_id/unread/list
exports.getUnreadMessgeList = function(req,res){


    var user_id = req.session.passport.user;
    var trade_id = req.params.trade_id || res.json(trans_json("거래 아이디를 입력하지 않았습니다.",0));

    var get_query =
        "SELECT trade_id, message, m.create_date, from_user_id, nickname, image " +
        "FROM user u JOIN message m ON u.user_id = m.from_user_id " +
        "WHERE to_user_id = ? AND m.is_sended = FALSE ";

    var update_query =
        "UPDATE message SET is_sended = TRUE WHERE to_user_id = ? AND is_sended = FALSE";


    template_list(
        get_query,
        { to_user_id  : user_id},
        unread_msg_lst,
        function(err,result,msg){
            if (err) { res.json(trans_json("읽지 않은 메시지를 찾는 과정에서 에러가 일어났습니다.",0)); }
            else {
                if (result.length == 0){
                    res.json(trans_json("success",1,result));
                } else{
                    template_item(
                        update_query,
                        [user_id],
                        function(err,rows,msg){
                            if(err) { res.json(trans_json(msg,0));}
                            else { res.json(trans_json('success',1,result));}
                        }
                    )
                }
            }
        }
    );
};

exports.confirmMessage = function(req,res){

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
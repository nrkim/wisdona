/**
 * Created by nrkim on 2014. 7. 29..
 */
var json = require("./json");
var url = require('url');
var trans_json = json.trans_json;
var message_list = json.message_list;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host :'wisdona.cz09lkhuij69.ap-northeast-1.rds.amazonaws.com',
    port : 3306,
    user : 'admin',
    password : 'zktldhvpdk',
    database : 'wisdonadb'
});

exports.getMessageGroupList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = (page-1)*count;
    var end = start+count;
    var messages = [];

    console.log('start ',start);
    console.log('end',end);

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    //쿼리문
    var query =
        "SELECT m.from_user_id, nickname, image, m.trade_id, title, message, be_message_cnt, t.last_update " +
        "FROM user u " +
            "JOIN message m ON m.from_user_id = u.user_id " +
            "JOIN trade t ON m.trade_id = t.trade_id " +
            "JOIN post p ON t.post_id = p.post_id " +
            "JOIN book b ON p.book_id = b.book_id " +
            "INNER JOIN ( SELECT max(create_date) AS max_date " +
            "FROM message GROUP BY from_user_id ) d " +
            "WHERE m.to_user_id = ? AND m.create_date  = d.max_date LIMIT ?, ? ";

    try {
        connection.query(query, [user_id,start,end], function (err,rows,info) {
            if (err) {
                console.log(rows);
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }
            console.log(rows);

            for(var i =0; i<rows.length; i++) {
                messages.push(message_list(rows, i));
            }

            res.json(trans_json('success',1,messages));
        });
    } catch(err) {
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.destroyMessageGroup = function(req,res){
    var data= {
        "result": "success",
        "result_msg": "success"
    };

    res.json(data);
};


exports.createMessage = function(req,res){
    var data= {
            "code": 1,
            "message": "success",
            "result" : null
        };

    res.json(data);
};

exports.getMessageList = function(req,res){
    var data ={
        "success": 1,
        "message": "success",
        "result": [
            {
                "user": {
                    "user_id": 123,
                    "nick_name": "수지",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "message": "대화내용1",
                "create_date": "2014-07-27 14:25:00"
            },
            {
                "user": {
                    "user_id": 456,
                    "nick_name": "수현",
                    "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                },
                "message": "대화내용2",
                "create_date": "2014-07-27 14:30:15"
            },
            {
                "user": {
                    "user_id": 222,
                    "nick_name": "돈데크만",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "message": "대화내용1",
                "create_date": "2014-07-27 14:25:00"
            },
            {
                "user": {
                    "user_id": 333,
                    "nick_name": "퐁퐁이",
                    "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                },
                "message": "대화내용2",
                "create_date": "2014-07-27 14:30:15"
            },
            {
                "user": {
                    "user_id": 133,
                    "nick_name": "홍두깨부인",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "message": "대화내용1",
                "create_date": "2014-07-27 14:25:00"
            },
            {
                "user": {
                    "user_id": 22,
                    "nick_name": "티거",
                    "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                },
                "message": "대화내용2",
                "create_date": "2014-07-27 14:30:15"
            },
            {
                "user": {
                    "user_id": 101,
                    "nick_name": "혜림",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "message": "대화내용1",
                "create_date": "2014-07-27 14:25:00"
            },
            {
                "user": {
                    "user_id": 222,
                    "nick_name": "장동건",
                    "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                },
                "message": "대화내용2",
                "create_date": "2014-07-27 14:30:15"
            },
            {
                "user": {
                    "user_id": 120,
                    "nick_name": "솔플",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "message": "대화내용1",
                "create_date": "2014-07-27 14:25:00"
            },
            {
                "user": {
                    "user_id": 129,
                    "nick_name": "포로리",
                    "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                },
                "message": "대화내용2",
                "create_date": "2014-07-27 14:30:15"
            }
        ]
    };

    res.json(data);
};

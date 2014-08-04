/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 생성관련 함수 불러오기
var json = require('./json');
var trans_json = json.trans_json;
var user_info = json.user_info;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');

exports.getUserInfo = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));
    console.log('user_id: '+user_id);

    var query =
    "SELECT u.user_id, nickname, image, self_intro, bookmark_total_cnt, SUM(be_message_cnt) unread_msg_cnt, " +
    "like_total_cnt, sad_total_cnt FROM user u JOIN message m ON u.user_id = m.to_user_id " +
    "JOIN trade t ON t.trade_id = m.trade_id WHERE u.user_id = ? GROUP BY u.user_id";

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[user_id],function(err,rows,info){
            if (err){
                connection.end();
                res.json(trans_json("sql 에러가 일어났습니다.",0));
            }

            connection.end();
            res.json(trans_json("success",1,user_info(rows)));
        });
    }
    catch(err){
        console.log(err);
        connection.end();
        res.json(trans_json("데이터 연결 오류입니다",0));
    }
};

exports.createUser = function(req,res){
    //curl로 테스트 해볼것
    var email = req.body.email       || res.json(trans_json("email을 입력하지 않았습니다",0));
    var password = req.body.password || res.json(trans_json("password를 입력하지 않았습니다",0));
    var nickname = req.body.nickname || res.json(trans_json("닉네임을 입력하지 않았습니다",0));

    if (typeof(email) != "string" || typeof(password) != "string" ||
        typeof(nickname) != "string" ) {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,like_total_cnt,sad_total_cnt,sleep_mode)'+
        'VALUES(?,?,?,0,0,0,0)';

    // 생성 시간 저장해 주기
    try{
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[email,password,nickname],function(err,info){
            if(err){
                console.log(typeof (err));
                console.log(err);//error

                //error code 분석
                /*switch(err.code){
                    case 'PROTOCOL_CONNECTION_LOST' :
                        res.json(trans_json('접속 오류입니다.',0));
                    case 'ER_DUP_ENTRY' :
                        //common id도 실행
                        res.json(trans_json('nickname은 유일해야 합니다.',0));'
                }*/
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.',0));
            }
        });

        connection.end();
        res.json(trans_json("success",1));
    }
    catch(err) {
        console.log(err);
        connection.end();
        res.json(trans_json("데이터 연결 오류입니다",0));
    }
};

exports.destroyUserAccount = function(req,res){
    //계정 삭제시 휴면 계정
    var user_id = req.body.user_id || res.json(trans_json("아이디가 없습니다",0));
    console.log('user_id : ',user_id);

    var query = 'UPDATE user SET sleep_mode = 1 WHERE user_id = ?';

    try{
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[user_id],function(err,info){
            if(err){
                console.log('info\n',info);
                connection.end();
                res.json(trans_json('이미 삭제되었거나 존재하지 않는 아이디 입니다.',0));
            }
        });
    }
    catch(err) {
        console.log(err);
        connection.end();
        res.json(trans_json("데이터 연결 오류입니다",0));
    }

    connection.end();
    res.json(trans_json("success",1));
};

//페이스북 계정 정보
exports.getAccountSettings = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));
    console.log('user_id: '+user_id);

    var query =
        "SELECT u.user_id, nickname, image, self_intro, bookmark_total_cnt, SUM(be_message_cnt) unread_msg_cnt, " +
        "like_total_cnt, sad_total_cnt FROM user u JOIN message m ON u.user_id = m.to_user_id " +
        "JOIN trade t ON t.trade_id = m.trade_id WHERE u.user_id = ? GROUP BY u.user_id";

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[user_id],function(err,rows,info){
            if (err){
                connection.end();
                res.json(trans_json("sql 에러가 일어났습니다.",0));
            }
            connection.end();
            res.json(trans_json("success",1,user_info(rows)));
        });
    }
    catch(err){
        console.log(err);
        connection.end();
        res.json(trans_json("데이터 연결 오류입니다",0));
    }
};

exports.updateAccountSettings = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};

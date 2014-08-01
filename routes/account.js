/**
 * Created by nrkim on 2014. 7. 29..
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
    host :'wisdona.cz09lkhuij69.ap-northeast-1.rds.amazonaws.com',
    port : 3306,
    user : 'admin',
    password : 'zktldhvpdk',
    database : 'wisdonadb'
});

/*

function Result(message,code,result){
    console.log(code);
    this.code = code || 1
    this.message = message || "메시지"
    this.result = result || null
}
*/

function trans_json(message,code,result){

    return { code : code || 0, message : message || '메세지', result : result || null}
};

function user_info(rows){
    return {
        nick_name : rows[0].nickname,
        profile_image_url : rows[0].image,
        self_intro : rows[0].self_intro,
        bookmark_cnt : rows[0].bookmark_total_cnt,
        unread_msg_cnt : rows[0].unread_msg_cnt,
        like_cnt : rows[0].like_total_cnt,
        sad_cnt : rows[0].sad_total_cnt
    }
};

exports.getUserInfo = function(req,res){
    var user_id = req.params.user_id //res.json(trans_json("존재하지 않는 사용자 입니다.",0));
    console.log('user_id: '+user_id);

    var query =
    "SELECT u.user_id, nickname, image, self_intro, bookmark_total_cnt, SUM(be_message_cnt) unread_msg_cnt, like_total_cnt, sad_total_cnt FROM user u JOIN message m ON u.user_id = m.to_user_id JOIN trade t ON t.trade_id = m.trade_id WHERE u.user_id = ? GROUP BY u.user_id";

    try {
        connection.query(query,[user_id],function(err,rows,info){
            if (err){
                res.json(trans_json("sql 에러가 일어났습니다.",0));
            }

            res.json(trans_json("success",1,user_info(rows)));
        });
    }
    catch(err){
        console.log(err);
        res.json(trans_json("데이터 연결 오류입니다",0));
    }


};

exports.createUser = function(req,res){

    var email = req.body.email       || res.json(trans_json("email을 입력하지 않았습니다",0));
    var password = req.body.password || res.json(trans_json("password를 입력하지 않았습니다",0));
    var nickname = req.body.nickname || res.json(trans_json("닉네임을 입력하지 않았습니다",0));

    if (typeof(email) != "string" || typeof(password) != "string" ||
        typeof(nickname) != "string" ) {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,like_total_cnt,sad_total_cnt,sleep_mode)'+
        'VALUES(?,?,?,0,0,0,0)';

    try{
        connection.query(query,[email,password,nickname],function(err,info){
            if(err){
                console.log(err);
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.',0));
                //console.log('아이디 또는 비밀번호 중복');
                //ER_DUP_ENTRY(error!!);
            }
        });
        console.log('success??');
        res.json(trans_json("success"));
    }
    catch(err) {
        console.log(err);
        res.json(trans_json("데이터 연결 오류입니다",0));
    }
};

exports.destroyUserAccount = function(req,res){
    //계정 삭제시 휴면 계정
    var user_id = req.body.user_id || res.json(trans_json("아이디가 없습니다",0));
    console.log('user_id : ',user_id);

    var query = 'UPDATE user SET sleep_mode = 1 WHERE user_id = ?';

    try{
        connection.query(query,[user_id],function(err,info){
            if(err){
                console.log('info\n',info);
                res.json(trans_json('이미 삭제되었거나 존재하지 않는 아이디 입니다.',0));
            }
        });
    }
    catch(err) {
        console.log(err);
        res.json(trans_json("데이터 연결 오류입니다",0));
    }

    res.json(trans_json("success",1));
};

exports.getAccountSettings = function(req,res){

};

exports.updateAccountSettings = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};
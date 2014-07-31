/**
 * Created by nrkim on 2014. 7. 29..
 */


exports.getUserInfo = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result": {
            "nick_name": "수지",
            "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg",
            "self_intro": "자기소개",
            "bookmark_cnt": "2",
            "unread_msg_cnt": 3,
            "like_cnt": 8,
            "sad_cnt": 2
        }
    };

    res.json(data);
};


function trans_json(message,code,result){
    return { code : code || 1, message : message || '메세지', result : result || null}
}

exports.createUser = function(req,res){

    var email = req.body.email       || res.json(trans_json("email을 입력하지 않았습니다",0));
    var password = req.body.password || res.json(trans_json("password를 입력하지 않았습니다",0));
    var nickname = req.body.nickname || res.json(trans_json("닉네임을 입력하지 않았습니다",0));
    var phone = req.body.phone       || res.json(trans_json("폰번호를 입력하지 않았습니다",0));



    if (typeof(email) != "string" || typeof(password) != "string" ||
        typeof(nickname) != "string" || typeof(phone) != "string") {
        res.json(trans_json("올바른 타입을 사용해 주세요.",0));
    }

    var query = 'INSERT INTO user(email,password,nickname,bookmark_total_cnt,phone,like_total_cnt,sad_total_cnt)'+
        'VALUES(?,?,?,0,?,0,0)';

    try{
        connection.query(query,[email,password,nickname,phone],function(err,info){
            if(err){
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.',0));
            }
            console.log('info\n',info);
        });

    }
    catch(err) {
        res.json(trans_json("양식에 맞지 않는 데이터 오류입니다",0));
    }

    res.json(trans_json("success"));

};

exports.destroyUserAccount = function(req,res){
    data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};

exports.getAccountSettings = function(req,res){
    var data = {
        "profile": {
            "nick_name": "수지",
            "profile_image_url": "http://wisdona.com/images/user/profile/dkfj223fj.jpg",
            "self_intro": "소설을 좋아해요",
            "bookmark_cnt": 2,
            "unread_msg_cnt": 3,
            "like_cnt": 8,
            "sad_cnt": 2
        }
    };

    res.json(data);
};

exports.updateAccountSettings = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};
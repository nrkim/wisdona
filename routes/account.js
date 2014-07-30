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
    }

    res.json(data);
};

exports.createUser = function(req,res){
    data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};

exports.destroyUserAccount = function(req,res){
    data = {
        "code": 1,
        "message": "success",
        "result" : null
    }

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
    }

    res.json(data);
};
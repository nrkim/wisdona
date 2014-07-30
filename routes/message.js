/**
 * Created by nrkim on 2014. 7. 29..
 */
exports.getMessageGroupList = function(req,res){
    var data = {
        "success": 1,
        "message": "success",
        "result": [
            {
                "user": {
                    "user_id": 123,
                    "nick_name": "수지",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "trade_id": 5,
                "book_name": "아프니까 청춘이다",
                "last_message": "배송 요청 드린 메시지대로 배송 부탁 드립니다 :)",
                "unread_messages_cnt": 2,
                "last_update": "2014-07-27 22:32:52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "해리포터와 마법사의 돌",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "해리포터와 불사조 기사단",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "",
                "last_message": "잘 받았어요",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "퐁퐁이",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "자기 앞의 생",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "홍두깨부인",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "자바스크립트 전문가가 되는길",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "불멸의 이순신",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "뿌리깊은 나무",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "이순신",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "객체지향 프로그래밍 전문가 과정",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            },
            {
                "user": {
                    "user_id": 789,
                    "nick_name": "지민",
                    "profile_image_url": "http://wisdona.com/images/user/profile/789.jpg"
                },
                "trade_id": 6,
                "book_name": "뿌리갚은 나무",
                "last_message": "책잘받았습니다^^",
                "unread_messages_cnt": 1,
                "last_update": "2014-07-2722: 32: 52"
            }
        ]
    };
    res.json(data);
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

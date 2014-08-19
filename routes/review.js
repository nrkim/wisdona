/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');
var trans_json = json.trans_json
    ,template = require('./template')
    ,template_item = template.template_item;

// api : /users/:user_id/reviews/create
exports.createUserReview = function(req,res){


    var user_id  = req.session.passport.user  || res.json(trans_json("아이디를 입력하지 않았습니다.",0));

    var trade_id = req.body.trade_id || res.json(trans_json("아이디를 입력하지 않았습니다.",0));
    var comments = req.body.comments || res.json(trans_json("아이디를 입력하지 않았습니다.",0));
    var point   = req.body.point     || 0;

    //타입 검사
    if (typeof user_id  != "number") res.json(trans_json('유저 아이디 타입은 숫자여야 합니다.',0));
    else if (typeof trade_id != "number") res.json(trans_json('트레이드 아이디 타입은 숫자여야 합니다.',0));
    else if (typeof point   != "number") res.json(trans_json('점수 타입은 숫자여야 합니다',0));
    else if (typeof comments != "string") res.json(trans_json('코멘트 타입은 문자열이여야 합니다',0));

    else {
        var query = "INSERT INTO review(from_user_id, to_user_id, comments, point, create_date, trade_id) " +
            "SELECT (CASE WHEN user_id = ? THEN user_id ELSE req_user_id end), " +
            "(CASE WHEN req_user_id = ? THEN user_id ELSE req_user_id END), " +
            "? , ?, NOW(), trade_id " +
            "FROM trade t " +
            "JOIN post p ON t.post_id = p.post_id " +
            "WHERE t.trade_id = ? ";

        console.log('console.log!!!');
        template_item(
            query,
            [user_id,user_id,comments,point,trade_id],
            function(err,rows,msg){
                console.log('console.log!!!');
                if(err) {res.json(trans_json(msg,0));}
                else {res.json(trans_json(msg,1));}
            }
        );
    }
};
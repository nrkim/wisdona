/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');
var trans_json = json.trans_json
    ,template = require('./template')
    ,template_item = template.template_item;
var formidable = require('formidable');

exports.createUserReview = function(req,res){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        req.body = fields;
        var user_id  = req.session.passport.user_id  || trans_json("아이디를 입력하지 않았습니다.",0);

        var trade_id = req.body.trade_id || trans_json("아이디를 입력하지 않았습니다.",0);
        var comments = req.body.comment  || trans_json("아이디를 입력하지 않았습니다.",0);
        var points   = req.body.point;

        //타입 검사
        if (typeof user_id  != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
        if (typeof trade_id != "number") res.json('트레이드 아이디 타입은 숫자여야 합니다.',0);
        if (typeof points   != "number") res.json('점수 타입은 숫자여야 합니다',0);
        if (typeof comments != "string") res.json('코멘트 타입은 숫자여야 합니다',0);


        var query = "INSERT INTO review(from_user_id, to_user_id, comments, points, create_date, trade_id) " +
            "SELECT (CASE WHEN user_id = ? THEN user_id ELSE req_user_id end), " +
            "(CASE WHEN req_user_id = ? THEN user_id ELSE req_user_id END), " +
            "? , ?, NOW(), trade_id " +
            "FROM trade t " +
            "JOIN post p ON t.post_id = p.post_id " +
            "WHERE t.trade_id = ? ";

        template_item(
            query,
            [user_id,user_id,comments,points,trade_id],
            function(err,rows,msg){
                if(err) res.json(trans_json(msg,0));
                else res.json(trans_json(msg,1));
            }
        );

    });
};
/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');
var trans_json = json.trans_json;
var user_info = json.user_info;
var user_detail = json.user_detail;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');

exports.createUserReview = function(req,res){

    var user_id  = JSON.parse(req.params.user_id)  || trans_json("아이디를 입력하지 않았습니다.",0);

    var trade_id = req.body.trade_id || trans_json("아이디를 입력하지 않았습니다.",0);
    var comments = req.body.comment  || trans_json("아이디를 입력하지 않았습니다.",0);
    var points   = req.body.point;

    var query = "insert into review(from_user_id, to_user_id, comments, points, create_date, trade_id) " +
        "select (case when user_id = ? then user_id else req_user_id end), " +
        "(case when req_user_id = ? then user_id else req_user_id end), " +
        "? , ?, now(), trade_id " +
        "from trade t " +
        "join post p on t.post_id = p.post_id " +
        "where t.trade_id = ? ";

    try{
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[user_id,user_id,comments,points,trade_id],function(err,info){
            if(err){
                console.log(typeof (err));
                console.log(err);//error

                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.',0));
            }

            connection.end();
            res.json(trans_json("success",1));
        });
    }
    catch(err) {
        console.log(err);
        connection.end();
        res.json(trans_json("데이터 연결 오류입니다",0));
    }

};
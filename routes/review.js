/**
 * Created by nrkim on 2014. 7. 29..
 */

var json = require('./json');
var trans_json = json.trans_json;
var user_info = json.user_info;
var user_detail = json.user_detail
    ,template = require('./templete')
    ,template_get_list = template.template_get_list
    ,template_get_element = template.template_get_element
    ,template_post = template.template_post;

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

    template_post(
        req,res,
        query,
        [user_id,user_id,comments,points,trade_id]
    );

};
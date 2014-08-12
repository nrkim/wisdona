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
var formidable = require('formidable');

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');

exports.createUserReview = function(req,res){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        req.body = fields;
        var user_id  = JSON.parse(req.params.user_id)  || trans_json("아이디를 입력하지 않았습니다.",0);

        var trade_id = req.body.trade_id || trans_json("아이디를 입력하지 않았습니다.",0);
        var comments = req.body.comment  || trans_json("아이디를 입력하지 않았습니다.",0);
        var points   = req.body.point;

        var query = "INSERT INTO review(from_user_id, to_user_id, comments, points, create_date, trade_id) " +
            "SELECT (CASE WHEN user_id = ? THEN user_id ELSE req_user_id end), " +
            "(CASE WHEN req_user_id = ? THEN user_id ELSE req_user_id END), " +
            "? , ?, NOW(), trade_id " +
            "FROM trade t " +
            "JOIN post p ON t.post_id = p.post_id " +
            "WHERE t.trade_id = ? ";


        template_post(
            res,
            query,
            [user_id,user_id,comments,points,trade_id]
        );
    });
};
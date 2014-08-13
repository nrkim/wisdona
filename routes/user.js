/* GET users listing. */

//json 객체 생성관련 함수 불러오기
var json = require("./json");
var trans_json = json.trans_json;
var review = json.review;
var post_list = json.post_list
    ,template = require('./templete')
    ,template_get = template.template_get
    ,template_post = template.template_post;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');


exports.getUserPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var end = start+count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    var query =
        "SELECT post_id, book_image_path, title, author, translator, publisher, pub_date, " +
        "bookmark_cnt FROM post p JOIN book b ON p.book_id = b.book_id " +
        "WHERE p.user_id = ? LIMIT ?, ?"

    template_get({
        req : req,
        res : res,
        query : query,
        params : [user_id,start,end],
        get_json : post_list
    });

};

exports.getReviewList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var end = start+count;
    var reviews = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    // 쿼리
    var query =
        "SELECT u.user_id, nickname, image, title, comments, book_image_path, p.post_id " +
        "FROM user u " +
        "JOIN post p ON u.user_id = p.user_id " +
        "JOIN book b ON p.book_id = b.book_id " +
        "JOIN trade t ON p.post_id = t.post_id " +
        "JOIN review r ON r.trade_id = t.trade_id " +
        "WHERE u.user_id = ? LIMIT ?, ? ";

    template_get({
        req : req,
        res : res,
        query : query,
        params : [user_id,start,end],
        get_json : review
    });
};

exports.getRequestPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var end = start+count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    var query =
        "SELECT t.post_id, book_image_path, title, author, translator, publisher, " +
        "pub_date, bookmark_cnt, condition_name FROM trade t JOIN post p ON t.post_id = p.post_id " +
        "JOIN book b ON p.book_id = b.book_id JOIN book_condition bc ON p.book_condition_id = bc.book_condition_id " +
        "WHERE t.req_user_id = ? LIMIT ?, ?";

    template_get(
        res,
        query,
        [user_id,start,end],
        post_list
    );
};

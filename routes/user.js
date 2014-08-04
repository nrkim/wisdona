/* GET users listing. */

var json = require("./json");
var url = require('url');
var trans_json = json.trans_json;
var review = json.review;
var post_list = json.post_list;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host :'wisdona.cz09lkhuij69.ap-northeast-1.rds.amazonaws.com',
    port : 3306,
    user : 'admin',
    password : 'zktldhvpdk',
    database : 'wisdonadb'
});

exports.getUserPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var query_str = (url.parse(req.url, true)).query;
    var page = JSON.parse(query_str.page) || 0;
    var count = JSON.parse(query_str.count) || 10;

    // 페이징 관련 계산
    var start = (page-1)*count;
    var end = start+count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    var query = "select post_id, book_image_path, title, author, translator, publisher, pub_date, " +
        "bookmark_cnt, condition_name from post p join book b on p.book_id = b.book_id " +
        "join book_condition bc on p.book_condition_id = bc.book_condition_id where p.user_id = 5 limit 0, 10";

    try {
        connection.query(query, [user_id,start,end], function (err,rows,info) {
            if (err) {
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                posts.push(post_list(rows, i));
            }

            res.json(trans_json('success',1,posts));
        });
    } catch(err) {
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }

};

exports.getReviewList = function(req,res){

    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var query_str = (url.parse(req.url, true)).query;
    var page = JSON.parse(query_str.page) || 0;
    var count = JSON.parse(query_str.count) || 10;

    // 페이징 관련 계산
    var start = (page-1)*count;
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
        "WHERE u.user_id = ? limit ?, ? ";

    try {
        connection.query(query, [user_id,start,end], function (err,rows,info) {
            if (err)        //에러 코드 분석 구문
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));

            for(var i =0; i<rows.length; i++)
                reviews.push(review(rows,i));

            res.json(trans_json('success',1,reviews));
        });
    } catch(err) {
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }

};
exports.getRequestPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var query_str = (url.parse(req.url, true)).query;
    var page = JSON.parse(query_str.page) || 0;
    var count = JSON.parse(query_str.count) || 10;

    // 페이징 관련 계산
    var start = (page-1)*count;
    var end = start+count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    var query = "select t.post_id, book_image_path, title, author, translator, publisher, " +
        "pub_date, bookmark_cnt, condition_name from trade t join post p on t.post_id = p.post_id " +
        "join book b on p.book_id = b.book_id join book_condition bc on p.book_condition_id = bc.book_condition_id " +
        "where t.req_user_id = 16 limit 0, 10;";

    try {
        connection.query(query, [user_id,start,end], function (err,rows,info) {
            if (err) {
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                posts.push(post_list(rows, i));
            }

            res.json(trans_json('success',1,posts));
        });
    } catch(err) {
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }

};


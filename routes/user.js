/* GET users listing. */

//json 객체 생성관련 함수 불러오기
var json = require("./json")
    ,trans_json = json.trans_json
    ,review = json.review
    ,post_list = json.post_list
    ,template_list = require('./template').template_list
    ,trans_list = json.trans_list;


exports.getUserPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    console.log(user_id);
    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number" || typeof page != "number" || typeof count != "number"){
        res.json(trans_json("타입을 확인해 주세요",0));
    }

    console.log('trans_list!!');

    var query =
        "SELECT post_id, book_image_path, title, author, translator, publisher, pub_date, " +
        "bookmark_cnt FROM post p JOIN book b ON p.book_id = b.book_id " +
        "WHERE p.user_id = ? LIMIT ?, ?";

    template_list(
        query,
        [user_id,start,count],
        post_list,
        function(err,result,msg){
            console.log()
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_list('success',1,result));
            else res.json(trans_json(msg,1));
        }
    );

};

exports.getReviewList = function(req,res){

    //세션으로 얻은 사용자 아이디
    var user_id = req.session.passport.user || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof user_id != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    // 쿼리
    var query =
        "SELECT from_user_id, nickname, image, title, comments, book_image_path, t.post_id " +
        "FROM trade t JOIN review r ON r.trade_id = t.trade_id " +
            "JOIN post p ON t.post_id = p.post_id " +
            "JOIN book b ON b.book_id = p.book_id " +
            "JOIN user u  ON r.from_user_id = u.user_id " +
            "WHERE r.to_user_id = ? LIMIT ?, ? ";

    // 테스트 쿼리 : user_id  = 4

    template_list(
        query,
        [user_id,start,count],
        review,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json("success",1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getRequestPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof page    != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    var query =
        "SELECT t.post_id, book_image_path, title, author, translator, publisher, " +
        "pub_date, bookmark_cnt, condition_name FROM trade t JOIN post p ON t.post_id = p.post_id " +
        "JOIN book b ON p.book_id = b.book_id JOIN book_condition bc ON p.book_condition_id = bc.book_condition_id " +
        "WHERE t.req_user_id = ? LIMIT ?, ?";

    template_list(
        query,
        [user_id,start,count],
        post_list,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json('success',1));
            else res.json(trans_json(msg,1));
        }
    );
};

/* GET users listing. */

//json 객체 생성관련 함수 불러오기
var json = require("./json")
    ,trans_json = json.trans_json
    ,review = json.review
    ,post_list = json.post_list
    ,template_list = require('./template').template_list
    ,trans_list = json.trans_list;


// api : /users/:user_id/posts/list
exports.getUserPostList = function(req,res){
    //parameter로 받은 사용자 아이디
    var user_id = req.session.passport.user ;

    //var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    console.log(user_id);

    // query string 처리
    var page = Number(req.query.page) || 0;
    var count = Number(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;
    var posts = [];

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof page    != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    var query =
        "select p.post_id, title, author, max(thumbnail_path) thumbnail_path, translator, publisher, pub_date, " +
        "bookmark_cnt FROM post p JOIN book b ON p.book_id = b.book_id " +
        "JOIN post_image pi ON p.post_id = pi.post_id " +
        "WHERE p.user_id = ? GROUP BY p.post_id  ORDER BY p.create_date DESC LIMIT ?, ?";


    template_list(
        query,
        [user_id,start,count],
        post_list,
        function(err,results){
            if(err) {
                res.json(trans_json('사용자 기부 게시물을 얻는데 실패했습니다.',0));
            } else{
                if(results === 0 ){
                    res.json(trans_json('사용자 기부 게시물이 없습니다.',1));
                } else{
                    res.json(trans_json('success',1,results));
                }
            }
        }
    );

};

// api : /users/:user_id/reviews/list
exports.getReviewList = function(req,res){

    //세션으로 얻은 사용자 아이디
    var user_id = JSON.parse(req.params.user_id);
    // req.session.passport.user || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;
    console.log('user_id : ',user_id);

    // query string 처리
    var page = JSON.parse(req.query.page) || 0;
    var count = JSON.parse(req.query.count) || 10;

    // 페이징 관련 계산
    var start = page*count;

    //타입 체크
    if (typeof user_id != "number") res.json('유저 아이디 타입은 숫자여야 합니다.',0);
    if (typeof user_id != "number") res.json('페이지 타입은 숫자여야 합니다.',0);
    if (typeof count   != "number") res.json('카운트 타입은 숫자여야 합니다',0);

    console.log('err3');

    // 쿼리
    var query =
        "SELECT from_user_id, nickname, image, title, comments, book_image_path, t.post_id " +
        "FROM trade t JOIN review r ON r.trade_id = t.trade_id " +
        "JOIN post p ON t.post_id = p.post_id " +
        "JOIN book b ON b.book_id = p.book_id " +
        "JOIN user u  ON r.from_user_id = u.user_id " +
        "WHERE r.to_user_id = ? ORDER BY r.create_date DESC LIMIT ?, ? ";
    // 테스트 쿼리 : user_id  = 4


    template_list(
        query,
        [user_id,start,count],
        review,
        function(err,result){
            if(err) {
                res.json(trans_json('리뷰 리스트 얻는데 실패했습니다.',0));
            } else{
                if(result === 0 ){
                    res.json(trans_json('사용자 리뷰 리스트가 없습니다.',1));
                } else{
                    res.json(trans_json('success',1,result));
                }
            }
        }
    );
};

// api : /users/:user_id/req-posts/list
exports.getRequestPostList = function(req,res){
    //parameter로 받은 사용자 아이디


    var user_id = JSON.parse(req.params.user_id) || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0)) ;

    console.log('user id : ',user_id);
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
        "SELECT t.post_id, max(thumbnail_path) thumbnail_path, title, author, translator, publisher, " +
        "pub_date, bookmark_cnt, p.current_status FROM trade t JOIN post p ON t.post_id = p.post_id " +
        "JOIN book b ON p.book_id = b.book_id " +
        "JOIN post_image pi ON p.post_id = pi.post_image " +
        "WHERE t.req_user_id = ? group by p.post_id ORDER BY p.create_date DESC LIMIT ?, ? ";

    template_list(
        query,
        [user_id,start,count],
        post_list,
        function(err,result){
            if(err) {
                res.json(trans_json('사용자 요청 게시물을 얻는데 실패했습니다.',0));
            } else{
                if(result === 0 ){
                    res.json(trans_json('사용자 요청 게시물이 없습니다.',1));
                } else{
                    res.json(trans_json('success',1,result));
                }
            }
        }
    );
};

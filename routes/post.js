/**
 * Created by nrkim on 2014. 7. 29..
 */

var async = require('async');

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');

function getJsonData( code, message, result ){
    var data = {
        code : code,
        message : message,
        result: result
    };

    return data;
}



function sendPostList() {

}


exports.createPost = function(req,res) {
    var user_id = req.params.user_id,
        comment = req.body.comment,
        bookmark_cnt = req.body.bookmark_cnt,
        book_condition_id = req.body.book_condition_id,
        name = req.body.name,
        genre_id = req.body.genre_id,
        first_image = req.body.first_image,
        second_image = req.body.second_image,
        third_image = req.body.third_image,
        fourth_image = req.body.fourth_image,
        author = req.body.author,
        translator = req.body.translator,
        publisher = req.body.publisher,
        pub_date = req.body.pub_date,
        isbn = req.body.isbn,
        isbn13 = req.body.isbn13,
        book_image_path = req.body.book_image_path,
        list_price = req.body.list_price;


    // 필수 파라미터에 값 없을 경우
    if (comment == null || bookmark_cnt == null || book_condition_id == null || genre_id == null || first_image == null) {
        console.log(comment);
        console.log(bookmark_cnt);
        console.log(book_condition_id);
        console.log(genre_id);
        console.log(first_image);

        // 결과값
        jsonData = getJsonData(0, "파라미터 값이 없습니다.", null);
    } else {


    }
    // 카테고리 id
    var category_id;
    var book_id;


    // 1. 카테고리 정보 가져오기
    function getCategory() {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query('SELECT category_id FROM genre WHERE genre_id = ?', [genre_id], function (err, rows, fields) {
            category_id = rows[0].category_id;

            if (category_id == null)
                jsonData = getJsonData(0, "장르 id가 잘못 되었습니다.", null);

            connection.end();
        });
    }


    /*
     // 직접 입력일 경우
     if ( isbn == null && isbn13 == null ){
     createBook();
     }else{



     // isbn13으로 검색
     var connection = mysql.createConnection(dbConfig.url);
     connection.query('UPDATE * FROM book WHERE isbn13 = ?', [isbn13], function (err, rows, fields) {

     if (err) {
     console.log('에러 : ' + err);
     connection.end();
     }
     console.log('음? '+ connection);


     if ( rows.length ){
     console.log('isbn 13 있음');
     // isbn13 있으면 등록 카운트 +1

     connection.query('UPDATE book SET reg_count = reg_count + 1 WHERE book_id = ?', [rows[0].book_id], function (err, result) {
     if (err) connection.end();
     console.log('changed ' + result.changedRows + ' rows');
     connection.end();
     });
     }else{
     // isbn10 없으면 검색

     connection.query('SELECT * FROM book WHERE isbn = ?', [isbn], function (err, rows, fields) {

     if (err) connection.end();

     if ( rows.length ){
     // isbn10 있으면 등록 카운트 +1

     connection.query('UPDATE book SET reg_count = reg_count + 1 WHERE book_id = ?', [rows[0].book_id], function (err, result) {
     if (err) connection.end();
     console.log('changed ' + result.changedRows + ' rows');

     console.log('isbn 검색 결과 없음');
     // 책 저장
     connection.end();
     });
     }else{
     createBook();
     }
     });
     }
     });
     }

     */


    // 직접 등록 또는 처음 등록 되는 책일 경우 book테이블 저장
    function createBook() {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query('INSERT INTO book SET ?', {
            title: name,
            author: author,
            translator: translator,
            publisher: publisher,
            pub_date: pub_date,
            isbn: isbn,
            isbn13: isbn13,
            book_image_path: book_image_path,
            list_price: list_price,
            genre_id: genre_id
        }, function (err, result) {
            if (err) {
                connection.end();
                jsonData = getJsonData(0, err.message, null);
                res.json(jsonData);
            }
            //console.log(result.insertId);
            connection.end();

            jsonData = getJsonData(1, 'success', null);
            res.json(jsonData);
        });
    }


    // isbn 10 검색
    function getISBN10() {
        var connection = mysql.createConnection(dbConfig.url);
        var query = 'SELECT * FROM book WHERE isbn = ?';
        connection.query(query, [isbn], function (err, rows, fields) {
            if (err) {
                connection.end();
                jsonData = getJsonData(0, err.message, null);
                res.json(jsonData);

                return null;
            }
            connection.end();

            // isbn 있으면
            if (rows.length) {

                return true;
            } else {

                return false;
            }
        });
    }

    // isbn 13 검색
    function getISBN13() {
        var connection = mysql.createConnection(dbConfig.url);
        var query = 'SELECT * FROM book WHERE isbn13 = ?';
        connection.query(query, [isbn13], function (err, rows, fields) {
            if (err) {
                connection.end();
                jsonData = getJsonData(0, err.message, null);
                res.json(jsonData);

                return null;
            }
            console.log('====================');
            console.log(rows[0]);
            connection.end();
            // isbn 있으면
            if (rows.length) {

                return true;
            } else {

                return false;
            }
        });
    };


    // reg_count +1
    function addRegCount() {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query('UPDATE book SET reg_count = reg_count + 1 WHERE book_id = ?', [rows[0].book_id], function (err, result) {
            if (err) {
                connection.end();
                jsonData = getJsonData(0, err.message, null);
                res.json(jsonData);
            }

            connection.end();

            jsonData = getJsonData(1, 'success', null);
            res.json(jsonData);
        });
    }

    // isbn10 검색 : 있으면 reg_count + 1 or 없으면 책 등록
    function searchISBN10() {
        var result = getISBN10();
        if (result) {
            console.log('10에서 +1');
            addRegCount();
        } else {
            console.log('책 등록');
            createBook();
        }
    };

    // isbn13 검색 : 있으면 reg_count + 1 or 없으면 isbn 10 검색
    function searchISBN13() {
        var result = getISBN13();
        if (result) {
            console.log('13 있음');
            addRegCount();
        }
        else{
            console.log('10 검색');
            searchISBN10();
        }
    }

    // isbn13 값이 없을 경우 isbn 10 검색 or 있으면 isbn 13 검색
    if ( !isbn13 ){
        console.log('13 값 없음');

        searchISBN10();
    }else{
        console.log('13 값 있음');
        searchISBN13();
    }
};



// 포스트 수정
exports.updatePost = function(req,res){
    var user_id = req.params.user_id,
        post_id = req.body.post_id,
        comment = req.body.comment,
        bookmark_cnt = req.body.bookmark_cnt,
        book_condition_id = req.body.book_condition_id;

    // 파라미터 체크
    if ( !user_id || !post_id || !comment || !bookmark_cnt || !book_condition_id ){
        return res.json(getJsonData(0, '값이 없습니다.', null));
    }

    //******************* 본인 세션 검사 필요 *******************//
    // 세션의 user_id와 게시물의 user_id가 일치할 경우 실행

    // 쿼리 요청
    var connection = mysql.createConnection(dbConfig.url);
    var query = "UPDATE post SET comment = ?, bookmark_cnt = ?, book_condition_id = ? WHERE post_id = ?";
    var data = [comment, bookmark_cnt, book_condition_id, post_id];
    connection.query(query, data, function (err, result) {
        if (err) {
            connection.end();
            return res.json(getJsonData(0, err.message, null));
        }

        connection.end();
        res.json(getJsonData(1, 'success', null));
    });

};

// 게시물 삭제
exports.destroyPost = function(req,res){
    var user_id = req.params.user_id,
        post_id = req.body.post_id;

    // 파라미터 체크
    if ( !user_id || !post_id ){
        return res.json(getJsonData(0, '값이 없습니다.', null));
    }

    //******************* 본인 세션 검사 필요 *******************//
    // 세션의 user_id와 게시물의 user_id가 일치할 경우 실행


    // 쿼리 요청
    var connection = mysql.createConnection(dbConfig.url);
    var query = "DELETE FROM post WHERE post_id = ?";
    var data = [post_id];
    connection.query(query, data, function (err, result) {
        if (err) {
            connection.end();
            return res.json(getJsonData(0, err.message, null));
        }
        connection.end();
        res.json(getJsonData(1, 'success', null));
    });
};


// 게시물 상세 정보
exports.getPostDetail = function(req,res){
    var post_id = req.params.post_id;

    // 파라미터 체크
    if ( !post_id ){
        return res.json(getJsonData(0, '값이 없습니다.', null));
    }

    //******************* 본인 세션 검사 필요 *******************//
    // 세션의 user_id와 게시물의 user_id가 일치할 경우 실행


    // 쿼리 요청
    var connection = mysql.createConnection(dbConfig.url);
    var query = "SELECT * FROM post WHERE post_id = ?";
    var data = [post_id];
    connection.query(query, data, function (err, rows, fields) {
        if (err) {
            connection.end();
            return res.json(getJsonData(0, err.message, null));
        }

        // 게시물 작성자 정보 조회 및 [user_id, nickname, profile_image_url, like_cnt, sad_cnt]가져오기
        // 게시물 거래 정보 조회 [current_status, 요청자 user_id, nick_name, profile_image_url


        var result = {
            user : {

            },
            post : {

            },
            trade : {

            }

        }


        connection.end();
        res.json(getJsonData(1, 'success', null));
    });
};

exports.getPostList = function(req,res){
    var category_id = req.query.category_id;
    var page = req.query.page;
    var count = req.query.count;
    var sort = req.query.sort;
    var theme = req.query.theme;

    // 파라미터 초기화
    if ( !page ) page = 0;
    if ( !count ) count = 20;
    if ( !sort ) sort = "new";

    // limit 변수 초기화
    var start = page * count;
    var end = start + (count - 1);

    // WHERE 조건절 변수
    var where = "";

    // ORDER BY 정렬 변수
    var sorter = "";

    // 쿼리 함수
    function sendQuery(query, data) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(getJsonData(0, 'DB 오류', null));
            }
            connection.query(query, data, function (err, rows, fields) {
                if (err) {
                    connection.release();
                    return res.json(getJsonData(0, err.message, null));
                }
                var list = [];
                for ( var i = 0; i < rows.length; i++ ){
                    var current_status = rows[i].current_status || 0;
                    var item = {
                        post_id : rows[i].post_id,
                        thumbnail_url : rows[i].thumbnail_path,
                        book_name : rows[i].title,
                        author : rows[i].author,
                        publisher : rows[i].translator,
                        publication_date : rows[i].pub_date,
                        bookmark_count : rows[i].bookmark_cnt,
                        current_status : current_status
                    };
                    list.push(item);
                };

                connection.release();
                res.json(getJsonData(1, 'success', list));
            });
        });
    };

    // 테마 파라미터 있는 경우
    if ( theme ) {
        switch (theme) {
            case "popular" :
                sorter = "p.hits DESC,";
                break;
            case "first" :
                sorter = "p.bookmark_cnt DESC,";
                where = "WHERE b.reg_count = 1 ";
                break;
            case "pub_date" :
                sorter = "p.bookmark_cnt DESC,";
                where = "WHERE b.pub_date >= NOW() -  INTERVAL 12 MONTH ";
                break;
            case "free" :
                sorter = "p.bookmark_cnt DESC,";
                where = "WHERE p.bookmark_cnt = 0 ";
                break;
            default :
                return res.json(getJsonData(0, "'theme' 쿼리가 잘못 지정 되었습니다. 다음 중 한가지 ['popular', 'first', 'pub_date', 'free']", null));
                break;
        }
    }else{
        console.log(sort);
        // 정렬방법
        switch (sort) {
            case "new" :
                break;
            case "condition" :
                sorter = "p.book_condition_id,";
                break;
            case "bm_asc" :
                sorter = "p.bookmark_cnt,";
                break;
            case "bm_desc" :
                sorter = "p.bookmark_cnt DESC,";
                break;
            case null :
                break;
            default :
                return res.json(getJsonData(0, "'sort' 쿼리가 잘못 지정 되었습니다. 다음 중 한가지 ['new', 'condition', 'bm_asc', 'bm_desc']", null));
                break;
        }

        // 카테고리 있는 경우
        if ( category_id ){
            where = "WHERE category_id = " + category_id + " ";
        }
    }

    var data = [start, end];
    var query =
        "SELECT p.post_id, pi.thumbnail_path, b.title, b.author, b.translator, b.publisher, b.pub_date, p.bookmark_cnt, t.current_status " +
        "FROM post p " +
        "JOIN book b ON p.book_id = b.book_id " +
        "JOIN post_image pi ON p.post_id = pi.post_id " +
        "LEFT JOIN (SELECT * FROM trade WHERE current_status NOT IN(92, 91)) t ON p.post_id = t.post_id " + where +
        "GROUP BY p.post_id " +
        "ORDER BY " + sorter + " p.create_date DESC LIMIT ?, ?;";
    console.log(query);
    sendQuery(query, data);
};


exports.searchPosts = function(req,res){
    var keyword = req.query.q;
    var category_id = req.query.category_id;
    var page = req.query.page;
    var count = req.query.count;

    // 파라미터 초기화
    if ( !page ) page = 0;
    if ( !count ) count = 20;

    // limit 변수 초기화
    var start = page * count;
    var end = start + (count - 1);

    // WHERE 조건절 변수
    var where = "WHERE ";

    // 쿼리 함수
    function sendQuery(query, data) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(getJsonData(0, 'DB 오류', null));
            }
            connection.query(query, data, function (err, rows, fields) {
                if (err) {
                    connection.release();
                    return res.json(getJsonData(0, err.message, null));
                }
                var list = [];
                for ( var i = 0; i < rows.length; i++ ){
                    var current_status = rows[i].current_status || 0;
                    var item = {
                        post_id : rows[i].post_id,
                        thumbnail_url : rows[i].thumbnail_path,
                        book_name : rows[i].title,
                        author : rows[i].author,
                        publisher : rows[i].translator,
                        publication_date : rows[i].pub_date,
                        bookmark_count : rows[i].bookmark_cnt,
                        current_status : current_status
                    };
                    list.push(item);
                };

                connection.release();
                res.json(getJsonData(1, 'success', list));
            });
        });
    };


    // 카테고리 있는 경우
    if ( category_id ){
        where = where + "p.category_id = " + category_id + " and ";
    }

    where = where + "(b.title LIKE '%" + keyword + "%' or b.author LIKE '%" + keyword + "%') ";


    var data = [start, end];
    var query =
        "SELECT p.post_id, pi.thumbnail_path, b.title, b.author, b.translator, b.publisher, b.pub_date, p.bookmark_cnt, t.current_status " +
        "FROM post p " +
        "JOIN book b ON p.book_id = b.book_id " +
        "JOIN post_image pi ON p.post_id = pi.post_id " +
        "LEFT JOIN (SELECT * FROM trade WHERE current_status NOT IN(92, 91)) t ON p.post_id = t.post_id " + where +
        "GROUP BY p.post_id " +
        "ORDER BY p.create_date DESC LIMIT ?, ?;";
    console.log(query);
    sendQuery(query, data);
}
exports.reportPost = function(req,res){

}
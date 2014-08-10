/**
 * Created by onam on 2014. 7. 29..
 */

var _ = require('underscore'),
    async = require('async'),
    fstools = require('fs-tools'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    im = require('imagemagick');


// 출력 JSON
function getJsonData( code, message, result ){
    var data = {
        code : code,
        message : message,
        result: result
    };

    return data;
}

exports.createPost = function(req,res) {

    req.form.on('progress', function(bytesReceived, bytesExpected) {
        console.log(((bytesReceived / bytesExpected)*100) + "% uploaded");
    });
    req.form.on('end', function() {
        // 필수 파라미터에 값 없을 경우
        if (req.body.comment == null || req.body.bookmark_cnt == null || req.body.book_condition_id == null || req.body.genre_id == null || req.body.name == null || req.body.is_certificate == null) {
            return res.json(getJsonData(0, "파라미터 값이 없습니다.", null));
        }

        //////// 이미지 파일 아닐 경우 처리 필요 ////////
        async.waterfall([
            function(callback) {
                var files = _.map(req.files, function(file) {
                    return file;
                });
                callback(null, files);
            },
            function(files, callback) {
                req.uploadFiles = [];


                async.each(files, function(file, cb) {
                    if (file.size) {
                        var baseImageDir = __dirname + '/../images/original/';
                        var destPath = path.normalize(baseImageDir + "o_" + path.basename(file.path));
                        fstools.move(file.path, destPath, function(err) {
                            if (err) {
                                cb(err);
                            } else {

                                console.log('Original file(', file.name, ') moved!!!');
                                var largePath = __dirname + "/../images/large/" + "l_" + path.normalize(path.basename(file.path));
                                var thumbPath = __dirname + "/../images/thumbs/" + "t_" + path.normalize(path.basename(file.path));

                                // 가로 720px 리사이즈
                                im.resize({
                                    srcPath: destPath,
                                    dstPath: largePath,
                                    width:   720
                                }, function(err, stdout, stderr){
                                    if (err) cb(err);

                                    // 가로 200px 리사이즈
                                    im.resize({
                                        srcPath: largePath,
                                        dstPath: thumbPath,
                                        width:   200
                                    }, function(err, stdout, stderr){
                                        if (err) cb(err);

                                        // 경로 저장
                                        req.uploadFiles.push({
                                            originalPath : destPath,
                                            largePath : largePath,
                                            thumbPath : thumbPath
                                        })

                                        cb();
                                    });
                                });
                            }
                        });
                    } else {
                        fstools.remove(file.path, function(err) {
                            if (err) {
                                cb(err);
                            } else {
                                console.log('Zero file removed!!!');

                                cb();
                            }
                        });
                    }

                }, function(err, result) {
                    if (err) {
                        return res.json(getJsonData(0, err.message, null));
                    } else {

                        // 게시물 생성
                        sendQuery();
                    }
                });
            }
        ]);
    });

    function sendQuery() {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                return res.json(getJsonData(0, 'DB 오류', null));
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    return res.json(getJsonData(0, err.message, null));
                } else {

                    // 1. isbn, isbn13 검색
                    var query = "SELECT book_id FROM book WHERE isbn = ? or isbn13 = ?";
                    var data = [req.body.isbn, req.body.isbn13];
                    connection.query(query, data, function (err, rows, fields) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                return res.json(getJsonData(0, err.message, null));
                            });
                        }

                        // 2. 책이 이미 있으면 reg_count +1
                        if (rows.length) {
                            // 1. book_id 참조 책 reg_count +1
                            query = "UPDATE book SET reg_count = reg_count + 1 WHERE book_id = ?";
                            data = [rows[0].book_id];
                            connection.query(query, data, function (err, result) {
                                if (err) {
                                    connection.rollback(function () {
                                        connection.release();
                                        return res.json(getJsonData(0, err.message, null));
                                    });
                                }
                                createPost(rows[0].book_id);
                            });
                        } else {
                            // 1. 책 등록(name, genre_id, author, translator, publisher, pub_date, isbn, isbn13, book_image_path, list_price)
                            query = "INSERT INTO book SET ?";
                            data = {
                                title: req.body.name,
                                author: req.body.author || null,
                                translator: req.body.translator || null,
                                publisher: req.body.publisher || null,
                                pub_date: req.body.pub_date || null,
                                isbn: req.body.isbn || null,
                                isbn13: req.body.isbn13 || null,
                                book_image_path: req.body.book_image_path || null,
                                list_price: req.body.list_price || null,
                                genre_id: req.body.genre_id
                            };
                            connection.query(query, data, function (err, result) {
                                if (err) {

                                    connection.rollback(function () {
                                        connection.release();
                                        return res.json(getJsonData(0, err.message, null));
                                    });

                                }

                                createPost(result.insertId);
                            });
                        }

                        // 3. book_id 참조 게시물 등록(category_id, user_id, book_id, first_image, second_image, third_image, fourth_image)
                        function createPost(book_id) {
                            query =
                                "INSERT INTO post (comment, bookmark_cnt, user_id, book_id, category_id, book_condition_id, is_certificate) " +
                                "SELECT ?, ?, ?, ?, category_id, ?, ? " +
                                "FROM genre " +
                                "WHERE genre_id = ?;";
                            data = [req.body.comment, req.body.bookmark_cnt, req.params.user_id, book_id, req.body.book_condition_id, req.body.is_certificate, req.body.genre_id];
                            connection.query(query, data, function (err, result) {
                                if (err) {
                                    connection.rollback(function () {
                                        connection.release();
                                        return res.json(getJsonData(0, err.message, null));
                                    });

                                }

                                uploadImage(result.insertId);
                            });
                        }
                        // 4. post_id 참조 사진 등록(썸네일 이미지 제작, 파일 패스 DB 등록)
                        function uploadImage(post_id) {
                            query = 'INSERT INTO post_image(original_image_path, large_image_path, thumbnail_path, mime, post_id) VALUES(?, ?, ?, ?, ?)';
                            var photos = req.uploadFiles;
                            async.each(
                                photos,
                                function (photo, callback) {
                                    var mimeType = mime.lookup(photo.originalPath);
                                    data = [path.basename(photo.originalPath), path.basename(photo.largePath), path.basename(photo.thumbPath), mimeType, post_id];
                                    connection.query(query, data, function (err, result) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            callback();
                                        }
                                    });
                                },
                                function (err) {
                                    if (err) {
                                        connection.rollback(function () {
                                            connection.release();
                                            res.json({
                                                error: err.message
                                            });
                                        });
                                    } else {
                                        connection.commit(function (err) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    connection.release();
                                                    res.json(getJsonData(0, err.message, null));
                                                });
                                            } else {
                                                connection.release();
                                                res.json(getJsonData(1, 'success', null));
                                            }
                                        });
                                    }
                                }
                            );
                        }
                    });
                }
            });
        });
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

    // 책갈피 최대 개수 제한
    if ( bookmark_cnt > 2 || bookmark_cnt < 0 ){
        return res.json(getJsonData(0, '책갈피는 최소 0개, 최대 2개입니다.', null));
    }

    //******************* 본인 세션 검사 필요 *******************//
    // 세션의 user_id와 게시물의 user_id가 일치할 경우 실행

    // 쿼리 함수
    function sendQuery(query, data) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(getJsonData(0, 'DB 오류', null));
            }
            connection.query(query, data, function (err, result) {
                if (err) {
                    connection.release();
                    return res.json(getJsonData(0, err.message, null));
                }

                console.log(result);
                if ( !result.affectedRows ) return res.json(getJsonData(0, "수정할 게시물이 없습니다.", null));

                connection.release();
                res.json(getJsonData(1, 'success', null));
            });
        });
    };

    // 쿼리 요청
    var query = "UPDATE post SET comment = ?, bookmark_cnt = ?, book_condition_id = ? WHERE post_id = ? and user_id = ?";
    var data = [comment, bookmark_cnt, book_condition_id, post_id, user_id];
    sendQuery(query,data);

};

// 게시물 삭제
exports.destroyPost = function(req,res){
    var user_id = req.params.user_id,
        post_id = req.body.post_id;

    // 파라미터 체크
    if ( !post_id ){
        return res.json(getJsonData(0, 'post_id 값이 없습니다.', null));
    }

    //******************* 본인 세션 검사 필요 *******************//
    // 세션의 user_id와 게시물의 user_id가 일치할 경우 실행


    // 쿼리 함수
    function sendQuery(query, data) {
        connectionPool.getConnection(function(err, connection) {
            if (err) {
                res.json(getJsonData(0, 'DB 오류', null));
            }
            connection.query(query, data, function (err, result) {
                if (err) {
                    connection.release();
                    return res.json(getJsonData(0, err.message, null));
                }

                console.log(result);
                if ( !result.affectedRows ) return res.json(getJsonData(0, "삭제할 게시물이 없습니다.", null));

                connection.release();
                res.json(getJsonData(1, 'success', null));
            });
        });
    };

    // 쿼리 요청
    var query = "UPDATE post SET current_status = 1 WHERE post_id = ? and user_id = ?;";
    var data = [post_id, user_id];
    sendQuery(query,data);
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
    var query =
        "SELECT u.user_id, u.nickname, u.image, u.like_total_cnt, u.sad_total_cnt, " +
        "p.comment, p.bookmark_cnt, p.book_condition_id, " +
        "GROUP_CONCAT(pi.large_image_path) large_image_paths, " +
        "b.title, b.author, b.translator, b.publisher, b.pub_date, g.genre, " +
        "t.trade_id, t.current_status, ru.user_id req_user_id, ru.nickname req_nickname, ru.image req_image " +
        "FROM post p " +
        "JOIN user u ON p.user_id = u.user_id " +
        "JOIN post_image pi ON p.post_id = pi.post_id " +
        "JOIN book b ON p.book_id = b.book_id " +
        "JOIN genre g ON b.genre_id = g.genre_id " +
        "LEFT JOIN (SELECT trade_id, current_status, post_id, req_user_id FROM trade WHERE current_status NOT IN(92, 91)) t ON p.post_id = t.post_id " +
        "LEFT JOIN user ru ON t.req_user_id = ru.user_id " +
        "WHERE p.post_id = ?;";
    console.log(query);
    var data = [post_id];
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(getJsonData(0, 'DB 오류', null));
        }
        connection.query(query, data, function (err, rows, fields) {
            if (err) {
                connection.release();
                return res.json(getJsonData(0, err.message, null));
            }

            // 게시물 작성자 정보 조회 및 [user_id, nickname, profile_image_url, like_cnt, sad_cnt]가져오기
            // 게시물 거래 정보 조회 [current_status, 요청자 user_id, nick_name, profile_image_url


            var result = {
                user : {
                    user_id : rows[0].user_id,
                    nick_name : rows[0].nick_name,
                    profile_image_url : rows[0].image,
                    like_cnt : rows[0].like_total_cnt,
                    sad_cnt : rows[0].sad_total_cnt
                },
                post : {
                    comment : rows[0].comment,
                    book_mark_count : rows[0].bookmark_cnt,
                    book_image_url : rows[0].large_image_paths,
                    book_condition : rows[0].book_condition_id,
                    is_certificate : rows[0].is_certificate,
                    create_date : rows[0].create_date,
                    book : {
                        book_name : rows[0].title,
                        author : rows[0].author,
                        publisher : rows[0].translator,
                        publication_date : rows[0].pub_date,
                        genre : rows[0].genre
                    }
                }
            };

            var trade;
            if ( !rows[0].trade_id ) {
                trade = null;
            }else{
                trade = {
                    trade_id : rows[0].trade_id,
                    current_status : rows[0].current_status,
                    beneficiary : {
                        user_id : rows[0].req_user_id,
                        nick_name : rows[0].req_nickname,
                        profile_image_url : rows[0].req_image
                    }
                }
            }

            result.trade = trade;

            connection.release();
            res.json(getJsonData(1, 'success', result));
        });
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

    // 검색 키워드
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
    var user_id = req.params.user_id;
    var post_id = req.body.post_id;
    var cause = req.body.cause;

    if ( !cause ) return res.json(getJsonData(0, '신고사유를 입력해야 됩니다.', null));

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

                connection.release();
                res.json(getJsonData(1, 'success', null));
            });
        });
    };

    var data = {user_id:user_id, post_id:post_id, cause:cause};
    var query = "INSERT INTO post_report SET ?";
    sendQuery(query, data);
}
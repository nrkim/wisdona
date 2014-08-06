/**
 * Created by nrkim on 2014. 8. 6..
 */
var json = require('./json');
var trans_json = json.trans_json;
var news_list = json.news_list;
var faq_list = json.faq_list;
var policy = json.policy;
var book_state = json.book_state;
var genre_list = json.genre_list;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');


exports.getGenreList = function(req,res){
    var query = "select genre_id, genre from genre";
    var genres=[];

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                genres.push(genre_list(rows, i));
            }

            connection.end();
            res.json(trans_json("success",1,genres));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.getBookConditionList = function(req,res){
    var query = "select * from book_condition";
    var books=[];

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                books.push(book_state(rows, i));
            }

            connection.end();
            res.json(trans_json("success",1,books));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.getQnaList = function(req,res){

    var user_id = req.params.user_id || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var question = req.body.question || res.json(trans_json("질문을 입력하지 않았습니다.",0));

    var query = "insert into qna(question,create_date,user_id) values(?,now(),?) ";

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,[question,user_id],function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            connection.end();
            res.json(trans_json('success',1));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.getServiceTerms = function(req,res){

    var query = "select content from service_board where service_board_id =1";

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            connection.end();
            res.json(trans_json("success",1,policy(rows,0)));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }


};

exports.getPrivacy = function(req,res){

    var query = "select content from service_board where service_board_id =2";

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query,function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            connection.end();
            res.json(trans_json("success",1,policy(rows,0)));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.getNewsList = function(req,res){

    var query = "SELECT title, content FROM news";

    var news =[];

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query, function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                news.push(news_list(rows, i));
            }

            connection.end();
            res.json(trans_json('success',1,news));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

exports.getFaqList = function(req,res){

    var query = "SELECT question, answer FROM faq";

    var faq =[];

    try {
        var connection = mysql.createConnection(dbConfig.url);
        connection.query(query, function (err,rows,info) {
            if (err) {
                connection.end();
                res.json(trans_json('아이디 또는 비밀번호 중복 됩니다.', 0));
            }

            for(var i =0; i<rows.length; i++) {
                faq.push(faq_list(rows, i));
            }

            connection.end();
            res.json(trans_json('success',1,faq));
        });
    } catch(err) {
        connection.end();
        res.json(trans_json('데이터베이스 연결 오류입니다.', 0));
    }
};

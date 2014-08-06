/**
 * Created by nrkim on 2014. 8. 6..
 */
var json = require('./json');
var trans_json = json.trans_json;
var news_list = json.news_list;
var faq_list = json.faq_list;

// db 셋팅
var dbConfig = require('../config/database');
var mysql = require('mysql');


exports.getGenreList = function(req,res){

};

exports.getBookConditionList = function(req,res){

};

exports.getQnaList = function(req,res){

};

exports.getServiceTerms = function(req,res){

};

exports.getPrivacy = function(req,res){

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

/**
 * Created by nrkim on 2014. 8. 6..
 */

var json = require('./json');
var trans_json = json.trans_json;


exports.template_get_list = function(req,res,query,params,get_list){
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }

        var list=[];

        connection.query(query,params, function(err, rows, fields) {
            if(err){
                connection.release();
                res.json(trans_json(err.code+" 중복된 데이터를 금지합니다.", 0));        //에러 코드 처리
            }

            for(var i =0; i<rows.length; i++) {
                list.push(get_list(rows,i));
            }

            connection.release();
            res.json(trans_json("success",1,list));
        });
    });
};

exports.template_get_element = function(req,res,query,params,get_element){
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }

        connection.query(query,params, function(err, rows, fields) {
            if(err){
                connection.release();
                res.json(trans_json(err.code+" sql 에러입니다.", 0));        //에러 코드 처리
            }

            connection.release();
            res.json(trans_json("success",1,get_element(rows,0)));
        });
    });
};

exports.template_post = function(req,res,query,params){
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }

        connection.query(query,params, function(err, rows, fields) {
            if(err){
                connection.release();
                res.json(trans_json(err.code+" sql 에러입니다. ", 0));        //에러 코드 처리 - 중복 데이터 처리
            }

            connection.release();
            res.json(trans_json("success",1));
        });
    });
};






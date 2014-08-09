/**
 * Created by nrkim on 2014. 8. 6..
 */

var json = require('./json');
var trans_json = json.trans_json;

// json 객체 만드는 탬플릿 만들기

exports.template_get_list = function(req,res,query,params,get_list,callback){
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

            //list.reduce(function(pre,now){
            //    return pre.push(get_list(rows,i));
            //});

            //[0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
            //    return previousValue + currentValue;
            //});


            for(var i =0; i<rows.length; i++) {
                list.push(get_list(rows,i));
            }

            if(callback){
                callback(req,res);
            }

            connection.release();
            res.json(trans_json("success",1,list));
        });
    });
};

exports.template_get_element = function(req,res,query,params,get_element,callback){
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }

        connection.query(query,params, function(err, rows, fields) {
            if(err){
                connection.release();
                res.json(trans_json(err.code+" sql 에러입니다.", 0));        //에러 코드 처리
            }

            if(callback){
                callback(req,res);
            }

            connection.release();
            res.json(trans_json("success",1,get_element(rows,0)));
        });
    });
};

exports.template_post = function(req,res,query,params,callback){
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
        }

        connection.query(query,params, function(err, rows, fields) {
            if(err){
                connection.release();
                res.json(trans_json(err.code+" sql 에러입니다. ", 0));        //에러 코드 처리 - 중복 데이터 처리
            }

            if(callback){
                callback(req,res);
            }

            connection.release();
            res.json(trans_json("success",1));
        });
    });
};

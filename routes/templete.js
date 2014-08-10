/**
 * Created by nrkim on 2014. 8. 6..
 */

var json = require('./json');
var trans_json = json.trans_json;

// 커넥션 관련 탬플릿

exports.template_get = function(req,res,query,params,get_list,callback){
    try {
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
            }

            connection.query(query, params, function (err, rows, fields) {
                if (err) {
                    connection.release();
                    throw err;
                    //throw err;
                    //res.json(trans_json(err.code + " 중복된 데이터를 금지합니다.", 0));        //에러 코드 처리
                }

                console.log('template_get');


                //데이터 결과가 없을 떄 에러인 경우도 있고 에러가 아닌 경우도 있음 / 두가지경우가 있기 때문에 flag parameter 필요
                //for문을 forEach함수로 바꿈

                console.log('rows is ',rows.length);

                if(rows.length == 0) {
                    console.log('length is 0');
                    res.json(trans_json("일치하는 정보가 없습니다.",0));
                }
                else{
                    console.log('foreach is executed');

                    rows.forEach(function (row, i, arr) {
                        arr[i] = get_list(arr, i);
                        //return arr;
                    });

                    connection.release();
                    res.json(trans_json("success", 1, rows));
                }
            });
        });
    } catch(err){
        callback(err);
    }
};

exports.template_post = function(req,res,query,params,callback){
    try {
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                res.json(trans_json("데이터 베이스 연결 오류 입니다.", 0));
            }

            connection.query(query, params, function (err, rows, fields) {
                if (err) {
                    connection.release();
                    res.json(trans_json(err.code + " sql 에러입니다. ", 0));        //에러 코드 처리 - 중복 데이터 처리
                }

                connection.release();
                res.json(trans_json("success", 1));
            });
        });
    } catch (err){
        callback(err);
    }
};

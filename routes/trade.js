/**
 * Created by nrkim on 2014. 7. 29..
 */

exports.sendRequestPost = function(req,res){
    var data={
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.acceptPost = function(req,res){
    var data={
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.cancelPost = function(req,res){

    var data={
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);

};
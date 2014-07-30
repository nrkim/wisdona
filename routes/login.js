/**
 * Created by nrkim on 2014. 7. 29..
 */

exports.login = function(req,res){
    var data = {
        "result": "success",
        "result_msg": "success"
    };
    res.json(data);
};

exports.requestActivationEmail = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };

    res.json(data);
};

exports.requestSendEmail = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.logout = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.activationEmail = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.updatePassword = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};
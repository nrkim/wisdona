/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 생성관련 함수
var json = require('./json')
    ,trans_json = json.trans_json
    ,user_info = json.user_info
    ,user_detail = json.user_detail

//db 커넥션 템플릿
var template = require('./template')
    ,template_item = template.template_item
    ,template_list = template.template_list
    ,logout = require('./login').logout;

// 이미지 업로드 관련
var _ = require('underscore')
    ,im = require('imagemagick')
    ,formidable = require('formidable')
    ,fstools = require('fs-tools')
    ,fs = require('fs')
    ,async = require('async')
    ,path = require('path')
    mime = require('mime');


// api: /users/:user_id/profile/show
exports.getUserInfo = function(req,res){

    var user_id = req.session.passport.user;

    console.log('get user info : user_id   ',user_id);

    //타입 체크
    if(typeof user_id != "number") trans_json('사용자 아이디는 숫자 타입이어야 합니다.',0);


    // 유저 정보를 얻는 쿼리
    // 유저는 게시물을 한번도 써본적이 없거나 혹은 거래를 한번도 해보지 않았거나 거래를 진행 중인 사람으로
    // 각각 unread_msg_cnt를 구하는 연산을 적용

    var query =
        "SELECT u.user_id, nickname, image, self_intro, bookmark_total_cnt, " +
        "IFNULL(SUM(CASE WHEN u.user_id = req_user_id THEN be_message_cnt ELSE do_message_cnt END),0) unread_msg_cnt, " +
        "like_total_cnt, sad_total_cnt " +
        "FROM post p LEFT JOIN trade t ON p.post_id = t.post_id " +
        "RIGHT JOIN ( select * from user where sleep_mode = 0) u on p.user_id = u.user_id OR t.req_user_id = u.user_id " +
        "WHERE u.user_id = ? " +
        "GROUP BY u.user_id";

    // note : query중 null이 나온 경우 -> user_id가 아예없는 경우

    template_list(
        query,
        [user_id],
        user_info,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json('success',1,result[0]));     //반드시 하나의 결과만 나와야 함
            else res.json(trans_json(msg,0));                           // 일치하는 결과가 없을 때는 에러 처리
        }
    );
};

// api :
exports.destroyUserAccount = function(req,res){


    //계정 삭제시 휴면 계정
    var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    // 타입 검사
    if(typeof user_id != "number") trans_json('사용자 아이디는 숫자 타입이어야 합니다.',0);

    //쿼리
    var query = 'UPDATE user SET sleep_mode = 1 WHERE user_id = ?';

    // 휴면 계정 설정 후 로그아웃
    template_item(
        query,
        [user_id],
        function(err,rows,msg){
            if (err) {console.log(err.message); res.json(trans_json(msg,0));}
            else {console.log('로그아웃'); logout(req,res);}       // 사용자 계정 휴면 전환 후 로그아웃
        }
    );
};

// api :
exports.getAccountSettings = function(req,res){

    var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    console.log('account settings user_id :   ',user_id);


    // 페이스북 계정 정보
    // date time 안되는 이유 찾아보기
    var query =
        'SELECT user_id, nickname, image, self_intro, name, phone, address, push_settings, ' +
        'email_auth "email_authentication", ' +
        '(CASE WHEN sanction_date < NOW() THEN TRUE ELSE FALSE END) sanction_date ' +
        'FROM (SELECT * FROM user WHERE sleep_mode = 0) u ' +
        'WHERE user_id = ? ';

    console.log('query  ');

    template_list(
        query,
        [user_id],
        user_detail,
        function(err,result,msg){
            console.log('result!!!',result);
            if(err) { res.json(trans_json(msg,0));}
            else {
                console.log('res  ',result);
                if(result.length == 0) {
                    res.json(trans_json(msg,0));
                }
                else {
                    console.log('what;;;;');
                    console.log('res2 : ',result);
                    result[0].push_settings =
                        _.map(result[0].push_settings.split(','),
                            function(str){ return Number(str); });
                    if(result[0].email_authentication) { result[0].email_authentication = true; }
                    else { result[0].email_authentication = false; }
                    if(result[0].sanction_date) { result[0].sanction_date = true; }
                    else { result[0].sanction_date = false; }
                    res.json(trans_json('success', 1, result[0]));
                }   // 일치하는 결과가 없을 때는 에러
            }
        }
    );
};

// api :

/*
var form = new formidable.IncomingForm();
form.uploadDir = path.normalize(__dirname + '/../tmp/');
form.keepExtensions = true;

form.parse(req, function(err, fields, file) {
    req.body=fields;

    if (file.size) {
        var baseImageDir = __dirname + '/../images/';
        var destPath = path.normalize(baseImageDir + path.basename(file.path));
        fstools.move(file.path, destPath, function(err) {
            if (err) {
                console.log('err occured',err.messaage);
                res.json(trans_json(err.message,0));
            } else {
                console.log('Original file(', file.name, ') moved!!!');
                req.uploadFile = destPath;
                next();
            }
        });
    } else {
        fstools.remove(file.path, function(err) {
            if (err) {
                res.json(trans_json(err.message,0));
            } else {
                console.log('Zero file removed!!!');
                next();
            }
        });
    }
});
*/

exports.uploadImage = function (req,res,next){

    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + '/../tmp/');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        req.body = fields;

        //////// 이미지 파일 아닐 경우 처리 필요 ////////
        async.waterfall([
            function(callback) {
                var filesArr = _.map(files, function(file) {
                    return file;
                });
                callback(null, filesArr);
            },
            function(filesArr, callback) {
                req.uploadFiles = [];

                async.each(filesArr, function (file, cb) {
                    if (file.size) {
                        var baseImageDir = __dirname + '/../images/';
                        var destPath = path.normalize(baseImageDir + path.basename(file.path));
                        fstools.move(file.path, destPath, function (err) {
                            if (err) {
                                console.log('err occured', err.messaage);
                                cb(err);//res.json(trans_json(err.message,0));
                            } else {
                                console.log('Original file(', file.name, ') moved!!!');
                                req.uploadFile = destPath;
                                cb();
                            }
                        });
                    } else{
                        fstools.remove(file.path, function(err) {
                            if (err) {
                                callback(err);
                                //res.json(trans_json(err.message,0));
                            } else {
                                console.log('Zero file removed!!!');
                                callback();
                            }
                        });
                    }
                }, function (err) {
                    if( err){
                        callback(err);
                    }else{
                        callback();
                    }
                });

            }
        ], function (err) {
            if (err) {
                res.json(trans_json(err.message,0));
            }else{
                next();
            }
        });

    });
};

// api : /users/:user_id/account-settings/update
exports.updateAccountSettings = function(req,res){

    var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    var updated = {};

    //updated.nickname = req.body.nick_name           || null;
    updated.image = req.uploadFile                  || null;
    updated.self_intro = req.body.self_intro        || null;
    updated.name = req.body.name                    || null;
    updated.phone = req.body.phone                  || null;
    updated.address = req.body.address              || null;
    updated.push_settings = req.body.push_settings  || null;


    if(updated.push_settings){

        updated.push_settings =_.reduce(req.body.push_settings, function(memo, num){ return (String(memo) +',' +String(num)); }, '');
    }

    query =
        'UPDATE user SET ? WHERE user_id = ? ';

    template_item(
        query,
        [updated,user_id],
        function(err,rows,msg){
            if (err) res.json(trans_json(msg,0));
            else res.json(trans_json(msg,1));
        }
    );

};

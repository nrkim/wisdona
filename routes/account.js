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
    ,fstools = require('fs-tools')
    ,fs = require('fs')
    ,path = require('path')
    mime = require('mime');


var formidable = require('formidable');

var baseImageDir = __dirname + '/../images/';

// 서버가 죽지 않기 위해 해야 할 일은 ?
///users/:user_id/profile/show
exports.getUserInfo = function(req,res){

    var user_id = req.session.passport.user;


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
    // 테스트 케이스
    // 2 : 요청자: 10 게시자: 4  post: 16
    // 3 : 요청자: 15 게시자: 30 post: 17
    // 4 : 요청자: 20 게시자: 6  post: 18
    // 7 : 요청자: 30 게시자: 3  post: 15
    // 8 : 요청자: 30 게시자: 7  post: 19
    // 사용자 아이디 30은 8개의 않읽은 메시지 있음

    template_list(
        query,
        [user_id],
        user_info,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json('success',1,result[0]));
            else res.json(trans_json(msg,0));   // 일치하는 결과가 없을 때는 에러
        }
    );
};

exports.destroyUserAccount = function(req,res){
    //계정 삭제시 휴면 계정
    var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));
    var query = 'UPDATE user SET sleep_mode = 1 WHERE user_id = ?';


    template_item(
        query,
        [user_id],
        function(err,rows,msg){
            if (err) res.json(trans_json(msg,0));
            else logout(req,res);
        }
    );
};

//페이스북 계정 정보
exports.getAccountSettings = function(req,res){

    var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

    // date time 안되는 이유 찾아보기
    var query =
        "SELECT user_id, nickname, image, self_intro, name, phone, address, push_settings, " +
        "DATE_FORMAT(convert_tz(sanction_date , \"UTC\", \"Asia/Seoul\"), \"%Y-%m-%d %H:%i:%s\" ) " +
        "FROM (SELECT * FROM user WHERE sleep_mode = 0) u " +
        "WHERE user_id = ?";

    template_list(
        query,
        [user_id],
        user_detail,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) {
                result[0].push_settings =
                    _.map(result[0].push_settings.split(','),
                        function(str){ return Number(str); });
                res.json(trans_json('success', 1, result[0]));
            }
            else res.json(trans_json(msg,0));   // 일치하는 결과가 없을 때는 에러
        }
    );

};


exports.uploadImage = function (req,res,next){

    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + '/../tmp/');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, file) {
        req.body=fields;

        if (file.size) {
            var destPath = path.normalize(baseImageDir + path.basename(file.path));
            fstools.move(file.path, destPath, function(err) {
                if (err) {
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
};

// /users/:user_id/account-settings/update
exports.updateAccountSettings = function(req,res){
        var user_id = req.params.user_id;
        //var user_id = req.session.passport.user || res.json(trans_json("로그아웃 되었습니다. 다시 로그인 해 주세요.",0));

        var updated = {};

        updated.nickname = req.body.nick_name           || null;
        updated.image = req.uploadFile                  || null;
        updated.self_intro = req.body.self_intro        || null;
        updated.name = req.body.name                    || null;
        updated.phone = req.body.phone                  || null;
        updated.address = req.body.address              || null;
        updated.push_settings = req.body.push_settings  || null;

        //console.log(updated);
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

/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 생성관련 함수 불러오기
var json = require('./json');
var trans_json = json.trans_json;
var user_info = json.user_info;
var user_detail = json.user_detail
    ,template = require('./templete')
    ,template_get = template.template_get
    ,template_post = template.template_post
    ,logout = require('./login').logout;


exports.getUserInfo = function(req,res){

    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));
    var query =
        "select u.user_id, nickname, image, self_intro, bookmark_total_cnt, " +
        "sum(case when u.user_id = req_user_id then be_message_cnt else do_message_cnt end) unread_msg_cnt, " +
        "like_total_cnt, sad_total_cnt " +
        "from ( select * " +
        "from trade " +
        "where current_status = 0 " +
        ") t join post p on p.post_id = t.post_id " +
        "join user u on p.user_id = u.user_id or t.req_user_id = u.user_id " +
        "where u.user_id = ? " +
        "group by u.user_id";

    // 테스트 케이스
    // 2 : 요청자: 10 게시자: 4  post: 16
    // 3 : 요청자: 15 게시자: 30 post: 17
    // 4 : 요청자: 20 게시자: 6  post: 18
    // 7 : 요청자: 30 게시자: 3  post: 15
    // 8 : 요청자: 30 게시자: 7  post: 19
    // 사용자 아이디 30은 8개의 않읽은 메시지 있음


    template_get(
        req,res,
        query,
        [user_id],
        user_info
    );
};

exports.createUser = function(req,res){
    //curl로 테스트 해볼것
    if(req.user){
        res.json(trans_json('success',1));
    }
    else{
        res.json(trans_json('사용자 추가 실패',0));
    }
};

exports.destroyUserAccount = function(req,res){
    //계정 삭제시 휴면 계정
    var user_id = req.body.user_id || res.json(trans_json("아이디가 없습니다",0));
    var query = 'UPDATE user SET sleep_mode = 1 WHERE user_id = ?';

    template_post(
        req,res,
        query,
        [user_id],
        logout
    );

};

//페이스북 계정 정보
exports.getAccountSettings = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));

    var query =
        "SELECT user_id, nickname, image, self_intro, name, phone, address " +
        "FROM user " +
        "WHERE user_id = ?"

    //    "SELECT user_id, nickname, image, self_intro, name, phone, address, push_settings " +
    //    "FROM user " +
    //    "WHERE user_id = ?";


    template_get(
      req,res,
      query,
      [user_id],
      user_detail
    );

};

exports.updateAccountSettings = function(req,res){


    // passport 적용용
   var user_id = JSON.parse(req.session.passport.user)  || trans_json("아이디를 입력하지 않았습니다.",0);

    //var user_id = JSON.parse(req.params.user_id)  || trans_json("아이디를 입력하지 않았습니다.",0);
    var updated = {};

    if (req.body.nick_name)     updated.nick_name = req.body.nick_name;

    // profile image --> req.files 로 처리 -> 파일 업로드 구현 할것
    if (req.body.profile_image) updated.profile_image = req.body.profile_image;
    if (req.body.self_intro)    updated.self_intro = req.body.self_intro;
    if (req.body.full_name)     updated.name = req.body.full_name;
    if (req.body.phone)         updated.phone = req.body.phone;
    if (req.body.address)       updated.address = req.body.address;
    if (req.body.push_settings) updated.push_settings = req.body.push_settings;

    query =
        'UPDATE user SET ? WHERE user_id = ? ';


    template_post(
        req,res,
        query,
        [updated,user_id]
    );
};

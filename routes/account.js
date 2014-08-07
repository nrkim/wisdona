/**
 * Created by nrkim on 2014. 7. 29..
 */

//json 객체 생성관련 함수 불러오기
var json = require('./json');
var trans_json = json.trans_json;
var user_info = json.user_info;
var user_detail = json.user_detail
    ,template = require('./templete')
    ,template_get_list = template.template_get_list
    ,template_get_element = template.template_get_element
    ,template_post = template.template_post;

// db 셋팅
//var dbConfig = require('../config/database');
//var mysql = require('mysql');

exports.getUserInfo = function(req,res){

    console.log(req.user.user_id);
    console.log(req.session.passport.user);

    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));
    var query =
        "SELECT u.user_id, nickname, image, self_intro, bookmark_total_cnt, " +
        "(case when u.user_id = p.user_id then be_message_cnt else do_message_cnt end) unread_msg_cnt, " +
        "like_total_cnt, sad_total_cnt FROM user u JOIN message m ON u.user_id = m.to_user_id " +
        "JOIN ( select * " +
        "from trade " +
        "where current_status = 0 " +
        ") t ON t.trade_id = m.trade_id " +
        "join post p on p.post_id = t.post_id " +
        "WHERE u.user_id = 4 " +
        "GROUP BY u.user_id ";

    template_get_element(
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
        [user_id]
    );

};

//페이스북 계정 정보
exports.getAccountSettings = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("존재하지 않는 사용자 입니다.",0));

    var query =
        "SELECT user_id, nickname, image, self_intro, name, phone, address, push_settings " +
        "FROM user " +
        "WHERE user_id = ?";


    template_get_element(
      req,res,
      query,
      [user_id],
      user_detail
    );

};

exports.updateAccountSettings = function(req,res){

    var user_id = JSON.parse(req.params.user_id)  || trans_json("아이디를 입력하지 않았습니다.",0);
    var updated = {};

    if (req.body.nick_name)     updated.nick_name = req.body.nick_name;

    // profile image --> req.files 로 처리!!
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

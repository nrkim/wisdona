/**
 * Created by nrkim on 2014. 8. 6..
 */
var json = require('./json')
    ,template = require('./templete')
    ,trans_json = json.trans_json
    ,news_list = json.news_list
    ,faq_list = json.faq_list
    ,policy = json.policy
    ,book_state = json.book_state
    ,genre_list = json.genre_list
    ,tempate_get = template.template_get
    ,template_post = template.template_post;

exports.getGenreList = function(req,res) {
    tempate_get(
        res,
        "SELECT genre_id, genre FROM genre",
        genre_list
    );
};


exports.getBookConditionList = function(req,res) {
    tempate_get(
        res,
        "SELECT * FROM book_condition",
        book_state
    );
};

exports.getQnaList = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var question = req.body.question || res.json(trans_json("질문을 입력하지 않았습니다.",0));

    template_post(
        res,
        "INSERT INTO qna(question,create_date,user_id) VALUES(?,NOW(),?) ",
        [question,user_id]
    );

};

exports.getServiceTerms = function(req,res){
    tempate_get(
        res,
        "SELECT content FROM service_board WHERE service_board_id =1",
        policy
    );
};

exports.getPrivacy = function(req,res) {
    tempate_get(
        res,
        "SELECT content FROM service_board WHERE service_board_id =2",
        policy
    );
}

exports.getNewsList = function(req,res){
    tempate_get(
        res,
        "SELECT title, content FROM news",
        news_list
    );
};

exports.getFaqList = function(req,res){
    tempate_get(
        res,
        "SELECT question, answer FROM faq",
        faq_list
    );
};

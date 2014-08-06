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
    ,template_get_list = template.template_get_list
    ,template_get_element = template.template_get_element
    ,template_post = template.template_post;

exports.getGenreList = function(req,res) {
    template_get_list(req,res,
        "select genre_id, genre from genre"
        ,null,genre_list);
};


exports.getBookConditionList = function(req,res) {
    template_get_list(req,res,
        "select * from book_condition"
        ,null,book_state);
};

exports.getQnaList = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.",0));
    var question = req.body.question || res.json(trans_json("질문을 입력하지 않았습니다.",0));

    template_post(req,res,
        "insert into qna(question,create_date,user_id) values(?,now(),?) ",
        [question,user_id]
    );
};

exports.getServiceTerms = function(req,res){
    template_get_element(
        req,res,
        "select content from service_board where service_board_id =1",
        null,
        policy
    );
};

exports.getPrivacy = function(req,res) {
    template_get_element(
        req,res,
        "select content from service_board where service_board_id =2",
        null,
        policy
    );
}

exports.getNewsList = function(req,res){
    template_get_list(
        req,res,
        "SELECT title, content FROM news",
        null,
        news_list
    )
};

exports.getFaqList = function(req,res){
    template_get_list(
        req,res,
        "SELECT question, answer FROM faq",
        null,
        faq_list
    )
};

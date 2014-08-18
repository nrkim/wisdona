/**
 * Created by nrkim on 2014. 8. 6..
 */
var json = require('./json')
    ,template = require('./template')
    ,trans_json = json.trans_json
    ,news_list = json.news_list
    ,faq_list = json.faq_list
    ,policy = json.policy
    ,book_state = json.book_state
    ,genre_list = json.genre_list
    ,template_item = template.template_item
    ,template_list = template.template_list;

exports.getGenreList = function(req,res) {
    template_item(
        "SELECT genre_id, genre FROM genre",
        null,
        genre_list,
        function(err,rows,msg){
            if(err) res.json(trans_json(msg,0));
            else res.json(trans_json(msg,1));
        }
    );
};


exports.getBookConditionList = function(req,res) {
    template_list(
        "SELECT * FROM book_condition",
        null,
        book_state,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getQnaList = function(req,res){
    var user_id = req.params.user_id || res.json(trans_json("사용자 아이디를 입력하지 않았습니다.", 0));
    var question = req.body.question || res.json(trans_json("질문을 입력하지 않았습니다.", 0));

    template_item(
        "INSERT INTO qna(question,create_date,user_id) VALUES(?,NOW(),?) ",
        [question, user_id],
        function(err,rows,msg){
            if(err) res.json(trans_json(msg,0));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getServiceTerms = function(req,res){
    template_list(
        "SELECT content FROM service_board WHERE service_board_id =1",
        null,
        policy,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getPrivacy = function(req,res) {
    template_list(
        "SELECT content FROM service_board WHERE service_board_id =2",
        null,
        policy,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getNewsList = function(req,res){
    template_list(
        "SELECT title, content FROM news",
        null,
        news_list,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

exports.getFaqList = function(req,res){
    template_list(
        "SELECT question, answer FROM faq",
        null,
        faq_list,
        function(err,result,msg){
            if(err) res.json(trans_json(msg,0));
            if(result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,1));
        }
    );
};

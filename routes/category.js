/**
 * Created by nrkim on 2014. 7. 29..
 */

var template = require('./template')
    ,template_list = template.template_list
    ,json = require('./json')
    ,category_list = json.category_list
    ,trans_json = json.trans_json;


exports.getCategoryList = function(req,res){
    template_list(
        "select category_id, category from category",
        null,
        category_list,
        function(err,result){
            if(err) {
                res.json(trans_json('카테고리 리스트를 얻는데 실패했습니다.',0));
            } else{
                if(result === 0 ){
                    res.json(trans_json('등록된 카테고리 리스트가 없습니다.',1));
                } else{
                    res.json(trans_json('success',1,result[0]));
                }
            }
        }
    );
};

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
        function(err,result,msg){
            if (err) res.json(trans_json(msg,0));
            if (result) res.json(trans_json(msg,1,result));
            else res.json(trans_json(msg,0));
        }
    );
};

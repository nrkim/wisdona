/**
 * Created by nrkim on 2014. 7. 29..
 */

var template = require('./templete')
    ,template_get = template.template_get
    ,json = require('./json')
    ,category_list = json.category_list;


exports.getCategoryList = function(req,res){
    template_get(req,res,
        "select category_id, category from category"
        ,null,category_list);
};

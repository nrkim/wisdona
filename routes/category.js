/**
 * Created by nrkim on 2014. 7. 29..
 */

exports.getCategoryList = function(req,res){
    var data ={
        "success": 1,
        "message": "success",
        "result": [
            {
                "category_id": 0,
                "category": "문학"
            },
            {
                "category_id": 1,
                "category": "소설"
            }
        ]
    };
    res.json(data);
};

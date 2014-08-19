/**
 * Created by nrkim on 2014. 8. 1..
 */

exports.trans_json = function(message,code,result){

    return { code : code || 0, message : message || '메세지', result : result || null};
};

exports.trans_list = function(message,code,result,total_count){

    console.log('trans list is !!');
    return { code : code || 0, message : message || '메세지', total_count : total_count, list : result || null};
};


exports.user_info = function(item){
    return {
        nick_name          : item.nickname,
        profile_image_url  : item.image,
        self_intro         : item.self_intro,
        bookmark_cnt       : item.bookmark_total_cnt,
        unread_msg_cnt     : item.unread_msg_cnt,
        like_cnt           : item.like_total_cnt,
        sad_cnt            : item.sad_total_cnt
    };
};

exports.review = function(item){
    return {
        user           : {
            user_id          : item.user_id,
            nick_name        : item.nickname,
            profile_image_url: item.book_image_path
        },
        book_name      : item.title,
        comment        : item.comments,
        thumbnail_url  : item.book_image_path,
        post_id        : item.post_id
    };
};

exports.post_list = function(item){
    return {
        post_id         : item.post_id,
        thumbnail_url   : item.book_image_path,
        book_name       : item.title,
        author          : item.author,
        publisher       : item.translator,
        published       : item.publisher,
        publication_date: item.pub_date,
        bookmark_count  : item.bookmark_cnt
    };
};


exports.message_list = function(item){
    return {
        user                : {
            user_id           : item.from_user_id,
            nick_name         : item.nickname,
            profile_image_url : item.image
        },
        trade_id            : item.trade_id,
        book_name           : item.title,
        last_message        : item.message,
        unread_messages_cnt : item.be_message_cnt, // 이거 다시 정해줄 것
        last_update         : item.last_update
    };
};

// 메시지는 가장 최신 메시지를 가져와야하지 않나
exports.message_window = function(item){
    return {
        user        : {
            user_id             : item.user_id,
            nick_name           : item.nickname,
            profile_image_url   : item.image
        },
        message     : item.message,
        create_date : item.create_date
    };
};


exports.user_detail = function(item){
    return {
        user_id              : item.user_id,
        nick_name            : item.nickname,
        profile_image_url    : item.image,
        self_intro           : item.self_intro,
        name                 : item.name,
        phone                : item.phone,
        address              : item.address,
        push_settings        : item.push_settings,
        email_authentication : item.email_auth,
        sanction_date        : item.sanction_date
    };
};


exports.news_list = function(item){
    return {
        title   : item.title,
        content : item.content
    };
};

exports.faq_list = function(item){
    return  {
        title   : item.question,
        content : item.answer
    };
};

exports.policy = function(item){
    return {
        content : item.content
    };
};

exports.book_state = function(rows,i){
    return {
        book_condition_id: item.book_condition_id,
        book_condition   : item.condition_name
    };
};

exports.genre_list = function(item){
    return   {
        genre_id : item.genre_id,
        genre    : item.genre
    };
};

exports.category_list = function(item){
    return {
        category_id : item.category_id,
        category    : item.category
    }
};

exports.unread_msg_lst = function(item){
    return {
        trade_id    : item.trade_id,
        message     : item.message,
        create_date : item.create_date,
        user        : {
            user_id           : item.user_id,
            nick_name         : item.nickname,
            profile_image_url : item.image
        }
    };
};

exports.create_user = function(item){
    return { user_id : item }
}
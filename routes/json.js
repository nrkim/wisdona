/**
 * Created by nrkim on 2014. 8. 1..
 */

exports.trans_json = function(message,code,result){

    return { code : code || 0, message : message || '메세지', result : result || null};
}

exports.user_info = function(rows,i){
    return {
        nick_name          : rows[i].nickname,
        profile_image_url  : rows[i].image,
        self_intro         : rows[i].self_intro,
        bookmark_cnt       : rows[i].bookmark_total_cnt,
        unread_msg_cnt     : rows[i].unread_msg_cnt,
        like_cnt           : rows[i].like_total_cnt,
        sad_cnt            : rows[i].sad_total_cnt
    };
}

exports.review = function(rows,i){
    return {
        user           : {
            user_id          : rows[i].user_id,
            nick_name        : rows[i].nickname,
            profile_image_url: rows[i].book_image_path
        },
        book_name      : rows[i].title,
        comment        : rows[i].comments,
        thumbnail_url  : rows[i].book_image_path,
        post_id        : rows[i].post_id
    };
}

exports.post_list = function(rows,i){
    return {
        post_id         : rows[i].post_id,
        thumbnail_url   : rows[i].book_image_path,
        book_name       : rows[i].title,
        author          : rows[i].author,
        publisher       : rows[i].translator,
        published       : rows[i].publisher,
        publication_date: rows[i].pub_date,
        bookmark_count  : rows[i].bookmark_cnt,
        current_status  : rows[i].condition_name
    };
}


exports.message_list = function(rows,i){
    return {
        user                : {
            user_id           : rows[i].from_user_id,
            nick_name         : rows[i].nickname,
            profile_image_url : rows[i].image
        },
        trade_id            : rows[i].trade_id,
        book_name           : rows[i].title,
        last_message        : rows[i].message,
        unread_messages_cnt : rows[i].be_message_cnt, // 이거 다시 정해줄 것
        last_update         : rows[i].last_update
    };
}

exports.message_window = function(rows,i){
    return {
        user        : {
            user_id             : rows[i].user_id,
            nick_name           : rows[i].nickname,
            profile_image_url   : rows[i].image
        },
        message     : rows[i].message,
        create_date : rows[i].create_date
    }
}


exports.user_detail = function(rows,i){
    return {
        user_id           : rows[i].user_id,
        nick_name         : rows[i].nickname,
        profile_image_url : rows[i].image,
        self_intro        : rows[i].self_intro,
        name              : rows[i].name,
        phone             : rows[i].phone,
        address           : rows[i].address,
        push_settings     : rows[i].push_settings
    }
}


exports.news_list = function(rows,i){
    return {
        title   : rows[i].title,
        content : rows[i].content
    }
}

exports.faq_list = function(rows,i){
    return  {
        title : rows[i].question,
        content : rows[i].answer
    }
}

exports.policy = function(rows,i){
    return {
        content : rows[i].content
    }
}

exports.book_state = function(rows,i){
    return {
        book_condition_id: rows[i].book_condition_id,
        book_condition   : rows[i].condition_name
    }
}

exports.genre_list = function(rows,i){
    return   {
        genre_id : rows[i].genre_id,
        genre    : rows[i].genre
    }
}
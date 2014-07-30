/* GET users listing. */

exports.getUserPostList = function(req,res){
    var data =
    res.json(data);
};

exports.getReviewList = function(req,res){
    var data = {
        "success": 1,
        "message": "success",
        "result": [
            {
                "user": {
                    "user_id": 123,
                    "nick_name": "수지",
                    "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
                },
                "book_name": "책 제목",
                "comment": "평가 내용",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "post_id": 5
            },
            {
                "user": {
                    "user_id": 123,
                    "nick_name": "수지",
                    "profile_image_url": "http: //wisdona.com/images/user/profile/123.jpg"
                },
                "book_name": "책제목",
                "comment": "평가내용",
                "thumbnail_url": "http: //wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "post_id": 5
            },
            {
                "user": {
                    "user_id": "104",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/abscdj.jpg"
                },
                "book_name": "해리포터 마법사의 돌",
                "comment": "좋아요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/1231239.jpg",
                "post_id": 125
            },
            {
                "user": {
                    "user_id": "104",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/dkfj223fj.jpg"
                },
                "author": "전문가를 위한 자바스크립트 그 한계를 넘어서",
                "comment": "거의 새거에요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/erwerqwelrke.jpg",
                "post_id": 130
            },
            {
                "user": {
                    "user_id": "104",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/abscdj.jpg"
                },
                "book_name": "총,균,쇠",
                "comment": "좋아요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/2293949.jpg",
                "post_id": 131
            },
            {
                "user": {
                    "user_id": "101",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/abscdj.jpg"
                },
                "book_name": "해리포터 불사조 기사단. 1",
                "comment": "좋아요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "post_id": 125
            },
            {
                "user": {
                    "user_id": "101",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/dkfj223fj.jpg"
                },
                "book_name": "자기 앞의 생",
                "comment": "책 내용이 넘 슬퍼",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4326273.jpg",
                "post_id": 129
            },
            {
                "user": {
                    "user_id": "101",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/abscdj.jpg"
                },
                "book_name": "그곳을 다시 잊어야 했다",
                "comment": "상태는 별로인데 내용은 좋아요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/99384929.jpg",
                "post_id": 132
            },
            {
                "user": {
                    "user_id": "100",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/abscdj.jpg"
                },
                "book_name": "해리포터 불사조 기사단. 1",
                "comment": "좋아요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "post_id": 125
            },
            {
                "user": {
                    "user_id": "100",
                    "nick_name" : "수지",
                    "profile_image_url" : "http://wisdona.com/images/user/profile/dkfj223fj.jpg"
                },
                "book_name": "자기 앞의 생",
                "comment": "책 내용이 넘 슬퍼요",
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4326273.jpg",
                "post_id": 129
            }

        ]
    };

    res.json(data);
};
exports.getRequestPostList = function(req,res){
    var data = {
        "success": 1,
        "message": "success",
        "result": [
            {
                "post_id": 125,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "book_name": "해리포터 불사조 기사단. 1",
                "author": "조앤K.롤링",
                "publisher": "최인자",
                "published": "문학수첩리틀북스",
                "publication_date": "2005년11월",
                "bookmark_count": 1,
                "current_status": "0"
            },
            {
                "post_id": 126,
                "thumbnail_url": "http: //wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "book_name": "해리포터마법사의돌",
                "author": "조앤K.롤링",
                "publisher": "최인자",
                "published": "문학수첩리틀북스",
                "publication_date": "2005년11월",
                "bookmark_count": 1,
                "current_status": "1"
            },
            {
                "post_id": 127,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/kjwlkejrk.jpg",
                "book_name": "그 많던 싱아는 누가 다 먹었을까",
                "author": "박완서",
                "publisher": "박인",
                "published": "웅진닷컴",
                "publication_date": "2005년 9월",
                "bookmark_count": 1,
                "current_status": 0
            },
            {
                "post_id": 128,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/98182374.jpg",
                "book_name": "인생의 베일",
                "author": "서머싯 몸",
                "publisher": "황소연",
                "published": "민음사",
                "publication_date": "2007년 2월",
                "bookmark_count": 1,
                "current_status": 3
            },
            {
                "post_id": 129,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4326273.jpg",
                "book_name": "자기 앞의 생",
                "author": "에밀 아자르",
                "publisher": "용경식",
                "published": "문학동네",
                "publication_date": "2003년 5월",
                "bookmark_count": 1,
                "current_status": 2
            },
            {
                "post_id": 130,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/erwerqwelrke.jpg",
                "book_name": "",
                "author": "전문가를 위한 자바스크립트 그 한계를 넘어서",
                "publisher": "존 라쉬",
                "published": "양정열,이지은",
                "publication_date": "2014년 8월",
                "bookmark_count": 2,
                "current_status": 4
            },
            {
                "post_id": 131,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/2293949.jpg",
                "book_name": "총,균,쇠",
                "author": "제레미 다이아몬드",
                "publisher": "김진준",
                "published": "문학사상",
                "publication_date": "2005년 12월",
                "bookmark_count": 2,
                "current_status": 4
            },
            {
                "post_id": 132,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/99384929.jpg",
                "book_name": "그곳을 다시 잊어야 했다",
                "author": "이청준",
                "publisher": "이청준",
                "published": "열림원",
                "publication_date": "2007년 11월",
                "bookmark_count": 1,
                "current_status": 3
            },
            {
                "post_id": 133,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                "book_name": "아프니까 청춘이다",
                "author": "김난도",
                "publisher": "최인자",
                "published": "문학수첩리틀북스",
                "publication_date": "2005년 11월",
                "bookmark_count": 1,
                "current_status": 0
            },
            {
                "post_id": 126,
                "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/1231239.jpg",
                "book_name": "해리포터 마법사의 돌",
                "author": "조앤 K. 롤링",
                "publisher": "최인자",
                "published": "문학수첩리틀북스",
                "publication_date": "2005년 11월",
                "bookmark_count": 1,
                "current_status": 1
            }
        ]
    };

    res.json(data);

};


/**
 * Created by nrkim on 2014. 7. 29..
 */
exports.createPost = function(req,res){

    var data = {
            "code": 1,
            "message": "success",
            "result" : null
        };
    res.json(data);
};

exports.updatePost = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.destroyPost = function(req,res){
    var data = {
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
};

exports.getPostDetail = function(req,res){
    var data = {
        "success": 1,
        "message": "success",
        "result": {
            "user": {
                "user_id": 123,
                "nick_name": "수지",
                "profile_image_url": "http://wisdona.com/images/user/profile/123.jpg"
            },
            "post": {
                "comment": "해리포터 영화 재미있게 보신 분들은 소설로 보시면 더 재미있을 거 같네요. 책 상태도 깨끗하게 읽어서 상태 좋습니다. 책갈피 1개에 기부합니다",
                "bookmark_count": 1,
                "book_images_url": [
                    "http://wisdona.com/images/posts/images/4943814231.jpg",
                    "http://wisdona.com/images/posts/images/4943814232.jpg",
                    "http://wisdona.com/images/posts/images/4943814233.jpg",
                    "http://wisdona.com/images/posts/images/4943814234.jpg"
                ],
                "book_condition": "새것같음",
                "is_certificate": true,
                "create_date": "2014-07-27 14:25",
                "book": {
                    "book_name": "해리포터 불사조 기사단. 1",
                    "author": "조앤 K. 롤링",
                    "publisher": "최인자",
                    "published": "문학수첩리틀북스",
                    "publication_date": "2005년 11월",
                    "genre": "소설"
                },
                "trade": {
                    "current_status": 0,
                    "beneficiary": {
                        "user_id": 456,
                        "nick_name": "수현",
                        "profile_image_url": "http://wisdona.com/images/user/profile/456.jpg"
                    }
                }
            }
        }
    };
    res.json(data);
};

exports.getPostList = function(req,res){
    var data = {
        "success": 1,
        "message": "success",
        "result": {
            "total_count": 12,
            "results": [
                {
                    "post_id": 125,
                    "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                    "book_name": "해리포터 불사조 기사단. 1",
                    "author": "조앤 K. 롤링",
                    "publisher": "최인자",
                    "published": "문학수첩리틀북스",
                    "publication_date": "2005년 11월",
                    "bookmark_count": 1,
                    "current_status": 0
                },
                {
                    "post_id": 126,
                    "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                    "book_name": "해리포터 마법사의 돌",
                    "author": "조앤 K. 롤링",
                    "publisher": "최인자",
                    "published": "문학수첩리틀북스",
                    "publication_date": "2005년 11월",
                    "bookmark_count": 1,
                    "current_status": 1
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
                    "post_id": 125,
                    "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                    "book_name": "해리포터 불사조 기사단. 1",
                    "author": "조앤 K. 롤링",
                    "publisher": "최인자",
                    "published": "문학수첩리틀북스",
                    "publication_date": "2005년 11월",
                    "bookmark_count": 1,
                    "current_status": 0
                },
                {
                    "post_id": 126,
                    "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                    "book_name": "해리포터 마법사의 돌",
                    "author": "조앤 K. 롤링",
                    "publisher": "최인자",
                    "published": "문학수첩리틀북스",
                    "publication_date": "2005년 11월",
                    "bookmark_count": 1,
                    "current_status": 1
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
                }
            ]
        }
    };
    res.json(data);
}
//20개 보내기
exports.searchPosts = function(req,res){
    var data={
            "success": 1,
            "message": "success",
            "result": {
                "total_count": 12,
                "results": [
                    {
                        "post_id": 125,
                        "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                        "book_name": "해리포터 불사조 기사단. 1",
                        "author": "조앤 K. 롤링",
                        "publisher": "최인자",
                        "published": "문학수첩리틀북스",
                        "publication_date": "2005년 11월",
                        "bookmark_count": 1,
                        "current_status": 0
                    },
                    {
                        "post_id": 126,
                        "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                        "book_name": "해리포터 마법사의 돌",
                        "author": "조앤 K. 롤링",
                        "publisher": "최인자",
                        "published": "문학수첩리틀북스",
                        "publication_date": "2005년 11월",
                        "bookmark_count": 1,
                        "current_status": 1
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
                        "post_id": 125,
                        "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                        "book_name": "해리포터 불사조 기사단. 1",
                        "author": "조앤 K. 롤링",
                        "publisher": "최인자",
                        "published": "문학수첩리틀북스",
                        "publication_date": "2005년 11월",
                        "bookmark_count": 1,
                        "current_status": 0
                    },
                    {
                        "post_id": 126,
                        "thumbnail_url": "http://wisdona.com/images/posts/thumbnails/4943814231.jpg",
                        "book_name": "해리포터 마법사의 돌",
                        "author": "조앤 K. 롤링",
                        "publisher": "최인자",
                        "published": "문학수첩리틀북스",
                        "publication_date": "2005년 11월",
                        "bookmark_count": 1,
                        "current_status": 1
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
                    }
                ]
            }
        };
    res.json(data);
}
exports.reportPost = function(req,res){
    var data={
        "code": 1,
        "message": "success",
        "result" : null
    };
    res.json(data);
}
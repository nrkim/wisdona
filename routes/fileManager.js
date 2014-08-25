/**
 * Created by onami on 2014. 7. 29..
 * email : nicekon@gmail.com
 */

var fs = require('fs'),
    async = require('async'),
    path = require('path'),
    im = require('imagemagick'),
    fstools = require('fs-tools'),
    s3AuthConfig = require('../config/s3_auth'),
    logger = require('../config/logger'),
    knox = require('knox'),
    mime = require('mime');

var baseImageDir = __dirname + '/../images/';


// s3 config
var s3 = knox.createClient({
    key: s3AuthConfig.s3Auth.key,
    secret: s3AuthConfig.s3Auth.secret,
    region: s3AuthConfig.s3Auth.region,
    bucket: s3AuthConfig.s3Auth.bucket
});


function getPath(fileName){
    var dir;
    if ( fileName.indexOf("o_") != -1){
        dir = "original/";
    }else if(fileName.indexOf("l_") != -1) {
        dir = "large/";
    }else if(fileName.indexOf("t_") != -1){
        dir = "thumbs/";
    }else if(fileName.indexOf("op_") != -1){
        dir = "profile/original/";
    }else if(fileName.indexOf("lp_") != -1){
        dir = "profile/large/";
    }else{
        dir = "profile/thumbs/";
    }
    return dir;
}


function saveImage(tempImage, pathArr, largeWidth, thumbWidth, callback ) {
    process.nextTick(function() {
        logger.debug('imageFile : ', {path: tempImage.path, size: tempImage.size});
        if (tempImage.size) {

            var originalDir = pathArr[0];
            var largeDir = pathArr[1];
            var thumbDir = pathArr[2];

            // 파일 이동
            var originalPath = path.normalize(baseImageDir + originalDir);
            var largePath = path.normalize(baseImageDir + largeDir);
            var thumbPath = path.normalize(baseImageDir + thumbDir);

            fstools.move(tempImage.path, originalPath, function (err) {
                if (err) {
                    callback(err);
                } else {

                    async.series([
                            function (cb) {
                                im.resize({
                                        srcPath: originalPath,
                                        dstPath: largePath,
                                        width: largeWidth
                                    }, function (err, stdout, stderr) {
                                        if (err) {
                                            cb(err);
                                        } else
                                            cb();
                                    }
                                );
                            },
                            function (cb) {
                                im.resize({
                                    srcPath: largePath,
                                    dstPath: thumbPath,
                                    width: thumbWidth
                                }, function (err, stdout, stderr) {
                                    if (err) {
                                        cb(err);
                                    } else {
                                        cb();
                                    }
                                });
                            }],
                        function (err, results) {
                            if (err) {
                                callback(err);
                            } else {
                                // 경로 저장
                                var uploadPath = {
                                    originalPath: originalPath,
                                    largePath: largePath,
                                    thumbPath: thumbPath
                                };

                                // S3 저장 및 temp 이미지 삭제
                                var count = 0;
                                async.each([originalDir, largeDir, thumbDir],
                                    function (fileDir, cb2) {
                                        fs.stat(path.normalize(baseImageDir + fileDir), function (err, stats) {

                                            var headers = {
                                                'Content-Length': stats.size,
                                                'Content-Type': mime.lookup(fileDir),
                                                'x-amz-acl': 'public-read'
                                            };
                                            var rs = fs.createReadStream(baseImageDir + fileDir);
                                            s3.putStream(rs, fileDir, headers, function(err, rs) {
                                                if (err) {
                                                    cb2(err);
                                                } else {
                                                    logger.debug('s3 저장 완료', fileDir);

                                                    fstools.remove(baseImageDir + fileDir, function (err) {
                                                        logger.debug('이미지 삭제', fileDir);
                                                        count++;
                                                        if ( count == 3 ){
                                                            callback(null, uploadPath);
                                                        }
                                                        cb2();
                                                    });
                                                };
                                            });
                                        });
                                    }
                                );
                            }
                        }
                    )
                }
            })
        } else {
            fstools.remove(image.path, function (err) {
                if (err) {
                    callback(err);

                    logger.error('서버 이미지 저장 error : ', err.message);
                    logger.error('/---------------------------------------- end -----------------------------------------/');
                } else {
                    callback();
                }
            });
        }
    });
};

// 웹 서버에 기존 이미지 삭제
function deleteImage(deletePaths, callback) {
    process.nextTick(function() {

        async.each(deletePaths, function (path, cb) {

            s3.deleteFile(path, function(err, res){
                if (err) cb(err);
                else cb();logger.debug('웹서버 파일 삭제',path);

            });

        }, function (err) {
            if (err) {
                callback(err);

                logger.error('서버 이미지 삭제 error : ', err.message);
                logger.error('/---------------------------------------- end -----------------------------------------/');
            } else {

                callback(null);
            }
        });
    });
};

exports.deletePostImage = function (row, callback){
    var deletePaths = [
        getPath(row.original_image_path) + original_image_path,
        getPath(row.large_image_path) + row.large_image_path,
        getPath(row.thumbnail_path) + row.thumbnail_path
    ];

    deleteImage(deletePaths, function(err){
        if(err) callback(err);
        else callback();
    });
};

exports.deleteProfileImage = function (row, callback){
    var deletePaths = [
            getPath(row.image) + row.image,
            getPath(row.thumb_image) + row.thumb_image
    ];

    deleteImage(deletePaths, function(err){
        if(err) callback(err);
        else callback();
    });
};


// 게시물 이미지 저장
exports.savePostImage = function (tempImage, callback) {
    var fileName = path.basename(tempImage.path);
    var originalDir = "original/" + "o_" + fileName;
    var largeDir = "large/" + "l_" + fileName;
    var thumbDir = "thumbs/" + "t_" + fileName;
    var largeWidth = 720;
    var thumbWidth = 200;

    saveImage(tempImage, [originalDir, largeDir, thumbDir], largeWidth, thumbWidth, function (err, uploadPath) {
        if (err) callback(err);
        else callback(null, uploadPath);
    });
};

// 프로필 이미지 저장
exports.saveProfileImage = function (tempImage, callback) {
    var fileName = path.basename(tempImage.path);
    var originalDir = "profile/original/" + "op_" + fileName;
    var largeDir = "profile/large/" + "lp_" + fileName;
    var thumbDir = "profile/thumbs/" + "tp_" + fileName;
    var largeWidth = 230;
    var thumbWidth = 80;

    saveImage(tempImage, [originalDir, largeDir, thumbDir], largeWidth, thumbWidth, function (err, uploadPath) {
        if (err) callback(err);
        else callback(null, uploadPath);
    });
};

// 이미지 출력
exports.getImage = function(req, res) {

    // 파일 패스 설정
    var dir = getPath(req.params.imagepath);
    var mimeType = mime.lookup(req.params.imagepath);

    logger.debug('//// ', dir + req.params.imagepath );

    s3.getFile(dir + req.params.imagepath, function(err, rs) {
        if (err) {
            res.json({ error: err });
        } else {
            res.statusCode = 200;
            res.set('Content-Type', mimeType);
            rs.pipe(res);
        }
    });
};
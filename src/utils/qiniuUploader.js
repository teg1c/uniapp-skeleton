// created by gpake
import tip from './tips';

(function() {

    let config = {
        qiniuUploadURL: '',
        qiniuImageURLPrefix: '',
        qiniuUploadToken: '',
        qiniuUploadTokenURL: '',
        qiniuUploadTokenFunction: null
    };

    module.exports = {
        init,
        upload
    };

    // 在整个程序生命周期中，只需要 init 一次即可
    // 如果需要变更参数，再调用 init 即可
    function init(options) {
        config = {
            qiniuUploadURL: '',
            qiniuImageURLPrefix: '',
            qiniuUploadToken: '',
            qiniuUploadTokenURL: '',
            qiniuUploadTokenFunction: null
        };
        updateConfigWithOptions(options);
    }

    function updateConfigWithOptions(options) {
        if (options.uploadURL) {
            config.qiniuUploadURL = options.uploadURL;
        } else {
            console.error('qiniu uploader need uploadURL');
        }
        if (options.uptoken) {
            config.qiniuUploadToken = options.uptoken;
        } else if (options.uptokenURL) {
            config.qiniuUploadTokenURL = options.uptokenURL;
        } else if (options.uptokenFunc) {
            config.qiniuUploadTokenFunction = options.uptokenFunc;
        }
        if (options.domain) {
            config.qiniuImageURLPrefix = options.domain;
        }
    }

    function upload(filePath, success, fail, options) {
        if (!filePath) {
            console.error('qiniu uploader need filePath to upload');
            return;
        }
        if (options) {
            init(options);
        }
        if (config.qiniuUploadToken) {
            return doUpload(filePath, success, fail, options);
        } if (config.qiniuUploadTokenURL) {
            let uploadTask = null;
            getQiniuToken(() => {
                uploadTask = doUpload(filePath, success, fail, options);
            });
            return uploadTask;
        } if (config.qiniuUploadTokenFunction) {
            config.qiniuUploadToken = config.qiniuUploadTokenFunction();
        } else {
            console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
            return false;
        }
    }

    function doUpload(filePath, success, fail, options) {
        const url = config.qiniuUploadURL;
        let fileName = filePath.split('//')[1];
        if (options && options.key) {
            fileName = options.key;
        }
        const formData = {
            token: config.qiniuUploadToken,
            key: fileName
        };
        return uni.uploadFile({
            url,
            filePath,
            name: 'file',
            formData,
            success (res) {
                const dataString = res.data;
                const dataObject = Object.prototype.toString.call(dataString) === '[object Object]'
                    || Object.prototype.toString.call(dataString) === '[object Array]' ? dataString : JSON.parse(dataString);
                // do something
                if (Math.floor(dataObject.code) !== 0) {
                    tip.toast(dataObject.message, '', 'none');
                    return fail(dataObject.message);
                }
                dataObject.imageURL = dataObject.data.url;
                success(dataObject);
            },
            fail (error) {
                fail(error);
            }
        });
    }

    function getQiniuToken(callback) {
        uni.request({
            url: config.qiniuUploadTokenURL,
            success (res) {
                const token = res.data.uptoken;
                config.qiniuUploadToken = token;
                if (callback) {
                    callback();
                }
            },
            fail (error) {
                console.error(error);
            }
        });
    }

}());

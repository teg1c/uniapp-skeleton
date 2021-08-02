import { tip } from './tips';
import qiniuUpload from './qiniuUploader';
import CryptoJS from './http/crypto-js/index';

const qiniu = {
    tokenUrl: 'https://file.huanjutang.com/qiniu/token',
    transcoderUrl: 'https://file.huanjutang.com/qiniu/video-transcoding'
};

function isFunction(obj) {
    return typeof obj === 'function';
}

export function chooseImageSync(opts) {
    return new Promise((resolve, reject) => {
        const opt = {
            num: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            maxSize: 20000000,
            fail() {
                uni.showModal({
                    title: '提示',
                    content: `上传图片不能大于${opt.maxSize / 1000000}M!`, // 标题
                    showCancel: false
                });
            },
            ...opts
        };
        uni.chooseImage({
            count: opt.num,
            sizeType: opt.sizeType,
            sourceType: opt.sourceType,
            success(res) {
                for (const item of res.tempFiles) {
                    if (item.size <= opt.maxSize) { // 图片小于或者等于20M时 可以执行获取图片
                        resolve(res);
                    } else { // 图片大于20M，弹出一个提示框
                        opt.fail();
                        reject(new Error('max size'));
                    }
                }
            },
            fail(err) {
                reject(err);
            },
            complete() {}
        });
    });
}

/**
 * 同步视频选择函数，默认会压缩视频
 * @param opts
 * @return {Promise<any>}
 */
export function chooseVideoSync(opts) {
    return new Promise((resolve, reject) => {
        const opt = {
            sourceType: ['album', 'camera'],
            maxDuration: 30,
            camera: 'back',
            ...opts
        };
        uni.chooseVideo({
            sourceType: opt.sourceType,
            maxDuration: opt.maxDuration,
            camera: opt.camera,
            success(res) {
                resolve(res);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

export function uploadFileSync(file, progressFunc) {
    return new Promise(((resolve, reject) => {
        tip.loading('上传中');

        const fileExt = getFileExt(file);
        getQiniuToken(fileExt)
            .then(uptokenRes => {
                const uptokenData = uptokenRes.data;
                const opts = {
                    uptoken: uptokenData.token,
                    uploadURL: uptokenData.upload_url,
                    domain: uptokenData.domain,
                    key: uptokenData.key
                };
                const uploadTask = qiniuUpload.upload(file, success, error, opts);
                uploadTask.onProgressUpdate((res) => {
                    progressFunc && isFunction(progressFunc) && progressFunc(res);
                });
            })
            .catch(error);

        function success(res) {
            tip.loaded();
            if (!res || !res.key) {
                reject(new Error('upload Error'));
            } else {
                resolve({
                    statusCode: 200,
                    data: {
                        status: 0,
                        data: {
                            url: res.imageURL
                        }
                    }
                });
            }
        }
        function error(err) {
            tip.loaded();
            reject(err);
        }
    }));
}

/**
 * 视频上传接口
 * @param file 视频文件
 */
export function uploadVideoSync(file, progressFunc) {
    return new Promise((resolve, reject) => {
        uploadFileSync(file, progressFunc)
            .then(res => {
                if (res.data && res.data.data) {
                    videoTranscoder(res.data.data.url);
                    resolve(res.data.data.url);
                }
            })
            .catch(reject);
    });
}

// 获取文件后缀
function getFileExt(file) {
    if (!file) {
        throw new Error('file is undefined');
    }

    const result = file.match(/\.[A-z0-9]+$/);

    return (result && result[0]) || '.jpg';
}

function createAuthHeaders() {
    const apiAppid = 'b70482a9c35b';
    const apiSecret = '26148d621ef74844918af182d63976b6';
    const apiSalt = Date.now();
    const now = Date.now();

    return {
        'api-appid': apiAppid,
        'api-timestamp': now,
        'api-salt': apiSalt,
        'api-token': CryptoJS.MD5(`${apiAppid}${apiSecret}${now}${apiSalt}`).toString()
        // 'api-token': md5.hex_md5(`${apiAppid}${apiSecret}${now}${apiSalt}`)
    };
}

/**
 * 视频转码（任意格式 => h.254）
 * @param filename 七牛云上完整文件名
 * TODO::考虑到视频转码是异步行为，所以这一版暂时不错成功失败验证
 */
function videoTranscoder(filename) {
    uni.request({
        url: qiniu.transcoderUrl,
        method: 'GET',
        header: createAuthHeaders(),
        data: {
            filename
        },
        success() {
            // TODO::转码成功
        },
        fail() {
            // TODO::转码失败
        }
    });
}

function getQiniuToken(ext) {
    return new Promise((resolve, reject) => {
        uni.request({
            url: qiniu.tokenUrl,
            method: 'GET',
            header: createAuthHeaders(),
            data: {
                ext
            },
            success(res) {
                if (Math.floor(res.data.code) === 0) {
                    resolve(res.data);
                } else {
                    reject(res.data.message);
                }
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

export function compressImageSync(file, quality = 80) {
    return new Promise((resolve, reject) => {
        if (!uni.compressImage) return resolve(file);
        uni.compressImage({
            src: file,
            quality,
            success(res) {
                resolve(res.tempFilePath);
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

export default {
    chooseImageSync,
    chooseVideoSync,
    uploadFileSync,
    compressImageSync,
    uploadVideoSync
};

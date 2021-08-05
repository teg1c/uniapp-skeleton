import URI from 'urijs';
// eslint-disable-next-line import/no-cycle
import store from '@/store';
import config from '@/config';
import session from './session';

import login from './login';
import {
    SUCCESS, SESSION_TIMEOUT, LOGIN_ERROR, SYSTEM_ERROR
} from './code';

// 单例弹窗
const errorModal = (() => {
    let show = false;
    return (content) => {
        if (!show) {
            uni.showModal({
                content,
                showCancel: false,
                complete: () => {
                    show = false;
                }
            });
            show = true;
        }
    };
})();

const tipModal = (() => {
    let show = false;
    return (content) => {
        if (!show) {
            uni.showToast({
                title: content,
                icon: 'none',
                duration: 2000,
                complete() {
                    show = false;
                }
            });

            show = true;
        }
    };
})();

const doRequestWithLogin = (() => {
    const queue = [];
    let lock = false;

    return (fn) => {
        queue.push(fn);
        if (lock === false){
            lock = true;
            console.log('开始登录')
            login().finally(() => {
                    console.log('登录完成')
                    while (queue.length) {
                        const callback = queue.pop();
                        callback();
                    }
                    lock = false;
                });
        }

    };
})();

let retryCount = 0;
function doRequest({
    url, method, params = {}, data = {}, header = {}, onSuccess, onFail
}) {
    const cityID = store.getters['city/currentCity'].city_id;
    const shareCityID = store.getters['city/shareCity'].city_id;
    params.city_id = cityID;
    params.share_city_id = shareCityID;
    const token = session.get();
    if (!token) {
        onFail('token is undefined');
        return;
    }

    const version = config.VERSION;
    const scene =  '';

    // eslint-disable-next-line dot-notation
    header['Authorization'] = `bearer ${token}`;
    header['App-Version'] = version;
    // eslint-disable-next-line dot-notation


    const urlObj = new URI(`${config.HOST_URL}${url}`);
    Object.keys(params).forEach(key => {
        urlObj.setSearch(key, params[key]);
    });

    const options = {
        url: urlObj.toString(),
        method,
        data,
        header,
        success(response) {
            if (response.statusCode === 200 && response.data) {
                let result = response.data;

                switch (result.code) {
                case SUCCESS:
                    onSuccess(result);
                    retryCount = 0;
                    break;
                case SESSION_TIMEOUT:
                    // 如果是刷新接口返回401那么就直接结束
                    if (options.url.indexOf('/refresh') > -1) {
                        onFail('token刷新失败');
                    } else {
                        // eslint-disable-next-line no-use-before-define
                        refreshToken()
                            .then(res => {
                                if (res.code === 200) {
                                    const newToken = res.data;
                                    session.set(newToken.access_token);
                                    store.dispatch('user/getUserInfo').finally(() => {
                                        doRequest({
                                            url, method, params, data, header, onSuccess, onFail
                                        });
                                    });
                                } else {
                                    onFail(new Error('token刷新失败'));
                                }
                            });
                    }
                    break;
                case LOGIN_ERROR:
                    // 如果递归次数超过50次，即刻结束
                    if (retryCount > 50) {
                        onFail(new Error('错误请求次数超限'));
                    } else {
                        doRequestWithLogin(doRequest.bind(this, {
                            url, method, params, data, header, onSuccess, onFail
                        }));
                    }
                    break;
                case SYSTEM_ERROR:
                    tipModal('服务器开小差了\n稍后再试吧');
                    onFail(new Error('服务器开小差了\n稍后再试吧'));
                    break;
                default:
                    if (result.code == 400) {
                        if (result.msg) {
                            errorModal(result.msg);
                        }

                        onSuccess(result);
                    } else {
                        onFail(new Error('code is not support'));
                    }
                }
            } else {
                onFail(new Error('response statusCode not equal 200'));
            }
        },
        fail(err) {
            onFail(err);
        }
    };

    uni.request(options);
}

const request = ({
    url, method, params = {}, data = {}, header = {}
}) => new Promise(resolve => {
    header["content-type"] = "application/json";
    // debugger;
    const token = session.get();
    const options = {
        url,
        method,
        params,
        data,
        header,
        onSuccess(response) {
            resolve(response);
        },
        onFail(err) {
            // eslint-disable-next-line no-console
            console.error(err);
            resolve({});
        }
    };

    if (!token) {
        doRequestWithLogin(doRequest.bind(this, options));
    } else {
        doRequest(options);
    }
});

function get(url, data) {
    return request({
        url,
        method: 'GET',
        params: data
    });
}

function post(url, data) {
    return request({
        url,
        method: 'POST',
        data
    });
}

function put(url, data) {
    return request({
        url,
        method: 'PUT',
        data
    });
}

function deleteRequest(url, data) {
    return request({
        url,
        method: 'DELETE',
        data
    });
}

function refreshToken() {
    return get('/user/refresh');
}

export default {
    get,
    post,
    put,
    deleteRequest
};

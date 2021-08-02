/**
 * webview工具函数
 * @author <邓六石>
 * @date 2021-07-21
 */
import URI from 'urijs';
import api from '@/api/api';
import session from '@/utils/http/session';
import store from '@/store/index';

function absURL(url) {
    if (typeof url !== 'string' || url === '') {
        return '';
    }

    url = url.trim();

    const host = process.env.VUE_APP_WEBVIEW_HOST;
    const absPath = url[0] === '/' ? '' : '/';

    if (url.indexOf('http') === -1) {
        return `${host}${absPath}${url}`;
    }

    return url;
}

// webview用户hook（如果需要在）
async function webviewUserHook() {
    await api.global.checkAuth();
}

// 设置webview授权
function setWebviewAuth(src) {
    const urlObj = new URI(absURL(src));
    urlObj.setSearch('_ACCESS_TOKEN_', session.get());
    urlObj.setSearch('_CITY_ID_', store.getters['city/currentCity'].city_id);
    return urlObj.toString();
}

// 生成webview地址
function createWebview(src, params = {}, appPath = '/subpackages/webview/pages/external/index') {
    const urlObj = new URI(appPath);

    urlObj.setSearch('target', absURL(src));

    Object.keys(params).forEach(key => {
        urlObj.setSearch(key, params[key]);
    });

    return urlObj.toString();
}

/**
 * 生成webview链接
 * @param { string } src 地址
 * @param { object } params 小程序options里需要接收的参数
 * @param { string } appPath 小程序webivew路径
 * @returns { string }
 */
function createWebviewURL(src, params = {}) {
    return createWebview(src, params, '/subpackages/webview/pages/external/index');
}

/**
 * 生成航拍链接
 * @param { string } src 航拍地址
 * @param { number|string } projectId 楼盘ID
 * @returns { string }
 */
function createAerialURL(src, projectId = 0) {
    const params = {
        project_id: projectId
    };
    return createWebview(src, params, '/subpackages/webview/pages/aerial/index');
}

/**
 * 生成VR连接
 * @param { string } src vr链接
 * @param { number|string } projectId 楼盘ID
 * @returns { string }
 */
function createVRURL(src, projectId = 0) {
    const params = {
        project_id: projectId
    };
    return createWebview(src, params, '/subpackages/webview/pages/vr/index');
}

/**
 * 生成文章链接
 * @param { string } src 文章链接
 * @param { number|string } articleId 文章ID
 * @returns { string }
 */
function createArticleURL(src, articleId) {
    const params = {
        article_id: articleId
    };
    return createWebview(src, params, '/subpackages/webview/pages/article/index');
}

export default {
    createWebviewURL,
    createVRURL,
    createAerialURL,
    createArticleURL,
    webviewUserHook,
    setWebviewAuth
};

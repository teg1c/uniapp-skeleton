import webview from '@/utils/webview';
/**
 * 跳转页面
 * wxapp-${appid}://${url} 跳转小程序
 * navigateTo://${url} 普通跳转
 * redirectTo://${url} 重定向
 * switchTab://${url} tabbar 跳转
 * plugin-private://${url} tabbar 跳转
 * @param {String} url
 * @param {Function} cb
 * import { pageJump } from '@/utils/util';
 */
export function pageJump(url, cb = () => {}) {
    if (!url) {
        return;
    }
    const base = ':/';
    const navigateObject = {
        1: (path) => {
            uni.navigateTo({
                url: path,
                complete() {
                    cb();
                }
            });
        },
        2: (path) => {
            uni.switchTab({
                url: path,
                complete() {
                    cb();
                }
            });
        },
        3: (path, appId) => {
            uni.navigateToMiniProgram({
                appId,
                path
            });
        }
    };

    if (url.indexOf(base) === -1) {
        navigateObject[1](url);
        return;
    }

    const protocol = url.split(base)[0];
    const path = url.split(base)[1];

    if (protocol.indexOf('wxapp-') > -1) {
        const appId = protocol.split('wxapp-')[1];
        navigateObject[3](path, appId);
        cb();
    } else if (protocol.indexOf('switchTab') > -1) {
        navigateObject[2](path);
    } else if (protocol.indexOf('plugin-private') > -1) {
        // 直播
        navigateObject[1](`${protocol}:/${path}`);
    } else {
        navigateObject[1](path);
    }
}

// 处理tabbar页面跳转
export function isTabJumpUrl(url) {
    const tabBarPages = ['/pages/index/index', '/pages/me/index'];
    if (tabBarPages.indexOf(url) > -1) {
        uni.switchTab({
            url
        });
    } else {
        uni.navigateTo({
            url
        });
    }
}

// 根据屏幕单位获取rpx
export function transformDeviceUnit(x) {
    const systemInfo = uni.getSystemInfoSync();
    return (x * 750) / systemInfo.windowWidth;
}

// 函数防抖
export function debounce(fn, wait) {
    let timer = null;
    return function callback() {
        const context = this,
            // eslint-disable-next-line prefer-rest-params
            args = arguments;

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            fn.apply(context, args);
        }, wait);
    };
}

function isWebView (path) {
    const webviewPathList = ['/subpackages/webview/pages/external/index', '/subpackages/webview/pages/aerial/index', '/subpackages/webview/pages/article/index', '/subpackages/webview/pages/vr/index'];
    return webviewPathList.some(item => path.startsWith(item));
}

// 获取跳转地址(金刚区、五朵金花、我的页面)
export function loadPath (pageInfo) {
    const pageTypeMap = {
        system: 1,
        'project-list': 2,
        customer: 3,
        config: 4
    };
    const path = pageInfo?.path?.startsWith('/') ? pageInfo.path : `/${pageInfo.path}`;
    switch (pageInfo.type) {
    case pageTypeMap['project-list']: {
        return `${path}?c_id=${pageInfo.collection_id}`;
    }
    case pageTypeMap.system: {
        // webview带token;
        if (isWebView(path)) {
            return webview.setWebviewAuth(path);
        }
        return path;
    }

    default:
        return path;
    }
}
// ui配置中心数据选择器跳转行为封装
export function uiConfigJump (detail) {
    switch (`${detail.data_from}`) {
    // 楼盘合集
    case '1': {
        uni.navigateTo({
            url: `/subpackages/ui-layout/pages/collection?id=${detail.data_uri}`
        });
        break;
    }
    // h5
    case '2': {
        if (detail.data_url) {
            uni.navigateTo({
                url: detail.data_url
            });
        }
        break;
    }
    // 单独楼盘
    case '3': {
        uni.navigateTo({
            url: `/subpackages/project/pages/index?project_id=${detail.data_uri}`
        });
        break;
    }
    // 自定义页面
    case '5': {
        if (detail.data_path) {
            if (isTabJumpUrl(detail.data_path)) {
                uni.switchTab({
                    url: `/${detail.data_path}`
                });
            } else {
                uni.navigateTo({
                    url: `/${detail.data_path}`
                });
            }
        }
        break;
    }
    default:
    }
}

const systemInfo = uni.getSystemInfoSync() || {};
// 判断异性屏
export const isIPhoneX = systemInfo.safeArea && systemInfo.safeArea.top > 30;
// 跳转到静态配置页面
export const jumpStaticPage = (code) => {
    const prefix = process.env.NODE_ENV === 'production' ? 'https://fxt-mobile.huanjutang.com/static-page/' : 'https://staging-fxt-mobile.huanjutang.com/static-page/';
    const path = `${prefix}${code}`;
    const target = webview.createWebviewURL(path);
    console.log(target);
    uni.navigateTo({
        url: target
    });
};
export default {
    pageJump,
    transformDeviceUnit,
    debounce,
    loadPath,
    uiConfigJump,
    isIPhoneX,
    jumpStaticPage
};

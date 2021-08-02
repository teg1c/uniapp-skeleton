const systemInfo = uni.getSystemInfoSync() || {};
// 判断异性屏
export const isIPhoneX = systemInfo.safeArea && systemInfo.safeArea.top > 30;

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
// 函数防抖，会先触发一次
export function debounce2(fn, wait) {
    let timer = null;
    let canDo = true;
    return function callback() {
        const context = this,
            // eslint-disable-next-line prefer-rest-params
            args = arguments;
        if (canDo) {
            fn.apply(context, args);
            canDo = false;
        }
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            canDo = true;
        }, wait);
    };
}

// 函数节流
export function throttle(fn, wait) {
    let timer = null;
    return function callback() {
        const context = this,
            // eslint-disable-next-line prefer-rest-params
            args = arguments;

        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(context, args);
                timer = null;
            }, wait);
        }
    };
}

// 函数节流，会先触发一次
export function throttle2(fn, wait) {
    let last = 0;
    return function callback() {
        const ctx = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        const now = new Date().getTime();
        if (now - last >= wait) {
            fn.apply(ctx, args);
            last = now;
        }
    };
}

// rpx换算为px
export function transformRpx(rpx) {
    const systemInfo = uni.getSystemInfoSync();
    return (rpx / 750) * systemInfo.windowWidth;
}

// 根据屏幕单位获取rpx
export function transformDeviceUnit(x) {
    const systemInfo = uni.getSystemInfoSync();
    return (x * 750) / systemInfo.windowWidth;
}

// 判断是否是函数
export function isFunction(obj) {
    return typeof obj === 'function';
}

// 转为万为单位
export function formatUnitTenThousand(val) {
    let num = val;
    if (num > 999) {
        num += '';
        return `${num.substring(0, num.length - 4) || 0}.${num.substring(num.length - 4, num.length - 3)}万`;
    }
    return num;
}

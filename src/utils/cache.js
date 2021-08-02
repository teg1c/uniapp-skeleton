/**
 * 简单带有效时间前端缓存
 * ps:数据不能大于10M
 * 修复记录：
 * 1、原版本采用超时清空机制，导致超时其他地方获取不到localStorage
 * 更改后采用覆盖机制
 */
const getType = Object.prototype.toString;

const Cache = {
    /**
      * 获取缓存
      * @param key   键
      */
    get(key) {
        const name = this.__encrypt(key),
            data = uni.getStorageSync(name);
        return data.__data;
    },

    /**
      * 设置缓存
      * @param key   键
      * @param value 值
      * @param hours 有效时间
      */
    set(key, value, hours = 1) {
        const name = this.__encrypt(key),
            timeout = new Date().getTime() + hours * 3600 * 1000;
        uni.setStorageSync(name, {
            __timeout: timeout,
            __data: value
        });
    },

    /**
      * 设置自定义超时缓存
      * @param key       键
      * @param value     值
      * @param timeout   过期时间
      */
    setWithTimeout(key, value, timeout) {
        const name = this.__encrypt(key);
        uni.setStorageSync(name, {
            __timeout: timeout,
            __data: value
        });
    },

    /**
      * 清除缓存(空清空所有缓存)
      * @param key
      */
    remove(key) {
        const name = this.__encrypt(key);
        if (arguments.length < 1 || !key) {
            uni.clearStorageSync();
        } else {
            uni.removeStorageSync(name);
        }
    },

    /**
      * @private 加密key
      */
    __encrypt(name) {
        return `cache_${name}`;
    },

    /**
      * @public 验证超时
      */
    checkTimeout(key) {
        let name = this.__encrypt(key),
            data = uni.getStorageSync(name),
            nowTime = new Date().getTime();

        try {
            data = getType.call(data) === '[object Object]' ? data : JSON.parse(data);
        } catch (e) {
            return true;
        }
        if (!data || !data.__data) return true;

        return nowTime > data.__timeout;
    }
};

export const cache = Cache;

export default Cache;

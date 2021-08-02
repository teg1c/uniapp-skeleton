import CryptoJS from './crypto-js/index';
import JSEncrypt from './jsencrypt';

function padEnd(originalStr, targetLength, padString) {
    // eslint-disable-next-line no-bitwise
    targetLength >>= 0;
    padString = typeof padString !== 'undefined' ? padString : '';

    if (originalStr.length > targetLength) {
        return originalStr;
    }

    targetLength -= originalStr.length;

    if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length);
    }

    return `${originalStr}${padString.slice(0, targetLength)}`;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function decryptByAES(ciphertext, key) {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const decrypt = CryptoJS.AES.decrypt(ciphertext, keyHex, {
        mode: CryptoJS.mode.ECB
    });

    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

function decryptPublicKey() {
    // #ifdef H5
    return decryptByAES(process.env.VUE_APP_PUBLIC_KEY, process.env.VUE_APP_H5_APP_ID);
    // #endif

    // #ifdef MP-WEIXIN
    // eslint-disable-next-line no-unreachable
    const { miniProgram: { appId } } = uni.getAccountInfoSync();

    return decryptByAES(process.env.VUE_APP_PUBLIC_KEY, appId.substring(2, 18));
    // #endif
}

function encryptByRSA(data) {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(decryptPublicKey());

    return encrypt.encryptLong(data);
}

// 创建32位加密token
export function createToken(token) {
    return CryptoJS.MD5(token).toString();
}

// 创建16位密码
export function createPassword() {
    return `${Date.now()}${rand(100, 999)}`;
}

// 创建32位sign填充物
export function createSign(query = {}) {
    const queryStr = Object.keys(query)
        .sort()
        .map(key => {
            // 后端php使用urlencode与encodeURIComponent保持一致, 故排除!~*'()
            const unsafeSymbol = /!~*'()/g;
            const value = query[key];

            return `${encodeURIComponent(key)}${encodeURIComponent(typeof value === 'string' ? value.replace(unsafeSymbol, '') : value)}`;
        })
        .join('');

    return CryptoJS.MD5(`${queryStr}${process.env.VUE_APP_SIGN_PADDING}`);
}

// 创建128位随机数
export function createApiSecretSign({
    token, password, sign, version
}) {
    const padStart = `${token}|${password}|${sign}|${version}|`;
    const apiSecretSign = padEnd(padStart, 128, createPassword());

    return encryptByRSA(apiSecretSign);
}

// 解密数据
export function decryptData(password, data) {
    const decryptd = decryptByAES(data, password);

    if (!decryptd || typeof decryptd !== 'string') {
        throw new Error('数据解密失败');
    }

    let result = {};
    try {
        result = JSON.parse(decryptd);
    } catch (e) {
        console.error(e);
    }

    return result;
}

export default {
    createToken,
    createPassword,
    createSign,
    createApiSecretSign,
    decryptData,
    decryptByAES
};

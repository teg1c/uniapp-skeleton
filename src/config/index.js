const VERSION = 'v1.0';
let HOST_URL = "";
process.env.NODE_ENV === 'production' ? HOST_URL = process.env.VUE_APP_API_HOST_PROD : HOST_URL = process.env.VUE_APP_API_HOST_DEV;
let PLATFORM = 'wechat'
// #ifdef  H5
PLATFORM = 'web'
// #endif

export default {
    VERSION,
    HOST_URL,
    PLATFORM
};


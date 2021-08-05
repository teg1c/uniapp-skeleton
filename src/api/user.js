import http from '@/utils/http/index';


const userInfo = params => http.get('/miniapp/user-info', params);
export default {
    userInfo
};

import http from '@/utils/http/index';


const getHome = params => http.get('/miniapp', params);
const getHomeTest = params => http.get('/miniapp/test', params);
export default {
    getHome,
    getHomeTest
};

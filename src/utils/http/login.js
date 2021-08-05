import store from '@/store';
import config from '@/config';
import session from './session';

/**
 * 微信登录，获取 code 和 cryptoData
 */
const getWxLoginResult = () => new Promise((resolve, reject) => {
    uni.login({
        success(loginResult) {
            resolve(loginResult.code);
        },
        fail() {
            reject(new Error('微信登录失败，请检查网络状态'));
        }
    });
});

function doLoginTest(){
    return new Promise((resolve, reject) => {
        const version = config.VERSION;
        const scene =  '';

        const header = {
            'Wx-Scene': scene,
            'App-Version': version,
            Platform: 20
        };

        uni.request({
            url: `${config.HOST_URL}/miniapp/login`,
            method: 'POST',
            header,
            data: {
            },
            success(response) {
                if (response.statusCode === 200 && response.data) {
                    const { data } = response;
                    if (data.code !== 200) {
                        reject(response);
                    } else {
                        console.log('调用接口完成，存储token')
                        const token = data.data.access_token;
                        session.set(token);
                        // token获取之后再去异步获取用户信息
                        store.dispatch('user/getUserInfo')
                            .then(resolve)
                            .catch(reject);
                    }
                } else {
                    reject(response);
                }
            },
            fail(err) {
                // eslint-disable-next-line no-console
                console.log(err);
                reject(err);
            }
        });
    });
}
function doLogin(code) {
    return new Promise((resolve, reject) => {
        const version = config.VERSION;
        const scene =  '';

        const header = {
            'Wx-Scene': scene,
            'App-Version': version,
            Platform: 20
        };

        uni.request({
            url: `${config.HOST_URL}/user/token?city_id=${store.getters['city/currentCity'].city_id}`,
            method: 'POST',
            header,
            data: {
                code
            },
            success(response) {
                if (response.statusCode === 200 && response.data) {
                    const { data } = response;
                    if (data.code !== 0) {
                        reject(response);
                    } else {
                        const token = data.data.access_token;
                        session.set(token);
                        // token获取之后再去异步获取用户信息
                        store.dispatch('user/getUserInfo')
                            .then(resolve)
                            .catch(reject);
                    }
                } else {
                    reject(response);
                }
            },
            fail(err) {
                // eslint-disable-next-line no-console
                console.log(err);
                reject(err);
            }
        });
    });
}

let retry = false;
export default async function login() {
    try {
        // const code = await getWxLoginResult();
        // await doLogin(code);
        await  doLoginTest();
        retry = false;
    } catch (e) {
        if (!retry) {
            retry = true;
            await login();
        } else {
            throw e;
        }
    }
}

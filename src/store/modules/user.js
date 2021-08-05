// eslint-disable-next-line import/no-cycle
import api from '@/api/api';
import session from '@/utils/http/session';

const state = {
    userInfo: uni.getStorageSync('user-info') || {}
};

/**
 * 同步存储数据 this.$store.getters
 * @type {{SET_USER_INFO: mutations.SET_USER_INFO}}
 */
const mutations = {
    SET_USER_INFO: (st, userInfo) => {
        st.userInfo = userInfo;
        uni.setStorageSync('user-info', userInfo);
    }
};
/**
 * 异步存储数据
 * @type {{updateUserInfo({dispatch: *}, *=): *, updateUserPhone({dispatch: *}, *=): *, decodeUserPhone({dispatch: *}, *=): *, getUserInfo({commit: *}): *}}
 */
const actions = {
    getUserInfo({ commit }) {
        return new Promise((resolve, reject) => {
            api.user.userInfo()
                .then(res => {
                    if (res.data) {
                        const { data } = res;
                        commit('SET_USER_INFO', data);
                        resolve();
                    } else {
                        reject(new Error('获取用户信息失败'));
                    }
                });
        });
    },

    updateUserInfo({ dispatch }, params) {
        return new Promise((resolve, reject) => {
            api.me.updateUserInfo(params)
                .then(res => {
                    if (res.code === 0) {
                        dispatch('getUserInfo')
                            .then(data => {
                                resolve(data);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else {
                        reject(res);
                    }
                });
        });
    },

    /**
     *
     *  更新用户手机号信息
     *  1. 更新手机号
     *  2. 刷新token
     *  3. 获取用户信息
     */
    updateUserPhone({ dispatch }, params) {
        return new Promise((resolve, reject) => {
            api.me.bindUserPhone(params)
                .then(res => {
                    if (res.code === 0) {
                        session.set(res.data.access_token);
                        dispatch('getUserInfo')
                            .then(data => {
                                resolve(data);
                            })
                            .catch(error => {
                                reject(error);
                            });

                    } else if (res.code !== 1000) {
                        reject(res);
                    }
                });
        });
    },

    // 微信解密手机号
    decodeUserPhone({ dispatch }, params) {
        return new Promise((resolve, reject) => {
            api.me.decodeUserPhone(params)
                .then(res => {
                    if (res.code === 200) {
                        session.set(res.data.access_token);
                        dispatch('getUserInfo')
                            .then(data => {
                                resolve(data);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else if (res.code !== 1000) {
                        reject(res);
                    }
                });
        });
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};

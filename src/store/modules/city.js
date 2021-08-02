/* eslint-disable no-shadow */
const state = {
    currentCity: uni.getStorageSync('currentCity') || {
        city_id: 620100,
        name: '成都'
    },//获取 currentCity 数据 this.$store.getters['city/currentCity']
    shareCity: {},
};
/**
 * 同步存储数据 this.$store.commit('city/SET_CITY',{city_id:510100,name:"成都"})
 * @type {{SET_USER_INFO: mutations.SET_USER_INFO}}
 */
const mutations = {
    SET_CITY(state, city) {
        uni.setStorageSync('currentCity', city);
        state.currentCity = city;
    },
    SET_SHARE_CITY(state, city) {
        state.shareCity = city;
    },
};
/**
 * 异步存储数据 this.$store.dispatch('city/setCity', {city_id:510100,name:"成都"});
 * @type {{setCity({commit: *}, *=): void, setShareCity({commit: *}, *=): void}}
 */
const actions = {
    setCity({ commit }, data) {
        commit('SET_CITY', data);
    },
    setShareCity({ commit }, data) {
        commit('SET_SHARE_CITY', data);
    }
};

const getters = {
    currentCity: state => state.currentCity || {
        city_id: 510100,
        name: '成都'
    },
    shareCity: state => state.shareCity,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import user from './modules/user';
import city from './modules/city';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        user,
        city,
    },
    getters
});

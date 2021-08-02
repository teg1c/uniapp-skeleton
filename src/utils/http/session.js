const SESSION_KEY = `${process.env.NODE_ENV}_SSESSION`;

export default {
    get() {
        return uni.getStorageSync(SESSION_KEY) || null;
    },

    set(session) {
        uni.setStorageSync(SESSION_KEY, session);
    },

    clear() {
        uni.removeStorageSync(SESSION_KEY);
    }
};

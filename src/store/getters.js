const getters = {
    // ----me----
    userInfo: state => state.user.userInfo,
    // ----city---- 【this.$store.getters.cityInfo】
    cityInfo : state => state.city.currentCity
};

export default getters;

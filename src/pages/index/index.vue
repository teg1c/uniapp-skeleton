<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view>
      <text class="title">{{ title }}</text>
      <text class="test">{{ test }}</text>
    </view>
  </view>
</template>

<script>
import api from '@/api/api';

export default {
  data() {
    return {
      title: 'Hello',
      test: ''
    }
  },
  onLoad() {
    console.log(this.$store.getters.cityInfo)
    console.log(this.$store.commit('city/SET_CITY',{city_id:123,name:"test"}))
    this.getHome()
    this.getHomeTest()
  },
  methods: {
    async getHome() {
      const {data} = await api.home.getHome();
      this.test = data;
    },
    async getHomeTest() {
      const {data} = await api.home.getHomeTest();
    }
  }
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200 rpx;
  width: 200 rpx;
  margin: 200 rpx auto 50 rpx auto;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36 rpx;
  color: #8f8f94;
}
</style>

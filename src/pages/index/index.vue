<template>
  <view class="content">
    <view>
      <text class="title">{{ title }}</text>
      <text class="test">{{ test }}</text>
    </view>
  </view>
</template>

<script>
import api from "@/api/api";
import config from '@/config';
export default {
  data() {
    return {
      title: "Hello",
      test: "",
    };
  },
  onLoad() {
    console.info(config.PLATFORM )
    this.getHome();
  },
  methods: {
    async getHome() {
      const { data } = await api.home.getHome();
      this.test = data;
    },
  },
};
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

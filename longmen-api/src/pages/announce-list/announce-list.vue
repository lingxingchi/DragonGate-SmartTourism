<template>
  <view class="container">
    <view class="banner">
      <text class="banner-title">龙门景区公告</text>
      <text class="banner-subtitle">了解最新景区动态</text>
    </view>
    
    <view class="announce-list">
      <view 
        class="announce-card" 
        v-for="(item, index) in announceList" 
        :key="index"
        @click="goToDetail(item.id)"
      >
        <image 
          class="announce-img" 
          :src="item.imgUrl || '/static/logo.png'" 
          mode="aspectFill"
        ></image>
        <view class="announce-info">
          <text class="announce-title">{{ item.title }}</text>
          <view class="announce-meta">
            <text class="announce-date">{{ formatDate(item.publishTime) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-tip" v-if="announceList.length === 0">
      <image class="empty-icon" src="/static/logo.png" mode="aspectFit"></image>
      <text class="empty-text">暂无公告信息</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { announceStatement } from '../../api';
import type { AnnounceStatementVO } from '../../api/types';

// 公告列表
const announceList = ref<AnnounceStatementVO[]>([]);
// 是否加载完成
const isLoaded = ref(false);

// 页面加载
onMounted(() => {
  loadData();
});

// 下拉刷新
onPullDownRefresh(() => {
  loadData(true);
});

// 加载数据
const loadData = async (isRefresh = false) => {
  try {
    if (!isRefresh) {
      uni.showLoading({
        title: '加载中...'
      });
    }
    
    const res = await announceStatement.listPublishedAnnouncements();
    
    if (isRefresh) {
      uni.stopPullDownRefresh();
    } else {
      uni.hideLoading();
    }
    
    if (res.code === 0) {
      announceList.value = res.data || [];
      isLoaded.value = true;
    } else {
      uni.showToast({
        title: res.message || '加载公告失败',
        icon: 'none'
      });
    }
  } catch (error) {
    if (isRefresh) {
      uni.stopPullDownRefresh();
    } else {
      uni.hideLoading();
    }
    
    console.error('加载公告失败:', error);
    uni.showToast({
      title: '加载公告失败',
      icon: 'none'
    });
  }
};

// 跳转到详情页
const goToDetail = (id: number) => {
  if (id) {
    uni.navigateTo({
      url: `/pages/announce-detail/announce-detail?id=${id}`
    });
  } else {
    uni.showToast({
      title: '公告ID无效',
      icon: 'none'
    });
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

.banner {
  height: 220rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40rpx;
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
  color: #fff;
}

.banner-title {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.banner-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.announce-list {
  padding: 30rpx;
}

.announce-card {
  margin-bottom: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.announce-card:active {
  transform: scale(0.98);
}

.announce-img {
  width: 100%;
  height: 240rpx;
}

.announce-info {
  padding: 20rpx;
}

.announce-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.announce-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.announce-date {
  font-size: 24rpx;
  color: #999;
}

.empty-tip {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style> 
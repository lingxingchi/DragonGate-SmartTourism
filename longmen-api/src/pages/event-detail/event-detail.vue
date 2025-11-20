<template>
  <view class="container">
    <view class="header">
      <image class="banner" :src="event.imgPath || '/static/logo.png'" mode="aspectFill"></image>
      <view class="title-bar">
        <text class="title">{{ event.title }}</text>
        <view class="info">
          <text class="date">活动时间: {{ formatDate(event.publishTime) }} 至 {{ formatDate(event.offlineTime) }}</text>
        </view>
      </view>
    </view>
    
    <view class="content-card">
      <view class="card-title">
        <text class="title-text">活动详情</text>
      </view>
      <view class="content">
        <rich-text :nodes="event.content || '暂无详细内容'"></rich-text>
      </view>
    </view>
    
    <view class="bottom-bar">
      <button class="share-btn" open-type="share">
        <text class="btn-text">分享活动</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { eventStatement } from '../../api';
import type { EventStatementVO } from '../../api/types';

// 活动详情
const event = ref<EventStatementVO>({
  id: 0,
  title: '加载中...',
  content: '',
  imgPath: '',
  publishTime: '',
  offlineTime: ''
});

// 活动ID
const eventId = ref<number>(0);

// 页面加载
onLoad((options: any) => {
  if (options?.id && options.id !== 'undefined' && !isNaN(Number(options.id))) {
    eventId.value = Number(options.id);
    loadEventDetail();
  } else {
    uni.showToast({
      title: '活动ID无效',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

// 加载活动详情
const loadEventDetail = async () => {
  try {
    uni.showLoading({
      title: '加载中...'
    });
    
    const res = await eventStatement.getEventStatementVOById(eventId.value);
    
    uni.hideLoading();
    
    if (res.code === 0 && res.data) {
      event.value = res.data;
    } else {
      uni.showToast({
        title: res.message || '加载活动详情失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('加载活动详情失败:', error);
    uni.showToast({
      title: '加载活动详情失败',
      icon: 'none'
    });
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未设置';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 分享设置
onShareAppMessage(() => {
  return {
    title: event.value.title,
    path: `/pages/event-detail/event-detail?id=${eventId.value}`
  };
});
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 120rpx;
}

.header {
  position: relative;
  width: 100%;
}

.banner {
  width: 100%;
  height: 400rpx;
}

.title-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10rpx;
  display: block;
}

.info {
  display: flex;
  align-items: center;
}

.date {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.content-card {
  margin: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-title {
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 20rpx;
}

.title-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6rpx;
  height: 30rpx;
  width: 6rpx;
  background-color: #2d8cf0;
  border-radius: 3rpx;
}

.content {
  padding: 30rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

.share-btn {
  width: 80%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

.btn-text {
  font-size: 28rpx;
}
</style> 
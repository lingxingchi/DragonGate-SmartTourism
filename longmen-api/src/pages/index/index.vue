<template>
  <view class="home-container">
    <!-- 导览助手 -->
    <GuideAssistant />
    
    <!-- 顶部轮播图 -->
    <swiper 
      class="swiper" 
      circular 
      indicator-dots 
      autoplay 
      interval="5000" 
      duration="500"
      indicator-active-color="#2d8cf0"
      indicator-color="rgba(255, 255, 255, 0.6)"
    >
      <swiper-item v-for="(item, index) in eventList" :key="index" @click="goToEventDetail(item.id)">
        <view class="swiper-item">
          <image 
            class="swiper-img" 
            :src="item.imgPath || '/static/logo.png'" 
            mode="aspectFill"
          ></image>
          <view class="swiper-title">{{ item.title }}</view>
        </view>
      </swiper-item>
    </swiper>
    
    <!-- 服务卡片区域 -->
    <view class="service-cards">
      <view class="service-card" @click="goToTickets">
        <view class="card-icon-wrapper blue-gradient">
          <image src="/static/取票.png" mode="aspectFill" />
        </view>
        <view class="card-text">
          <text class="card-title">预约订票</text>
          <text class="card-desc">快速预约，轻松游玩</text>
        </view>
      </view>
      
      <view class="service-card" @click="goToGuideMap">
        <view class="card-icon-wrapper green-gradient">
          <image src="/static/地图.png" mode="aspectFill" />
        </view>
        <view class="card-text">
          <text class="card-title">地图导览</text>
          <text class="card-desc">景点导航，尽在掌握</text>
        </view>
      </view>
    </view>
    
    <!-- 告示信息区域 -->
    <view class="announce-section">
      <view class="section-header">
        <text class="section-title">告示信息</text>
        <text class="more-link" @click="goToMoreAnnounce">更多</text>
      </view>
      
      <view class="announce-list">
        <view 
          class="announce-card" 
          v-for="(item, index) in announceList" 
          :key="index"
          @click="goToAnnounceDetail(item.id)"
        >
          <image 
            class="announce-img" 
            :src="item.imgUrl || '/static/logo.png'" 
            mode="aspectFill"
          ></image>
          <view class="announce-info">
            <text class="announce-title">{{ item.title }}</text>
            <text class="announce-date">{{ formatDate(item.publishTime) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { announceStatement, eventStatement } from '../../api';
import GuideAssistant from '../../components/GuideAssistant.vue';
import type { AnnounceStatementVO, EventStatementVO } from '../../api/types';

// 活动列表
const eventList = ref<EventStatementVO[]>([]);
// 公告列表
const announceList = ref<AnnounceStatementVO[]>([]);

// 加载数据
onMounted(async () => {
  await loadData();
});

// 加载所有数据
const loadData = async () => {
  try {
    await Promise.all([
      loadEvents(),
      loadAnnouncements()
    ]);
  } catch (error) {
    console.error('加载首页数据失败:', error);
    uni.showToast({
      title: '加载数据失败，请下拉刷新重试',
      icon: 'none'
    });
  }
};

// 加载活动数据
const loadEvents = async () => {
  try {
    const res = await eventStatement.listPublishedEventStatements();
    if (res.code === 0 && res.data) {
      eventList.value = res.data;
      // 如果没有活动数据，添加一个默认项
      if (eventList.value.length === 0) {
        eventList.value = [{
          id: 0,
          title: '欢迎来到龙门景区',
          imgPath: '/static/logo.png',
          content: '',
          publishTime: new Date().toISOString(),
          offlineTime: ''
        }];
      }
    }
  } catch (error) {
    console.error('加载活动数据失败:', error);
  }
};

// 加载公告数据
const loadAnnouncements = async () => {
  try {
    const res = await announceStatement.listPublishedAnnouncements();
    if (res.code === 0 && res.data) {
      announceList.value = res.data;
      // 如果没有公告数据，添加一个默认项
      if (announceList.value.length === 0) {
        announceList.value = [{
          id: 0,
          title: '龙门景区公告',
          imgUrl: '/static/logo.png',
          content: '',
          publishTime: new Date().toISOString(),
          offlineTime: ''
        }];
      }
    }
  } catch (error) {
    console.error('加载公告数据失败:', error);
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 跳转到活动详情
const goToEventDetail = (id: number) => {
  if (id && !isNaN(id)) {
    uni.navigateTo({
      url: `/pages/event-detail/event-detail?id=${id}`
    });
  } else {
    uni.showToast({
      title: '活动ID无效',
      icon: 'none'
    });
  }
};

// 跳转到公告详情
const goToAnnounceDetail = (id: number) => {
  if (id && !isNaN(id)) {
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

// 跳转到预约订票页
const goToTickets = () => {
  uni.navigateTo({
    url: '/pages/ticket/ticket'
  });
};

// 跳转到地图导览页
const goToGuideMap = () => {
  uni.switchTab({
    url: '/pages/guide-map/guide-map'
  });
};

// 跳转到更多公告页
const goToMoreAnnounce = () => {
  uni.navigateTo({
    url: '/pages/announce-list/announce-list'
  });
};
</script>

<style>

.iconfont {
  font-family: "iconfont" !important;
  font-size: 48rpx;
  font-style: normal;
  color: #fff;
}

.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

image{
  width: 70%;
  height: 70%;
}

/* 轮播图样式 */
.swiper {
  height: 360rpx;
  width: 100%;
}

.swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.swiper-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

/* 服务卡片样式 */
.service-cards {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.service-card {
  width: 48%;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.service-card:active {
  transform: scale(0.98);
}

.card-icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.blue-gradient {
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
}

.green-gradient {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

.card-text {
  flex: 1;
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

/* 告示信息区域 */
.announce-section {
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 24rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10rpx;
  height: 30rpx;
  width: 8rpx;
  background-color: #2d8cf0;
  border-radius: 4rpx;
}

.more-link {
  font-size: 28rpx;
  color: #666;
}

.announce-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.announce-card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
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
  padding: 20rpx 30rpx;
}

.announce-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announce-date {
  font-size: 24rpx;
  color: #999;
}
</style>

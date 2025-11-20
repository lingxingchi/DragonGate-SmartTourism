<template>
	<view class="route-detail-container">
		<view class="route-header">
			<text class="route-name">{{ route.name }}</text>
			<text class="route-description">{{ route.content }}</text>
			<view class="route-badge">
				<text>{{ route.attractionCount }}个景点</text>
				<text class="duration">约需2小时</text>
			</view>
		</view>
		
		<!-- 路线地图预览 -->
		<view class="map-preview">
			<image class="map-image" :src="mapImage" mode="aspectFill"></image>
			<view class="map-overlay">
				<view class="map-btn" @click="viewInMap">
					<uni-icons type="map" size="18" color="#fff"></uni-icons>
					<text>在地图中查看</text>
				</view>
			</view>
		</view>
		
		<!-- 景点列表 -->
		<view class="attraction-list">
			<view class="section-title">
				<text>路线景点</text>
			</view>
			
			<view 
				class="attraction-item" 
				v-for="(attraction, index) in attractions" 
				:key="attraction.id"
				@click="goToAttractionDetail(attraction)"
			>
				<view class="attraction-order">
					<text>{{ index + 1 }}</text>
					<view class="order-line" v-if="index < attractions.length - 1"></view>
				</view>
				
				<view class="attraction-content">
					<image class="attraction-image" :src="attraction.imgUrl" mode="aspectFill"></image>
					<view class="attraction-info">
						<text class="attraction-name">{{ attraction.name }}</text>
						<text class="attraction-location">{{ attraction.location }}</text>
						<view class="attraction-desc">{{ attraction.content }}</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部固定按钮 -->
		<view class="fixed-bottom">
			<button class="start-btn" @click="startRoute">开始游览</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRouteDetail } from '../../api/attractionRoute';
import type { AttractionRouteVO, AttractionItemVO } from '../../api/types';

// 路线信息
const route = ref<AttractionRouteVO>({
	id: 0,
	name: '',
	content: '',
	createTime: '',
	updateTime: '',
	attractionCount: 0,
	attractions: []
});

// 景点列表
const attractions = ref<AttractionItemVO[]>([]);

// 地图图片
const mapImage = ref('/static/logo.png');

// 加载路线详情
const loadRouteDetail = async (routeId: number) => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const { data } = await getRouteDetail(routeId);
		
		if (data) {
			route.value = data;
			attractions.value = data.attractions || [];
		}
	} catch (error) {
		console.error('获取路线详情失败', error);
		uni.showToast({
			title: '获取路线详情失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 跳转到景点详情
const goToAttractionDetail = (attraction: AttractionItemVO) => {
	uni.navigateTo({
		url: `/pages/attraction-detail/attraction-detail?id=${attraction.attractionId}`
	});
};

// 在地图中查看路线
const viewInMap = () => {
	uni.navigateTo({
		url: '/pages/guide-map/guide-map',
		success: (res) => {
			// 向地图页面传递路线信息
			// @ts-ignore
			res.eventChannel?.emit('selectRoute', { routeId: route.value.id });
		}
	});
};

// 开始游览
const startRoute = () => {
	uni.showToast({
		title: '已开始游览路线',
		icon: 'success'
	});
	
	// 可以导航到第一个景点
	if (attractions.value.length > 0) {
		setTimeout(() => {
			goToAttractionDetail(attractions.value[0]);
		}, 1500);
	}
};

// 页面加载
onMounted(() => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	// @ts-ignore
	const options = currentPage.$vm?.options || {};
	
	if (options.id) {
		const id = parseInt(options.id);
		loadRouteDetail(id);
	} else {
		uni.showToast({
			title: '路线ID不存在',
			icon: 'none'
		});
	}
});
</script>

<style>
.route-detail-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 120rpx;
}

/* 路线头部样式 */
.route-header {
	padding: 40rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
}

.route-name {
	font-size: 42rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
	display: block;
}

.route-description {
	font-size: 28rpx;
	line-height: 1.6;
	opacity: 0.9;
	margin-bottom: 30rpx;
	display: block;
}

.route-badge {
	display: flex;
	align-items: center;
}

.route-badge text {
	font-size: 24rpx;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 30rpx;
	padding: 6rpx 20rpx;
	margin-right: 20rpx;
}

.duration {
	display: flex;
	align-items: center;
}

/* 地图预览样式 */
.map-preview {
	position: relative;
	width: 100%;
	height: 300rpx;
}

.map-image {
	width: 100%;
	height: 100%;
}

.map-overlay {
	position: absolute;
	bottom: 20rpx;
	right: 20rpx;
}

.map-btn {
	display: flex;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	font-size: 26rpx;
	padding: 12rpx 20rpx;
	border-radius: 30rpx;
}

.map-btn uni-icons {
	margin-right: 8rpx;
}

/* 景点列表样式 */
.attraction-list {
	padding: 30rpx;
}

.section-title {
	margin-bottom: 30rpx;
}

.section-title text {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.attraction-item {
	display: flex;
	margin-bottom: 20rpx;
}

.attraction-order {
	width: 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 20rpx;
}

.attraction-order text {
	width: 48rpx;
	height: 48rpx;
	background-color: #2d8cf0;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	margin-bottom: 10rpx;
}

.order-line {
	flex: 1;
	width: 2rpx;
	background-color: #e0e0e0;
}

.attraction-content {
	flex: 1;
	display: flex;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.attraction-image {
	width: 200rpx;
	height: 200rpx;
	flex-shrink: 0;
}

.attraction-info {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
}

.attraction-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 10rpx;
}

.attraction-location {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.attraction-desc {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}

/* 底部固定按钮 */
.fixed-bottom {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx 40rpx;
	background-color: #fff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.start-btn {
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 32rpx;
	border-radius: 45rpx;
}
</style> 
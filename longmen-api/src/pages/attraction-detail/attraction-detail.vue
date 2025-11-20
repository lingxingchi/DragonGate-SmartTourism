<template>
	<view class="attraction-detail-container">
		<!-- 景点图片 -->
		<image class="attraction-image" :src="attraction.imgUrl" mode="widthFix"></image>
		
		<!-- 景点信息卡片 -->
		<view class="info-card">
			<view class="attraction-header">
				<text class="attraction-name">{{ attraction.name }}</text>
				<view class="attraction-location">
					<uni-icons type="location" size="16" color="#2d8cf0"></uni-icons>
					<text>{{ attraction.location }}</text>
				</view>
			</view>
			
			<view class="divider"></view>
			
			<view class="attraction-content">
				<view class="content-header">
					<view class="title-wrap">
						<text class="content-title">景点介绍</text>
						<button class="ai-button" @click="getAIExplanation" :loading="aiLoading">
							<uni-icons type="refresh" size="14" color="#fff"></uni-icons>
							<text>AI讲解</text>
						</button>
					</view>
					
					<!-- 讲解偏好选择器 -->
					<view class="preference-selector">
						<text class="preference-label">讲解深度：</text>
						<view class="preference-segment">
							<view 
								class="segment-item" 
								:class="{ active: selectedPreference === '生动活泼的故事讲解' }"
								@click="selectPreference('生动活泼的故事讲解')"
							>
								<text>入门</text>
							</view>
							<view 
								class="segment-item" 
								:class="{ active: selectedPreference === '通俗易懂的基础科普' }"
								@click="selectPreference('通俗易懂的基础科普')"
							>
								<text>进阶</text>
							</view>
							<view 
								class="segment-item" 
								:class="{ active: selectedPreference === '学术严谨的专业讲解' }"
								@click="selectPreference('学术严谨的专业讲解')"
							>
								<text>专业</text>
							</view>
						</view>
					</view>
				</view>
				
				<rich-text class="content-text" :nodes="attraction.content"></rich-text>
			</view>
		</view>
		
		<!-- 相关景点推荐 -->
		<view class="related-attractions">
			<view class="section-title">
				<text>周边景点推荐</text>
			</view>
			
			<scroll-view class="related-scroll" scroll-x>
				<view class="related-list">
					<view class="related-item" v-for="(item, index) in relatedAttractions" :key="item.id" @click="goToAttractionDetail(item)">
						<image class="related-image" :src="item.imgUrl" mode="aspectFill"></image>
						<text class="related-name">{{ item.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAttractionById, listAttraction, getAttractionAi } from '../../api/attraction';
import type { Attraction } from '../../api/types';

// 当前景点ID
const attractionId = ref<number>(0);

// 当前景点
const attraction = ref<Attraction>({
	content: '',
	createTime: '',
	id: 0,
	imgUrl: '',
	isDelete: 0,
	location: '',
	name: '',
	updateTime: ''
});

// AI讲解加载状态
const aiLoading = ref<boolean>(false);

// 用户选择的偏好
const selectedPreference = ref<string>('通俗易懂的基础科普'); // 默认选择爱好者

// 相关景点
const relatedAttractions = ref<Attraction[]>([]);

// 选择偏好
const selectPreference = (preference: string) => {
	selectedPreference.value = preference;
};

// 加载景点数据
const loadAttractionDetail = async (id: number) => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const { data } = await getAttractionById(id);
		
		if (data) {
			attraction.value = data;
			await loadRelatedAttractions();
		} else {
			uni.showToast({
				title: '景点不存在',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取景点详情失败', error);
		uni.showToast({
			title: '获取景点详情失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 获取AI讲解
const getAIExplanation = async () => {
	if (attractionId.value <= 0) {
		uni.showToast({
			title: '景点ID无效',
			icon: 'none'
		});
		return;
	}
	
	try {
		aiLoading.value = true;
		
		// 调用AI接口获取景点讲解，并传入偏好
		const { data } = await getAttractionAi({
			id: attractionId.value,
			preference: selectedPreference.value
		});
		
		if (data) {
			// 更新景点介绍内容
			attraction.value = {
				...attraction.value,
				content: data
			};
			
			uni.showToast({
				title: 'AI讲解已更新',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '获取AI讲解失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取AI讲解失败', error);
		uni.showToast({
			title: '获取AI讲解失败',
			icon: 'none'
		});
	} finally {
		aiLoading.value = false;
	}
};

// 加载相关景点
const loadRelatedAttractions = async () => {
	try {
		// 使用不分页接口获取所有景点
		const { data } = await listAttraction();
		
		if (data && data.length > 0) {
			// 过滤掉当前景点
			relatedAttractions.value = data
				.filter(item => item.id !== attraction.value.id)
				.slice(0, 5); // 只取5个相关景点
		}
	} catch (error) {
		console.error('获取相关景点失败', error);
	}
};

// 跳转到另一个景点详情
const goToAttractionDetail = (item: Attraction) => {
	uni.redirectTo({
		url: `/pages/attraction-detail/attraction-detail?id=${item.id}`
	});
};

// 注册页面生命周期钩子
// @ts-ignore
if (typeof uni.$on === 'function') {
	// 订阅页面加载事件
	uni.$on('onLoad', (options: any) => {
		console.log('页面onLoad参数:', options);
		if (options && options.id) {
			const id = parseInt(options.id);
			attractionId.value = id;
			loadAttractionDetail(id);
		} else {
			uni.showToast({
				title: '景点ID不存在',
				icon: 'none'
			});
		}
	});
}

// 页面加载（主要方案）
onMounted(() => {
	// 获取页面参数
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	// @ts-ignore - 忽略类型检查
	const options = currentPage.$page?.options || currentPage.options || {};
	
	console.log('从currentPage获取参数:', options);
	
	if (options && options.id) {
		const id = parseInt(options.id);
		attractionId.value = id;
		loadAttractionDetail(id);
	} else {
		uni.showToast({
			title: '景点ID不存在',
			icon: 'none'
		});
	}
});
</script>

<style>
.attraction-detail-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 40rpx;
}

/* 景点图片样式 */
.attraction-image {
	width: 100%;
	height: auto;
}

/* 信息卡片样式 */
.info-card {
	margin: -40rpx 30rpx 30rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	position: relative;
	z-index: 10;
}

.attraction-header {
	margin-bottom: 20rpx;
}

.attraction-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.attraction-location {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	color: #666;
}

.attraction-location uni-icons {
	margin-right: 8rpx;
}

.divider {
	height: 1rpx;
	background-color: #f0f0f0;
	margin: 20rpx 0;
}

.attraction-content {
	margin-top: 20rpx;
}

.content-header {
	margin-bottom: 30rpx;
}

.title-wrap {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.content-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.ai-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60rpx;
	padding: 0 24rpx;
	background-color: #2d8cf0;
	border-radius: 30rpx;
	margin: 0;
}

.ai-button text {
	font-size: 24rpx;
	color: #fff;
	margin-left: 5rpx;
}

/* 新的偏好选择器样式 */
.preference-selector {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
	background-color: #f8f9fa;
	padding: 16rpx 20rpx;
	border-radius: 12rpx;
}

.preference-label {
	font-size: 26rpx;
	color: #666;
	margin-right: 20rpx;
}

.preference-segment {
	display: flex;
	flex: 1;
	height: 64rpx;
	background-color: #e9ecef;
	border-radius: 32rpx;
	padding: 4rpx;
	position: relative;
}

.segment-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 28rpx;
	position: relative;
	z-index: 1;
	transition: all 0.25s ease;
}

.segment-item text {
	font-size: 26rpx;
	color: #666;
	transition: color 0.25s ease;
}

.segment-item.active {
	background-color: #ffffff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.segment-item.active text {
	color: #2d8cf0;
	font-weight: 500;
}

.content-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
}

/* 相关景点推荐样式 */
.related-attractions {
	margin: 30rpx 0;
}

.section-title {
	padding: 0 30rpx;
	margin-bottom: 20rpx;
}

.section-title text {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.related-scroll {
	width: 100%;
}

.related-list {
	display: flex;
	padding: 0 30rpx;
}

.related-item {
	margin-right: 20rpx;
	width: 220rpx;
	flex-shrink: 0;
}

.related-image {
	width: 220rpx;
	height: 220rpx;
	border-radius: 12rpx;
	margin-bottom: 10rpx;
}

.related-name {
	font-size: 26rpx;
	color: #333;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style> 
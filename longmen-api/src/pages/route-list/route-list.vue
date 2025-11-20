<template>
	<view class="route-list-container">
		<view class="header">
			<text class="header-title">推荐路线</text>
			<text class="header-subtitle">龙门石窟精选游览路线</text>
		</view>
		
		<view class="route-list">
			<view 
				v-for="(route, index) in routes" 
				:key="route.id" 
				class="route-card"
				@click="showRouteDetail(route)"
			>
				<view class="route-info">
					<view class="route-header">
						<text class="route-name">{{ route.name }}</text>
						<view class="route-badge">
							<text>{{ route.attractionCount }}个景点</text>
						</view>
					</view>
					
					<text class="route-desc">{{ route.content }}</text>
					
					<view class="route-footer">
						<view class="tag-list">
							<view class="route-tag" v-if="index === 0">推荐</view>
							<view class="route-tag" v-if="index === 1">人气</view>
							<view class="route-tag" v-if="index === 2">休闲</view>
						</view>
						<view class="view-detail-btn">
							<text>查看详情</text>
							<uni-icons type="right" size="14" color="#2d8cf0"></uni-icons>
						</view>
					</view>
				</view>
				
				<view class="route-attractions">
					<scroll-view class="attractions-scroll" scroll-x>
						<view class="attractions-list">
							<view 
								class="attraction-item" 
								v-for="(attraction, aIndex) in route.attractions.length ? route.attractions : mockAttractions" 
								:key="aIndex"
							>
								<image class="attraction-image" 
									:src="attraction.imgUrl" 
									mode="aspectFill"
								></image>
								<text class="attraction-order">{{ aIndex + 1 }}</text>
								<text class="attraction-name">{{ attraction.name }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRouteDetail } from '../../api/attractionRoute';
import type { AttractionRouteVO, AttractionItemVO } from '../../api/types';

// 路线列表
const routes = ref<AttractionRouteVO[]>([]);

// 模拟的景点数据 (当API没有返回景点列表时使用)
const mockAttractions = ref<AttractionItemVO[]>([
	{
		attractionId: 1,
		content: '卢舍那大佛是龙门石窟规模最大的洞窟',
		id: 1,
		imgUrl: '/static/logo.png',
		location: '奉先寺',
		name: '卢舍那大佛',
		sort: 1
	},
	{
		attractionId: 2,
		content: '万佛洞中雕刻着上万尊佛像',
		id: 2,
		imgUrl: '/static/logo.png',
		location: '东山',
		name: '万佛洞',
		sort: 2
	},
	{
		attractionId: 3,
		content: '古阳洞是龙门石窟开凿最早的洞窟之一',
		id: 3,
		imgUrl: '/static/logo.png',
		location: '西山',
		name: '古阳洞',
		sort: 3
	}
]);

// 加载路线数据
const loadRoutes = async () => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		// 模拟数据，实际应该有一个获取所有路线的API
		routes.value = [
			{
				id: 1,
				name: '经典游览路线',
				content: '游览龙门石窟的经典路线，覆盖主要景点，包括奉先寺、古阳洞、万佛洞等，适合首次游览的游客',
				createTime: '',
				updateTime: '',
				attractionCount: 8,
				attractions: []
			},
			{
				id: 2,
				name: '文化探索路线',
				content: '深度了解龙门石窟的历史文化内涵，包括碑刻、造像艺术等，适合对佛教文化和历史感兴趣的游客',
				createTime: '',
				updateTime: '',
				attractionCount: 6,
				attractions: []
			},
			{
				id: 3,
				name: '休闲游览路线',
				content: '轻松游览，适合带老人和孩子的家庭，路线平缓，景点集中，可欣赏龙门山水和石窟艺术',
				createTime: '',
				updateTime: '',
				attractionCount: 5,
				attractions: []
			}
		];
		
		// 加载每条路线的景点详情
		await Promise.all(routes.value.map(async (route) => {
			try {
				const { data } = await getRouteDetail(route.id);
				if (data && data.attractions) {
					route.attractions = data.attractions;
				}
			} catch (error) {
				console.error(`获取路线${route.id}详情失败`, error);
			}
		}));
	} catch (error) {
		console.error('获取路线列表失败', error);
		uni.showToast({
			title: '获取路线列表失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 显示路线详情
const showRouteDetail = (route: AttractionRouteVO) => {
	uni.navigateTo({
		url: `/pages/route-detail/route-detail?id=${route.id}`
	});
};

// 页面加载
onMounted(() => {
	loadRoutes();
});
</script>

<style>
.route-list-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 40rpx;
}

/* 头部样式 */
.header {
	padding: 60rpx 40rpx 40rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
}

.header-title {
	font-size: 42rpx;
	font-weight: 600;
	display: block;
	margin-bottom: 10rpx;
}

.header-subtitle {
	font-size: 28rpx;
	opacity: 0.8;
}

/* 路线列表样式 */
.route-list {
	padding: 30rpx;
}

.route-card {
	margin-bottom: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.route-info {
	padding: 30rpx;
}

.route-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.route-name {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.route-badge {
	background-color: rgba(45, 140, 240, 0.1);
	color: #2d8cf0;
	font-size: 24rpx;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}

.route-desc {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 20rpx;
}

.route-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
}

.tag-list {
	display: flex;
}

.route-tag {
	font-size: 22rpx;
	color: #ff9800;
	background-color: rgba(255, 152, 0, 0.1);
	padding: 4rpx 16rpx;
	border-radius: 6rpx;
	margin-right: 10rpx;
}

.view-detail-btn {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	color: #2d8cf0;
}

.view-detail-btn uni-icons {
	margin-left: 6rpx;
}

/* 景点列表样式 */
.route-attractions {
	padding: 20rpx 0;
	background-color: #f9f9f9;
	border-top: 1rpx solid #f0f0f0;
}

.attractions-scroll {
	width: 100%;
}

.attractions-list {
	display: flex;
	padding: 0 30rpx;
}

.attraction-item {
	position: relative;
	margin-right: 20rpx;
	width: 180rpx;
	flex-shrink: 0;
}

.attraction-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 10rpx;
}

.attraction-order {
	position: absolute;
	top: 10rpx;
	left: 10rpx;
	width: 40rpx;
	height: 40rpx;
	line-height: 40rpx;
	text-align: center;
	background-color: #2d8cf0;
	color: #fff;
	font-size: 22rpx;
	border-radius: 50%;
}

.attraction-name {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #333;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}
</style> 
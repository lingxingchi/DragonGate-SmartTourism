<template>
	<view class="guide-map-container">
		<!-- 导览助手 -->
		<GuideAssistant />
		
		<!-- 顶部导航栏 -->
		<view class="navigation-bar">
			<view class="title-box">
				<text class="title-text">龙门石窟导览地图</text>
			</view>
			<view class="route-btn" @click="goToRouteList">
				<uni-icons type="paperplane" size="14" color="#fff"></uni-icons>
				<text>路线</text>
			</view>
		</view>
		
		<!-- 地图视图 -->
		<view class="map-content">
			<!-- 高德地图 -->
			<view class="map-view">
				<map
					class="amap"
					id="map"
					:longitude="mapCenter.longitude"
					:latitude="mapCenter.latitude"
					:markers="mapMarkers"
					:polyline="mapPolylines"
					:scale="13"
					show-location
					@markertap="onMarkerTap"
					@callouttap="onCalloutTap"
				></map>
			</view>
			
			<!-- 景点卡片轮播 -->
			<swiper 
				class="attraction-card-swiper" 
				:current="currentAttractionIndex"
				@change="onSwiperChange"
				circular
				indicator-dots
				indicator-color="rgba(0, 0, 0, .3)"
				indicator-active-color="#2d8cf0"
			>
				<swiper-item v-for="(attraction, index) in attractions" :key="attraction.id">
					<view class="attraction-card" @click="goToAttractionDetail(attraction)">
						<image class="card-image" :src="attraction.imgUrl || '/static/logo.png'" mode="aspectFill"></image>
						<view class="card-info">
							<text class="card-name">{{ attraction.name }}</text>
							<view class="card-description">{{ attraction.content }}</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { listAttractionByPage, getAttractionById, listAttraction } from '../../api/attraction';
import { getRouteDetail, getRouteAttractions } from '../../api/attractionRoute';
import GuideAssistant from '../../components/GuideAssistant.vue';
import type { Attraction, AttractionRouteVO } from '../../api/types';

// 景点列表
const attractions = ref<(Attraction & { mapPosition?: { x: number, y: number, lng?: number, lat?: number }, isHighlighted?: boolean })[]>([]);

// 路线列表
const routes = ref<AttractionRouteVO[]>([]);

// 当前选中的景点索引
const currentAttractionIndex = ref(0);

// 地图中心点
const mapCenter = ref({
	longitude: 112.477463, // 龙门石窟中心经度
	latitude: 34.558782    // 龙门石窟中心纬度
});

// 地图标记点
const mapMarkers = ref<any[]>([]);

// 地图路线
const mapPolylines = ref<any[]>([]);

// 加载景点数据
const loadAttractions = async () => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		// 使用不分页接口获取全部景点
		const { data } = await listAttraction();
		let attractionList: Attraction[] = [];
			
			if (data) {
				attractionList = data;
			}
		
		// 为景点添加地图位置信息（从API返回的坐标数据）
		attractions.value = attractionList.map((item, index) => {
			// 解析坐标字符串，格式为："经度,纬度"，如："112.477567,34.558397"
			let lng = 112.477463; // 默认龙门石窟中心经度
			let lat = 34.558782;  // 默认龙门石窟中心纬度
			
			if (item.location) {
				// 尝试从坐标字段解析经纬度
				const coordinates = item.location.split(',');
				if (coordinates.length === 2) {
					// 确保是有效的数字
					const parsedLng = parseFloat(coordinates[0]);
					const parsedLat = parseFloat(coordinates[1]);
					
					if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
						lng = parsedLng;
						lat = parsedLat;
					}
				}
			}
			
			return {
				...item,
				mapPosition: {
					x: 0, // 这些字段保留但不再使用
					y: 0, 
					lng, // 使用解析的经纬度
					lat
				}
			};
		});
		
		// 更新地图标记点
		updateMapMarkers();
	} catch (error) {
		console.error('获取景点列表失败', error);
		uni.showToast({
			title: '获取景点列表失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 更新地图标记点
const updateMapMarkers = () => {
	mapMarkers.value = attractions.value
		.filter(item => item.mapPosition && item.mapPosition.lng && item.mapPosition.lat)
		.map((item, index) => {
			if (item && item.mapPosition && item.mapPosition.lng && item.mapPosition.lat) {
	return {
					id: item.id,
					longitude: item.mapPosition.lng,
					latitude: item.mapPosition.lat,
					title: item.name,
					iconPath: item.isHighlighted 
						? '/static/images/marker-red.png' 
						: '/static/images/marker-blue.png',
					width: item.isHighlighted ? 40 : 32,
					height: item.isHighlighted ? 40 : 32,
					anchor: {
						x: 0.5,
						y: 1
					},
					callout: {
						content: item.name,
						color: '#ffffff',
						fontSize: 12,
						borderRadius: 4,
						bgColor: item.isHighlighted ? '#ff4d4f' : '#2d8cf0',
						padding: 6,
						display: item.isHighlighted ? 'ALWAYS' : 'BYCLICK'
					}
				};
			}
			return null;
		})
		.filter(marker => marker !== null);
};

// 加载路线数据
const loadRoutes = async () => {
	try {
		// 这里应该有一个获取所有路线的API，但现在没有
		// 暂时使用模拟数据
		routes.value = [
			{
				id: 1,
				name: '经典游览路线',
				content: '游览龙门石窟的经典路线，覆盖主要景点',
				createTime: '',
				updateTime: '',
				attractionCount: 8,
				attractions: []
			},
			{
				id: 2,
				name: '文化探索路线',
				content: '深度了解龙门石窟的历史文化内涵',
				createTime: '',
				updateTime: '',
				attractionCount: 6,
				attractions: []
			},
			{
				id: 3,
				name: '休闲游览路线',
				content: '轻松游览，适合带老人和孩子',
				createTime: '',
				updateTime: '',
				attractionCount: 5,
				attractions: []
			}
		];
	} catch (error) {
		console.error('获取路线列表失败', error);
	}
};

// 标记被点击
const onMarkerTap = (e: any) => {
	const markerId = e.markerId || e.detail.markerId;
	const index = attractions.value.findIndex(item => item.id === markerId);
	if (index !== -1) {
	currentAttractionIndex.value = index;
		
		// 更新所有景点的高亮状态
		attractions.value = attractions.value.map(item => {
			return {
				...item,
				isHighlighted: item.id === markerId
			};
		});
		
		// 更新地图标记点样式
		updateMapMarkers();
	}
};

// 气泡点击
const onCalloutTap = (e: any) => {
	const markerId = e.markerId || e.detail.markerId;
	const attraction = attractions.value.find(item => item.id === markerId);
	if (attraction) {
		goToAttractionDetail(attraction);
	}
};

// 轮播图变化事件
const onSwiperChange = (e: any) => {
	const index = e.detail.current;
	currentAttractionIndex.value = index;
	
	// 获取所选景点信息
	const attraction = attractions.value[index];
	if (attraction && attraction.mapPosition && attraction.mapPosition.lng && attraction.mapPosition.lat) {
		// 移动地图中心到景点位置
		mapCenter.value = {
			longitude: attraction.mapPosition.lng,
			latitude: attraction.mapPosition.lat
		};
		
		// 更新所有景点的高亮状态
		attractions.value = attractions.value.map(item => {
			return {
				...item,
				isHighlighted: item.id === attraction.id
			};
		});
		
		// 更新地图标记点样式
		updateMapMarkers();
	}
};

// 跳转到景点详情页
const goToAttractionDetail = (attraction: Attraction) => {
	console.log('跳转到景点:', attraction.id, attraction.name);
	uni.navigateTo({
		url: `/pages/attraction-detail/attraction-detail?id=${attraction.id}`
	});
};

// 跳转到路线列表页
const goToRouteList = () => {
	uni.navigateTo({
		url: '/pages/route-list/route-list'
	});
};

// 创建路线
const createRoutePolyline = (routePoints: any[]) => {
	if (routePoints.length < 2) return;
	
	mapPolylines.value = [{
		points: routePoints,
		color: '#3366FF',
		width: 6,
		arrowLine: true,
		borderColor: '#ffeeff',
		borderWidth: 2
	}];
};

// 页面加载
onMounted(async () => {
	// 请求定位权限
	uni.getSetting({
		success: (res) => {
			if (!res.authSetting['scope.userLocation']) {
				uni.authorize({
					scope: 'scope.userLocation',
					success: () => {
						console.log('定位权限获取成功');
					},
					fail: (err) => {
						console.error('定位权限获取失败', err);
					}
				});
			}
		}
	});
	
	// 加载景点和路线数据
	await Promise.all([loadAttractions(), loadRoutes()]);
	
	// 监听从路线详情页传递过来的路线选择事件
	// @ts-ignore - uni-app的事件通道API
	const eventChannel = uni.getOpenerEventChannel?.();
	// @ts-ignore - 忽略类型检查
	eventChannel?.on?.('selectRoute', async (data: {routeId: number}) => {
		if (data && data.routeId) {
			// 查找对应路线
			const selectedRoute = routes.value.find(route => route.id === data.routeId);
			if (selectedRoute) {
				await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟确保页面已加载
				try {
					uni.showLoading({
						title: '加载路线...'
					});
					
					const { data } = await getRouteDetail(selectedRoute.id);
					
					if (data && data.attractions) {
						// 高亮显示该路线包含的景点
						const routeAttractionIds = data.attractions.map(item => item.attractionId);
						
						attractions.value = attractions.value.map(item => {
							if (routeAttractionIds.includes(item.id)) {
								return {
									...item,
									isHighlighted: true
								};
							}
							return {
								...item,
								isHighlighted: false
							};
						});
						
						// 更新地图标记点以更新高亮状态
						updateMapMarkers();
						
						// 创建路线连线
						const routePoints = data.attractions
							.filter(item => {
								const attraction = attractions.value.find(a => a.id === item.attractionId);
								return attraction && attraction.mapPosition && attraction.mapPosition.lng && attraction.mapPosition.lat;
							})
							.map(item => {
								const attraction = attractions.value.find(a => a.id === item.attractionId);
								if (attraction && attraction.mapPosition && attraction.mapPosition.lng && attraction.mapPosition.lat) {
									return {
										longitude: attraction.mapPosition.lng,
										latitude: attraction.mapPosition.lat
									};
								}
								return null;
							})
							.filter(point => point !== null);
						
						// 如果有路线点，创建连线
						if (routePoints.length > 1) {
							createRoutePolyline(routePoints);
						}
						
						uni.showToast({
							title: '路线已加载',
							icon: 'success'
						});
					}
				} catch (error) {
					console.error('获取路线详情失败', error);
					uni.showToast({
						title: '加载路线失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
		}
	});
});

// 监听景点列表变化，更新地图标记点
watch(attractions, () => {
	updateMapMarkers();
}, { deep: true });

// 监听当前选中景点索引变化
watch(currentAttractionIndex, (newIndex) => {
	const attraction = attractions.value[newIndex];
	if (attraction && attraction.mapPosition && attraction.mapPosition.lng && attraction.mapPosition.lat) {
		mapCenter.value = {
			longitude: attraction.mapPosition.lng,
			latitude: attraction.mapPosition.lat
		};
	}
});
</script>

<style>
.guide-map-container {
	position: relative;
	min-height: 100vh;
	background-color: #f5f7fa;
}

/* 导航栏样式 */
.navigation-bar {
	position: sticky;
	top: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title-box {
	flex: 1;
	display: flex;
	align-items: center;
	margin-right: 20rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.route-btn {
	padding: 10rpx 20rpx;
	border-radius: 30rpx;
	background-color: #2d8cf0;
	color: #fff;
	font-size: 24rpx;
	display: flex;
	align-items: center;
}

.route-btn uni-icons {
	margin-right: 4rpx;
}

/* 地图内容区域样式 */
.map-content {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 90rpx);
}

/* 地图视图样式 */
.map-view {
	position: relative;
	width: 100%;
	flex: 1;
	overflow: hidden;
}

.amap {
	width: 100%;
	height: 100%;
}

/* 景点卡片轮播样式 */
.attraction-card-swiper {
	height: 280rpx;
	width: 100%;
	padding: 20rpx 0;
	background-color: #fff;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.attraction-card {
	margin: 0 20rpx;
	height: 240rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	display: flex;
	overflow: hidden;
}

.card-image {
	width: 240rpx;
	height: 100%;
	flex-shrink: 0;
}

.card-info {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	position: relative;
}

.card-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 10rpx;
}

.card-description {
	font-size: 26rpx;
	color: #999;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}
</style>

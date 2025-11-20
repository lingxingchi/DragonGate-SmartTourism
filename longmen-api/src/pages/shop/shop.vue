<template>
	<view class="shop-container">
		<!-- 导览助手 -->
		<GuideAssistant />
		
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" placeholder="搜索商品" confirm-type="search" @confirm="searchGoods" v-model="searchText" />
			</view>
			<view class="cart-icon" @click="goToCart">
				<image src="/src/static/images/购物车空.png" mode="aspectFill" />
				<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
			</view>
		</view>
		
		<!-- 商品分类选择 -->
		<scroll-view class="category-scroll" scroll-x>
			<view class="category-list">
				<view 
					class="category-item" 
					:class="{ 'active': selectedCategories.length === 0 }" 
					@click="selectAllCategories()"
				>
					全部
				</view>
				<view 
					class="category-item" 
					:class="{ 'active': isSelected(type.id) }" 
					v-for="type in goodsTypes" 
					:key="type.id"
					@click="toggleCategory(type.id)"
				>
					{{ type.typeName }}
				</view>
			</view>
		</scroll-view>
		
		<!-- 商品列表 -->
		<scroll-view 
			class="goods-scroll" 
			scroll-y 
			refresher-enabled 
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<view class="goods-grid">
				<view 
					class="goods-item" 
					v-for="(good, index) in goodsList" 
					:key="good.id"
					@click="goToGoodDetail(good)"
				>
					<image class="goods-image" :src="good.cover" mode="aspectFill"></image>
					<view class="goods-info">
						<text class="goods-name">{{ good.name }}</text>
						<view class="goods-price-row">
							<text class="goods-price">¥{{ good.price.toFixed(2) }}</text>
							<view class="add-to-cart" @click.stop="addToCart(good)">
								<image src="../../static/images/购物车.png" />
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="loading-more" v-if="loading">
				<uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			
			<view class="no-more" v-if="hasMore === false && goodsList.length > 0">
				<text>已经到底啦~</text>
			</view>
			
			<view class="empty-list" v-if="goodsList.length === 0 && !loading">
				<image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
				<text>暂无商品</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { listGoodInfoVOByPage } from '../../api/goodInfo';
import { listGoodsType } from '../../api/goodsType';
import { listUserShoppingcart, doShoppingcart } from '../../api/shoppingcart';
import GuideAssistant from '../../components/GuideAssistant.vue';
import type { GoodInfoVO, GoodInfoQueryRequest, GoodsType } from '../../api/types';

// 购物车商品数量
const cartCount = ref(0);

// 商品分类
const goodsTypes = ref<GoodsType[]>([]);

// 当前选中的分类ID数组（多选）
const selectedCategories = ref<number[]>([]);

// 商品列表
const goodsList = ref<GoodInfoVO[]>([]);

// 搜索文本
const searchText = ref('');

// 加载状态
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);

// 分页参数
const current = ref(1);
const pageSize = ref(10);

// 检查分类是否已选中
const isSelected = (id: number): boolean => {
	return selectedCategories.value.includes(id);
};

// 搜索商品
const searchGoods = async () => {
	// 重置分页参数
	current.value = 1;
	hasMore.value = true;
	goodsList.value = [];
	
	// 加载商品
	await loadGoods();
};

// 选择全部分类
const selectAllCategories = async () => {
	if (selectedCategories.value.length === 0) return;
	
	selectedCategories.value = [];
	
	// 重置分页参数
	current.value = 1;
	hasMore.value = true;
	goodsList.value = [];
	
	// 加载商品
	await loadGoods();
};

// 切换分类选择状态
const toggleCategory = async (categoryId: number) => {
	const index = selectedCategories.value.indexOf(categoryId);
	
	if (index === -1) {
		// 添加分类
		selectedCategories.value.push(categoryId);
	} else {
		// 移除分类
		selectedCategories.value.splice(index, 1);
	}
	console.log(selectedCategories.value);
	// 重置分页参数
	current.value = 1;
	hasMore.value = true;
	goodsList.value = [];
	
	// 加载商品
	await loadGoods();
};

// 加载商品数据
const loadGoods = async () => {
	if (loading.value || !hasMore.value) return;
	
	try {
		loading.value = true;
		
		// 构建查询参数
		const params: GoodInfoQueryRequest = {
			current: current.value,
			pageSize: pageSize.value
		};
		
		// 添加搜索关键词
		if (searchText.value) {
			params.searchText = searchText.value;
		}
		
		// 添加商品分类ID
		if (selectedCategories.value.length > 0) {
			params.typeId = selectedCategories.value;
		}
		
		// 请求数据
		const { data } = await listGoodInfoVOByPage(params);
		
		if (data) {
			if (current.value === 1) {
				goodsList.value = data.records;
			} else {
				goodsList.value = [...goodsList.value, ...data.records];
			}
			
			// 更新分页状态
			current.value++;
			hasMore.value = goodsList.value.length < data.total;
		}
	} catch (error) {
		console.error('获取商品列表失败', error);
		uni.showToast({
			title: '获取商品列表失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
		refreshing.value = false;
	}
};

// 加载更多
const loadMore = () => {
	if (!loading.value && hasMore.value) {
		loadGoods();
	}
};

// 下拉刷新
const onRefresh = async () => {
	refreshing.value = true;
	current.value = 1;
	hasMore.value = true;
	await loadGoods();
};

// 加载商品类型
const loadGoodsTypes = async () => {
	try {
		const { data } = await listGoodsType();
		
		if (data) {
			goodsTypes.value = data;
		}
	} catch (error) {
		console.error('获取商品类型失败', error);
	}
};

// 加载购物车
const loadCartCount = async () => {
	try {
		const { data } = await listUserShoppingcart();
		
		if (data) {
			cartCount.value = data.length;
		}
	} catch (error) {
		console.error('获取购物车失败', error);
	}
};

// 添加到购物车
const addToCart = async (good: GoodInfoVO) => {
	try {
		uni.showLoading({
			title: '添加中...'
		});
		
		const { data } = await doShoppingcart({
			goodsId: good.id,
			goodsNum: 1
		});
		
		if (data) {
			uni.showToast({
				title: '已加入购物车',
				icon: 'success'
			});
			
			// 重新加载购物车数量
			await loadCartCount();
		}
	} catch (error) {
		console.error('添加到购物车失败', error);
		uni.showToast({
			title: '添加失败，请重试',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 跳转到商品详情
const goToGoodDetail = (good: GoodInfoVO) => {
	uni.navigateTo({
		url: `/pages/shop/good-detail?id=${good.id}`
	});
};

// 跳转到购物车
const goToCart = () => {
	uni.navigateTo({
		url: '/pages/shop/shopping-cart'
	});
};

// 页面加载
onMounted(async () => {
	await Promise.all([loadGoods(), loadGoodsTypes(), loadCartCount()]);
});
</script>

<style>
.shop-container {
	min-height: 100vh;
	background-color: #f5f7fa;
}

image{
  width: 80%;
  height: 80%;
}

/* 搜索栏样式 */
.search-bar {
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

.search-box {
	flex: 1;
	height: 70rpx;
	background-color: #f5f7fa;
	border-radius: 35rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	margin-right: 30rpx;
}

.search-box input {
	flex: 1;
	height: 70rpx;
	font-size: 28rpx;
	margin-left: 10rpx;
}

.cart-icon {
	position: relative;
	width: 60rpx;
	height: 60rpx;
	padding: 10rpx;
}

.cart-badge {
	position: absolute;
	top: 0;
	right: 0;
	background-color: #ff4d4f;
	color: #fff;
	font-size: 20rpx;
	border-radius: 50%;
	min-width: 32rpx;
	height: 32rpx;
	line-height: 32rpx;
	text-align: center;
}

/* 分类滚动区域 */
.category-scroll {
	width: 100%;
	background-color: #fff;
	white-space: nowrap;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-list {
	display: flex;
	padding: 20rpx 20rpx;
}

.category-item {
	padding: 10rpx 30rpx;
	margin-right: 20rpx;
	background-color: #f5f7fa;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #666;
	transition: all 0.3s;
}

.category-item.active {
	background-color: #2d8cf0;
	color: #fff;
}

/* 商品列表区域 */
.goods-scroll {
	flex: 1;
	height: calc(100vh - 200rpx);
}

.goods-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 20rpx;
}

.goods-item {
	width: calc(50% - 20rpx);
	margin: 10rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.goods-image {
	width: 100%;
	height: 300rpx;
}

.goods-info {
	padding: 20rpx;
}

.goods-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.goods-price-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.goods-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #ff4d4f;
}

.add-to-cart {
	width: 50rpx;
	height: 50rpx;
	background-color: #2d8cf0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 加载更多区域 */
.loading-more, .no-more, .empty-list {
	padding: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #999;
	font-size: 24rpx;
}

.loading-more uni-icons {
	margin-right: 10rpx;
}

.empty-list {
	flex-direction: column;
	padding: 100rpx 30rpx;
}

.empty-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}
</style> 
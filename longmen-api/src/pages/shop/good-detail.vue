<template>
	<view class="good-detail-container">
		<!-- 商品图片 -->
		<swiper class="goods-swiper" indicator-dots circular autoplay>
			<swiper-item>
				<image class="goods-image" :src="good.cover" mode="aspectFill"></image>
			</swiper-item>
		</swiper>
		
		<!-- 商品信息 -->
		<view class="goods-info-card">
			<view class="goods-price">¥{{ good.price?.toFixed(2) }}</view>
			<view class="goods-name">{{ good.name }}</view>
			<view class="goods-stock">
				<text>库存：{{ good.stock }}</text>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="goods-detail-card">
			<view class="card-title">商品详情</view>
			<view class="goods-content">
				<rich-text :nodes="good.content || '暂无详情'"></rich-text>
			</view>
		</view>
		
		<!-- 底部购买栏 -->
		<view class="bottom-action-bar">
			<view class="action-buttons">
				<view class="action-item home" @click="goToHome">
					<uni-icons type="home" size="22" color="#666"></uni-icons>
					<text>首页</text>
				</view>
				<view class="action-item cart" @click="goToCart">
					<uni-icons type="cart" size="22" color="#666"></uni-icons>
					<text>购物车</text>
					<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
				</view>
			</view>
			
			<view class="buy-buttons">
				<button class="add-to-cart-btn" @click="addToCart">加入购物车</button>
				<button class="buy-now-btn" @click="buyNow">立即购买</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getGoodVO } from '../../api/goodInfo';
import { listUserShoppingcart, doShoppingcart } from '../../api/shoppingcart';
import type { GoodInfoVO } from '../../api/types';

// 商品信息
const good = ref<GoodInfoVO>({
	id: 0,
	content: '',
	cover: '',
	name: '',
	price: 0,
	stock: 0,
	typeId: 0
});

// 购物车商品数量
const cartCount = ref(0);

// 商品数量
const quantity = ref(1);

// 加载商品数据
const loadGoodDetail = async (id: number) => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const { data } = await getGoodVO(id);
		
		if (data) {
			good.value = data;
		} else {
			uni.showToast({
				title: '商品不存在',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取商品详情失败', error);
		uni.showToast({
			title: '获取商品详情失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
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
const addToCart = async () => {
	if (good.value.stock <= 0) {
		uni.showToast({
			title: '商品库存不足',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '添加中...'
		});
		
		const { data } = await doShoppingcart({
			goodsId: good.value.id,
			goodsNum: quantity.value
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

// 立即购买
const buyNow = () => {
	if (good.value.stock <= 0) {
		uni.showToast({
			title: '商品库存不足',
			icon: 'none'
		});
		return;
	}
	
	// 添加到购物车后跳转到购物车页面
	addToCart().then(() => {
		uni.navigateTo({
			url: '/pages/shop/shopping-cart'
		});
	});
};

// 跳转到首页
const goToHome = () => {
	uni.switchTab({
		url: '/pages/index/index'
	});
};

// 跳转到购物车
const goToCart = () => {
	uni.navigateTo({
		url: '/pages/shop/shopping-cart'
	});
};

// 页面加载
onMounted(() => {
	// 获取页面参数
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	// @ts-ignore - 忽略类型检查
	const options = currentPage?.options || currentPage?.$page?.options || {};
	
	console.log('商品详情页参数:', options);
	
	if (options.id) {
		const id = parseInt(options.id);
		loadGoodDetail(id);
		loadCartCount();
	} else {
		uni.showToast({
			title: '商品ID不存在',
			icon: 'none'
		});
	}
});
</script>

<style>
.good-detail-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 100rpx;
}

/* 商品轮播图 */
.goods-swiper {
	width: 100%;
	height: 750rpx;
}

.goods-image {
	width: 100%;
	height: 100%;
}

/* 商品信息卡片 */
.goods-info-card {
	margin-top: -20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	position: relative;
}

.goods-price {
	font-size: 48rpx;
	font-weight: bold;
	color: #ff4d4f;
	margin-bottom: 20rpx;
}

.goods-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
	line-height: 1.4;
}

.goods-stock {
	font-size: 24rpx;
	color: #999;
}

/* 商品详情卡片 */
.goods-detail-card {
	margin: 20rpx 0;
	padding: 30rpx;
	background-color: #fff;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
	position: relative;
	padding-left: 20rpx;
}

.card-title:before {
	content: '';
	position: absolute;
	left: 0;
	top: 10rpx;
	width: 8rpx;
	height: 30rpx;
	background-color: #2d8cf0;
	border-radius: 4rpx;
}

.goods-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
}

/* 底部购买栏 */
.bottom-action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	display: flex;
	align-items: center;
	padding: 20rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.action-buttons {
	display: flex;
	margin-right: 20rpx;
}

.action-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 20rpx;
	position: relative;
}

.action-item text {
	font-size: 20rpx;
	color: #666;
	margin-top: 6rpx;
}

.cart-badge {
	position: absolute;
	top: -10rpx;
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

.buy-buttons {
	flex: 1;
	display: flex;
}

.add-to-cart-btn, .buy-now-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	font-size: 28rpx;
	border-radius: 40rpx;
	margin: 0 10rpx;
}

.add-to-cart-btn {
	background-color: #ffecec;
	color: #ff4d4f;
	border: 1rpx solid #ff4d4f;
}

.buy-now-btn {
	background: linear-gradient(135deg, #ff7676 0%, #ff4d4f 100%);
	color: #fff;
}
</style> 
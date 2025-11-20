<template>
	<view class="cart-container">
		<!-- 购物车为空的状态 -->
		<view class="empty-cart" v-if="!cartItems.length">
			<image class="empty-image" src="/static/images/empty-cart.png" mode="aspectFit"></image>
			<text class="empty-text">购物车还是空的</text>
			<button class="go-shopping-btn" @click="goToShopping">去逛逛</button>
		</view>
		
		<!-- 购物车有商品的状态 -->
		<block v-else>
			<!-- 购物车商品列表 -->
			<view class="cart-list">
				<view 
					v-for="(item, index) in cartItems" 
					:key="item.id"
					class="cart-item"
				>
					<view class="item-main">
						<image class="item-image" :src="item.goodsCover" mode="aspectFill"></image>
						<view class="item-info">
							<text class="item-name">{{ item.goodsName }}</text>
							<text class="item-price">¥{{ item.goodsPrice }}</text>
						</view>
						<view class="item-quantity">
							<view class="quantity-btn minus" @click="decreaseQuantity(item)">-</view>
							<text class="quantity-value">{{ item.goodsNum }}</text>
							<view class="quantity-btn plus" @click="increaseQuantity(item)">+</view>
						</view>
					</view>
					<view class="item-footer">
						<view class="delete-btn" @click="removeCartItem(item.goodsId)">
							<uni-icons type="trash" size="16" color="#999"></uni-icons>
							<text>删除</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部结算栏 -->
			<view class="checkout-bar">
				<view class="price-info">
					<text class="total-label">合计:</text>
					<text class="total-price">¥{{ totalPrice }}</text>
				</view>
				<button class="checkout-btn" @click="goToCheckout">结算({{ totalQuantity }})</button>
			</view>
		</block>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { listUserShoppingcart, doShoppingcart, removeShoppingcart } from '../../api/shoppingcart';
import type { ShoppingcartVO, ShoppingcartAddRequest } from '../../api/types';

// 购物车商品列表
const cartItems = ref<ShoppingcartVO[]>([]);

// 是否正在加载
const loading = ref(false);

// 计算总价
const totalPrice = computed(() => {
	return cartItems.value.reduce((sum, item) => sum + item.goodsPrice * item.goodsNum, 0).toFixed(2);
});

// 计算总数量
const totalQuantity = computed(() => {
	return cartItems.value.reduce((sum, item) => sum + item.goodsNum, 0);
});

// 加载购物车数据
const loadCartItems = async () => {
	if (loading.value) return;
	
	loading.value = true;
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const { data } = await listUserShoppingcart();
		
		if (data) {
			cartItems.value = data;
		}
	} catch (error) {
		console.error('获取购物车失败', error);
		uni.showToast({
			title: '获取购物车失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
		loading.value = false;
	}
};

// 增加商品数量
const increaseQuantity = async (item: ShoppingcartVO) => {
	if (item.goodsNum >= item.goodsStock) {
		uni.showToast({
			title: '已达到最大库存',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '更新中...'
		});
		
		const request: ShoppingcartAddRequest = {
			goodsId: item.goodsId,
			goodsNum: item.goodsNum + 1
		};
		
		const { data } = await doShoppingcart(request);
		
		if (data) {
			// 更新本地数据
			item.goodsNum += 1;
			uni.hideLoading();
		}
	} catch (error) {
		console.error('更新购物车失败', error);
		uni.hideLoading();
		uni.showToast({
			title: '更新失败',
			icon: 'none'
		});
	}
};

// 减少商品数量
const decreaseQuantity = async (item: ShoppingcartVO) => {
	if (item.goodsNum <= 1) {
		// 数量为1时，询问是否删除
		uni.showModal({
			title: '提示',
			content: '确定要移除该商品吗？',
			success: (res) => {
				if (res.confirm) {
					removeCartItem(item.goodsId);
				}
			}
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '更新中...'
		});
		
		const request: ShoppingcartAddRequest = {
			goodsId: item.goodsId,
			goodsNum: item.goodsNum - 1
		};
		
		const { data } = await doShoppingcart(request);
		
		if (data) {
			// 更新本地数据
			item.goodsNum -= 1;
			uni.hideLoading();
		}
	} catch (error) {
		console.error('更新购物车失败', error);
		uni.hideLoading();
		uni.showToast({
			title: '更新失败',
			icon: 'none'
		});
	}
};

// 移除购物车项
const removeCartItem = async (goodsId: number) => {
	try {
		uni.showLoading({
			title: '删除中...'
		});
		
		// 调用后端API移除商品（通过将数量设置为0）
		const request: ShoppingcartAddRequest = {
			goodsId: goodsId,
			goodsNum: 0
		};
		
		const { data } = await doShoppingcart(request);
		
		if (data) {
			// 从本地数据中移除
			cartItems.value = cartItems.value.filter(item => item.goodsId !== goodsId);
			
			uni.hideLoading();
			uni.showToast({
				title: '已删除',
				icon: 'success'
			});
		}
	} catch (error) {
		console.error('删除购物车项失败', error);
		uni.hideLoading();
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		});
	}
};

// 跳转到商城页面
const goToShopping = () => {
	uni.navigateTo({
		url: '/pages/product/product-list'
	});
};

// 跳转到结算页面
const goToCheckout = () => {
	if (cartItems.value.length === 0) {
		uni.showToast({
			title: '购物车为空',
			icon: 'none'
		});
		return;
	}
	
	// 跳转到结算页面，这里仅作为示例
	uni.showToast({
		title: '结算功能开发中',
		icon: 'none'
	});
};

// 页面加载时
onMounted(() => {
	loadCartItems();
});

// 每次页面显示时刷新购物车数据
onShow(() => {
	loadCartItems();
});
</script>

<style>
.cart-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 120rpx;
}

/* 空购物车样式 */
.empty-cart {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 100rpx;
}

.empty-image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #999;
	margin-bottom: 40rpx;
}

.go-shopping-btn {
	width: 260rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 30rpx;
	border-radius: 40rpx;
}

/* 购物车列表样式 */
.cart-list {
	padding: 20rpx;
}

.cart-item {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.item-main {
	display: flex;
	padding: 30rpx;
	align-items: center;
}

.item-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 8rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
}

.item-info {
	flex: 1;
	overflow: hidden;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.item-price {
	font-size: 32rpx;
	color: #ff6b00;
	font-weight: bold;
}

.item-quantity {
	display: flex;
	align-items: center;
}

.quantity-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	background-color: #f0f0f0;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 36rpx;
	color: #666;
}

.quantity-btn.minus {
	font-size: 40rpx;
	line-height: 54rpx;
}

.quantity-btn.plus {
	font-size: 40rpx;
	line-height: 52rpx;
}

.quantity-value {
	width: 80rpx;
	text-align: center;
	font-size: 30rpx;
	color: #333;
}

.item-footer {
	display: flex;
	justify-content: flex-end;
	padding: 0 30rpx 30rpx;
}

.delete-btn {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	color: #999;
}

.delete-btn text {
	margin-left: 4rpx;
}

/* 结算栏样式 */
.checkout-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.price-info {
	display: flex;
	align-items: baseline;
}

.total-label {
	font-size: 28rpx;
	color: #666;
	margin-right: 10rpx;
}

.total-price {
	font-size: 36rpx;
	font-weight: 600;
	color: #f56c6c;
}

.checkout-btn {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 40rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 28rpx;
	border-radius: 40rpx;
}
</style> 
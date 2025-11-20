<template>
	<view class="user-container">
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<view class="user-avatar-wrapper" @click="goToEditProfile">
				<image class="user-avatar" :src="userInfo.userAvatar || defaultAvatar" mode="aspectFill"></image>
				<view class="edit-avatar-icon">
					<image src="../../static/照相机.png" />
				</view>
			</view>
			<view class="user-details">
				<text class="username">{{ userInfo.userName || '游客' }}</text>
				<text class="account">账号: {{ userInfo.userAccount || '未登录' }}</text>
			</view>
		</view>
		
		<!-- 功能菜单区域 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToShoppingCart">
				<view class="menu-icon cart-icon">
					<image src="../../static/images/购物车.png" />
				</view>
				<text class="menu-text">我的购物车</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
			
			<view class="menu-item">
				<view class="menu-icon ticket-icon">
					<image src="../../static/取票.png" />
				</view>
				<text class="menu-text">我的门票</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
			
			<view class="menu-item">
				<view class="menu-icon settings-icon">
					<image src="../../static/设置.png" />
				</view>
				<text class="menu-text">设置</text>
				<uni-icons type="right" size="18" color="#ccc"></uni-icons>
			</view>
		</view>
		
		<!-- 退出登录按钮 -->
		<view class="logout-section" v-if="isLogged">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
		
		<!-- 登录提示 -->
		<view class="login-tip" v-else>
			<button class="login-btn" @click="goToLogin">立即登录</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getLoginUser, userLogout } from '../../api/user';
import type { UserVO } from '../../api/types';

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png';

// 用户信息
const userInfo = ref<UserVO>({
	createTime: '',
	gender: 0,
	id: 0,
	updateTime: '',
	userAccount: '',
	userAvatar: '',
	userName: '',
	userRole: '',
	age: 0
});

// 是否已登录
const isLogged = computed(() => userInfo.value.id > 0);

// 加载用户信息
const loadUserInfo = async () => {
	try {
		uni.showLoading({
			title: '加载中'
		});
		
		const { data } = await getLoginUser();
		if (data) {
			userInfo.value = data;
			uni.setStorageSync('userInfo', JSON.stringify(data));
		} else {
			// 如果服务器返回空数据，可能是未登录状态
			resetUserInfo();
		}
	} catch (error) {
		console.error('获取用户信息失败', error);
		// 获取失败时，尝试从本地获取
		const storedUserInfo = uni.getStorageSync('userInfo');
		if (storedUserInfo) {
			try {
				userInfo.value = JSON.parse(storedUserInfo);
			} catch (e) {
				console.error('解析用户信息失败', e);
				resetUserInfo();
			}
		} else {
			resetUserInfo();
		}
	} finally {
		uni.hideLoading();
	}
};

// 重置用户信息
const resetUserInfo = () => {
	userInfo.value = {
		createTime: '',
		gender: 0,
		id: 0,
		updateTime: '',
		userAccount: '',
		userAvatar: '',
		userName: '',
		userRole: '',
		age: 0
	};
	// 清除本地存储
	uni.removeStorageSync('userInfo');
};

// 跳转到购物车页面
const goToShoppingCart = () => {
	if (!isLogged.value) {
		showNotLoggedInModal();
		return;
	}
	
	uni.navigateTo({
		url: '/pages/shop/shopping-cart'
	});
};

// 跳转到个人信息编辑页面
const goToEditProfile = () => {
	if (!isLogged.value) {
		showNotLoggedInModal();
		return;
	}
	
	uni.navigateTo({
		url: '/pages/user/edit-profile'
	});
};

// 处理退出登录
const handleLogout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({
						title: '正在退出'
					});
					
					await userLogout();
					
					// 清除本地存储的用户信息
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('sessionId');
					uni.removeStorageSync('userId');
					
					// 重置用户信息
					resetUserInfo();
					
					// 提示退出成功
					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					});
				} catch (error) {
					console.error('退出登录失败', error);
					uni.showToast({
						title: '退出失败，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
		}
	});
};

// 跳转到登录页面
const goToLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	});
};

// 显示未登录提示
const showNotLoggedInModal = () => {
	uni.showModal({
		title: '提示',
		content: '您还未登录，是否立即登录？',
		success: (res) => {
			if (res.confirm) {
				goToLogin();
			}
		}
	});
};

// 每次页面显示时都刷新用户信息
onShow(() => {
	// 从服务器获取最新用户信息
	loadUserInfo();
});

// 页面加载
onMounted(() => {
	// 尝试从本地存储获取用户信息
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		try {
			userInfo.value = JSON.parse(storedUserInfo);
		} catch (e) {
			console.error('解析用户信息失败', e);
		}
	}
	
	// 从服务器获取最新用户信息
	loadUserInfo();
});
</script>

<style>
.user-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 40rpx;
}

/* 用户信息区域样式 */
.user-info-section {
	height: 300rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	display: flex;
	align-items: center;
	padding: 0 40rpx;
	position: relative;
}

.user-avatar-wrapper {
	position: relative;
	margin-right: 30rpx;
}

.user-avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.6);
}

.edit-avatar-icon {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 48rpx;
	height: 48rpx;
	background-color: #2d8cf0;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 2rpx solid #fff;
}

.user-details {
	display: flex;
	flex-direction: column;
}

.username {
	font-size: 36rpx;
	font-weight: 600;
	color: #fff;
	margin-bottom: 10rpx;
}

.account {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 菜单区域样式 */
.menu-section {
	margin: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.menu-item {
	height: 110rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 20rpx;
	background-color: rgba(0, 0, 0, 0.1);
}

.menu-text {
	flex: 1;
	font-size: 30rpx;
	color: #333;
}

/* 退出登录按钮样式 */
.logout-section {
	margin: 30rpx;
}

.logout-btn {
	height: 90rpx;
	line-height: 90rpx;
	background-color: #fff;
	color: #f56c6c;
	font-size: 32rpx;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 登录提示样式 */
.login-tip {
	margin: 60rpx 30rpx;
	text-align: center;
}

.login-btn {
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 32rpx;
	border-radius: 45rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

image{
	width: 80%;
	height: 80%;
}
</style>

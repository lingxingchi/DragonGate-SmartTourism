<template>
	<view class="edit-profile-container">
		<view class="avatar-section">
			<view class="avatar-title">头像</view>
			<view class="avatar-content" @click="chooseAvatar">
				<image class="avatar-image" :src="userInfo.userAvatar || defaultAvatar" mode="aspectFill"></image>
				<view class="avatar-hint">
					<text>点击更换头像</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>
		</view>
		
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<input class="form-input" type="text" v-model="userInfo.userName" placeholder="请输入用户名" />
			</view>
			
			<view class="form-item">
				<text class="form-label">账号</text>
				<input class="form-input" type="text" v-model="userInfo.userAccount" placeholder="请输入账号" disabled />
			</view>
			
			<view class="form-item">
				<text class="form-label">性别</text>
				<picker class="form-picker" :value="userInfo.gender" :range="genderOptions" @change="handleGenderChange">
					<view class="picker-value">
						{{ genderOptions[userInfo.gender] }}
						<uni-icons type="down" size="16" color="#ccc"></uni-icons>
					</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="form-label">年龄</text>
				<input class="form-input" type="number" v-model="userInfo.age" placeholder="请输入年龄" />
			</view>
			
			<view class="form-item">
				<text class="form-label">修改密码</text>
				<view class="form-link" @click="goToChangePassword">
					<text>修改</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>
		</view>
		
		<view class="submit-section">
			<button class="submit-btn" @click="saveProfile">保存修改</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getLoginUser, updateUser } from '../../api/user';
import type { UserVO, UserUpdateRequest } from '../../api/types';

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png';

// 性别选项
const genderOptions = ['男', '女'];

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

// 初始化
onMounted(async () => {
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
	await loadUserInfo();
});

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
		}
	} catch (error) {
		console.error('获取用户信息失败', error);
	} finally {
		uni.hideLoading();
	}
};

// 选择头像
const chooseAvatar = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			// 这里应该上传图片到服务器，然后更新用户头像
			// 现在先简单模拟，直接使用本地路径
			const tempFilePath = res.tempFilePaths[0];
			
			// 上传头像的逻辑，这里仅作为示例
			// 实际开发中，应该调用上传API，获取到图片URL
			uni.showLoading({
				title: '上传中...'
			});
			
			// 模拟上传
			setTimeout(() => {
				userInfo.value.userAvatar = tempFilePath;
				uni.hideLoading();
				uni.showToast({
					title: '头像已更新',
					icon: 'success'
				});
			}, 1000);
		}
	});
};

// 处理性别变更
const handleGenderChange = (e: any) => {
	userInfo.value.gender = parseInt(e.detail.value);
};

// 保存个人信息
const saveProfile = async () => {
	if (!userInfo.value.userName) {
		uni.showToast({
			title: '用户名不能为空',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '保存中...'
		});
		
		const updateRequest: UserUpdateRequest = {
			id: userInfo.value.id,
			userName: userInfo.value.userName,
			userAvatar: userInfo.value.userAvatar,
			gender: userInfo.value.gender,
			age: userInfo.value.age
		};
		
		const { data } = await updateUser(updateRequest);
		
		if (data) {
			// 更新本地存储
			uni.setStorageSync('userInfo', JSON.stringify(userInfo.value));
			
			uni.showToast({
				title: '保存成功',
				icon: 'success',
				success: () => {
					// 返回上一页
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			});
		} else {
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('更新用户信息失败', error);
		uni.showToast({
			title: '保存失败，请重试',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 跳转到修改密码页面
const goToChangePassword = () => {
	uni.navigateTo({
		url: '/pages/user/change-password'
	});
};
</script>

<style>
.edit-profile-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding: 30rpx 0;
}

/* 头像部分 */
.avatar-section {
	margin: 0 30rpx 30rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.avatar-title {
	font-size: 30rpx;
	color: #333;
	margin-bottom: 30rpx;
	font-weight: 500;
}

.avatar-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.avatar-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	border: 2rpx solid #f0f0f0;
}

.avatar-hint {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: #999;
}

/* 表单部分 */
.form-section {
	margin: 0 30rpx 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	width: 180rpx;
	font-size: 30rpx;
	color: #333;
}

.form-input {
	flex: 1;
	height: 60rpx;
	font-size: 28rpx;
	color: #333;
}

.form-picker {
	flex: 1;
}

.picker-value {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 60rpx;
	font-size: 28rpx;
	color: #333;
}

.form-link {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	font-size: 28rpx;
	color: #2d8cf0;
}

/* 提交按钮 */
.submit-section {
	margin: 60rpx 30rpx;
}

.submit-btn {
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 32rpx;
	border-radius: 45rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
</style> 
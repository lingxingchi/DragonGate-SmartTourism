<template>
	<view class="change-password-container">
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">原密码</text>
				<input class="form-input" type="password" v-model="oldPassword" placeholder="请输入原密码" password />
			</view>
			
			<view class="form-item">
				<text class="form-label">新密码</text>
				<input class="form-input" type="password" v-model="newPassword" placeholder="请输入新密码" password />
			</view>
			
			<view class="form-item">
				<text class="form-label">确认密码</text>
				<input class="form-input" type="password" v-model="confirmPassword" placeholder="请再次输入新密码" password />
			</view>
		</view>
		
		<view class="tips-section">
			<text class="tips-text">• 密码长度为6-20位字符</text>
			<text class="tips-text">• 建议使用字母、数字和符号的组合</text>
			<text class="tips-text">• 密码区分大小写</text>
		</view>
		
		<view class="submit-section">
			<button class="submit-btn" @click="changePassword">确认修改</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { updateUser } from '../../api/user';
import type { UserUpdateRequest } from '../../api/types';

// 密码字段
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// 修改密码
const changePassword = async () => {
	// 表单验证
	if (!oldPassword.value) {
		uni.showToast({
			title: '请输入原密码',
			icon: 'none'
		});
		return;
	}
	
	if (!newPassword.value) {
		uni.showToast({
			title: '请输入新密码',
			icon: 'none'
		});
		return;
	}
	
	if (newPassword.value.length < 6 || newPassword.value.length > 20) {
		uni.showToast({
			title: '密码长度应为6-20位',
			icon: 'none'
		});
		return;
	}
	
	if (newPassword.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		});
		return;
	}
	
	// 获取用户ID
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (!storedUserInfo) {
		uni.showToast({
			title: '用户信息获取失败',
			icon: 'none'
		});
		return;
	}
	
	const userInfo = JSON.parse(storedUserInfo);
	
	try {
		uni.showLoading({
			title: '修改中...'
		});
		
		const updateRequest: UserUpdateRequest = {
			id: userInfo.id,
			userPassword: newPassword.value
		};
		
		// 这里应该先验证原密码是否正确，
		// 实际开发中可能需要一个单独的验证旧密码的API
		
		const { data } = await updateUser(updateRequest);
		
		if (data) {
			uni.showToast({
				title: '密码修改成功',
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
				title: '密码修改失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('修改密码失败', error);
		uni.showToast({
			title: '修改失败，请重试',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};
</script>

<style>
.change-password-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding: 30rpx 0;
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
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.form-input {
	width: 100%;
	height: 80rpx;
	background-color: #f5f7fa;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

/* 提示部分 */
.tips-section {
	margin: 20rpx 40rpx;
}

.tips-text {
	display: block;
	font-size: 24rpx;
	color: #999;
	line-height: 1.8;
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
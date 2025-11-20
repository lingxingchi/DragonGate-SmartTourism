<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">畅游龙门</text>
    </view>
    
    <view class="login-form">
      <view class="input-group">
        <text class="input-label">用户名</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            type="text" 
            v-model="userAccount" 
            placeholder="请输入用户名" 
            placeholder-class="placeholder"
          />
        </view>
      </view>
      
      <view class="input-group">
        <text class="input-label">密码</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            type="text"
            :password="!showPassword"
            v-model="userPassword" 
            placeholder="请输入密码" 
            placeholder-class="placeholder"
          />
          <text 
            class="password-toggle" 
            @click="togglePasswordVisibility"
          >{{ showPassword ? '隐藏' : '显示' }}</text>
        </view>
      </view>
      
      <button class="login-btn" hover-class="btn-hover" @click="handleLogin">登 录</button>
      
      <view class="other-options">
        <text class="register-link" @click="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { userLogin } from '../../api/user';
import { onLoad } from '@dcloudio/uni-app';

// 表单数据
const userAccount = ref('');
const userPassword = ref('');
const showPassword = ref(false);

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!userAccount.value) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  if (!userPassword.value) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }

  // 显示加载
  uni.showLoading({
    title: '登录中...'
  });

  try {
    // 调用登录API
    const res = await userLogin({
      userAccount: userAccount.value,
      userPassword: userPassword.value
    });

    // 隐藏加载
    uni.hideLoading();

    // 处理登录结果
    if (res.code === 0 && res.data) {
      // 存储用户信息 - token和sessionID已在request模块中自动处理
      uni.setStorageSync('userInfo', JSON.stringify(res.data));
      
      // 提示登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 延迟跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } else {
      // 登录失败
      uni.showToast({
        title: res.message || '登录失败，请检查账号密码',
        icon: 'none'
      });
    }
  } catch (error) {
    // 隐藏加载
    uni.hideLoading();
    
    // 显示错误
    uni.showToast({
      title: '登录异常，请稍后再试',
      icon: 'none'
    });
    console.error('登录异常:', error);
  }
};

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  });
};

// 页面加载时检查是否已登录
onLoad(() => {
  console.log('登录页面已加载');
});
</script>

<style>
/* 图标字体引用 */
@font-face {
  font-family: 'iconfont';
  src: url('https://at.alicdn.com/t/font_2514585_3pkj0lkxlpp.woff2') format('woff2');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 40rpx;
  font-style: normal;
  color: #999;
  margin-right: 20rpx;
}

.icon-user:before {
  content: "\e7ae";
}

.icon-lock:before {
  content: "\e7c9";
}

.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 40rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.logo {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 30rpx;
  border-radius: 20rpx;
}

.title {
  font-size: 56rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  letter-spacing: 1rpx;
}

.login-form {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input-wrapper {
  display: flex;
  align-items: center;
  height: 96rpx;
  border-bottom: 1px solid #eaeaea;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #2d8cf0;
}

.input {
  flex: 1;
  height: 96rpx;
  font-size: 32rpx;
  color: #333;
}

.password-toggle {
  font-size: 28rpx;
  color: #2d8cf0;
  padding: 0 10rpx;
}

.placeholder {
  color: #bbb;
}

.login-btn {
  margin-top: 60rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  letter-spacing: 4rpx;
  font-weight: 500;
  transition: transform 0.2s;
}

.btn-hover {
  transform: translateY(2rpx);
}

.other-options {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}

.register-link {
  font-size: 28rpx;
  color: #2d8cf0;
  padding: 10rpx;
}

.footer {
  margin-top: auto;
  padding: 30rpx 0;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #999;
}
</style> 
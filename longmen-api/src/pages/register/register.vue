<template>
  <view class="register-container">
    <view class="register-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">畅游龙门</text>
      <text class="subtitle">加入我们，畅享旅游体验</text>
    </view>
    
    <view class="register-form">
      <view class="input-group">
        <text class="input-label">用户名</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            type="text" 
            v-model="userAccount" 
            placeholder="请输入用户名(至少4个字符)" 
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
            placeholder="请输入密码(至少6个字符)" 
            placeholder-class="placeholder"
          />
          <text 
            class="password-toggle" 
            @click="togglePasswordVisibility"
          >{{ showPassword ? '隐藏' : '显示' }}</text>
        </view>
      </view>
      
      <view class="input-group">
        <text class="input-label">确认密码</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            type="text"
            :password="!showConfirmPassword" 
            v-model="checkPassword" 
            placeholder="请再次输入密码" 
            placeholder-class="placeholder"
          />
          <text 
            class="password-toggle" 
            @click="toggleConfirmPasswordVisibility"
          >{{ showConfirmPassword ? '隐藏' : '显示' }}</text>
        </view>
      </view>
      
      <button class="register-btn" hover-class="btn-hover" @click="handleRegister">注 册</button>
      
      <view class="other-options">
        <text class="login-link" @click="goToLogin">已有账号？立即登录</text>
      </view>
    </view>
    
    <view class="footer">
      <text class="footer-text">畅游龙门 © 2024</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { user } from '../../api';

// 表单数据
const userAccount = ref('');
const userPassword = ref('');
const checkPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 切换确认密码可见性
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!userAccount.value) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  if (userAccount.value.length < 4) {
    uni.showToast({
      title: '用户名至少4个字符',
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
  if (userPassword.value.length < 6) {
    uni.showToast({
      title: '密码至少6个字符',
      icon: 'none'
    });
    return;
  }
  if (userPassword.value !== checkPassword.value) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    });
    return;
  }

  // 显示加载
  uni.showLoading({
    title: '注册中...'
  });

  try {
    // 调用注册API
    const res = await user.userRegister({
      userAccount: userAccount.value,
      userPassword: userPassword.value,
      checkPassword: checkPassword.value
    });

    // 隐藏加载
    uni.hideLoading();

    // 处理注册结果
    if (res.code === 0 && res.data) {
      // 提示注册成功
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    } else {
      // 注册失败
      uni.showToast({
        title: res.message || '注册失败，请稍后再试',
        icon: 'none'
      });
    }
  } catch (error) {
    // 隐藏加载
    uni.hideLoading();
    
    // 显示错误
    uni.showToast({
      title: '注册异常，请稍后再试',
      icon: 'none'
    });
    console.error('注册异常:', error);
  }
};

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  });
};
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

.register-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 40rpx;
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
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

.register-form {
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

.register-btn {
  margin-top: 60rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  box-shadow: 0 10rpx 20rpx rgba(45, 140, 240, 0.2);
  letter-spacing: 4rpx;
  font-weight: 500;
  transition: transform 0.2s;
}

.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 5rpx 10rpx rgba(45, 140, 240, 0.2);
}

.other-options {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}

.login-link {
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
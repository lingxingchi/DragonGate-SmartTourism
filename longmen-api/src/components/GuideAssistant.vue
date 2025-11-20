<template>
  <view class="guide-assistant" :class="{ 'guide-assistant-expanded': isExpanded }">
    <!-- 助手浮动按钮 -->
    <view 
      class="assistant-button" 
      @click="toggleAssistant" 
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      :style="buttonStyle"
      v-show="!isExpanded && showAssistant">
      <view class="assistant-avatar">
        <image src="/static/导游.png" mode="aspectFill"></image>
      </view>
      <view class="assistant-hint" v-if="showHint">
        <text>有什么可以帮您？</text>
      </view>
    </view>

    <!-- 对话面板 -->
    <view class="chat-panel" v-show="isExpanded && showAssistant">
      <!-- 面板头部 -->
      <view class="panel-header">
        <text class="panel-title">龙门小龛</text>
        <view class="panel-close" @click="toggleAssistant">
          <icon type="cancel" size="23" color="#fff" />
        </view>
      </view>
      
      <!-- 对话内容 -->
      <scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop" @scrolltolower="onScrollToBottom">
        <view class="chat-messages">
          <!-- 欢迎消息 -->
          <view class="message assistant-message">
            <view class="message-content">
              <text>您好，我是龙门小龛，有任何问题都可以问我！</text>
            </view>
          </view>
          
          <!-- 消息列表 -->
          <view 
            v-for="(message, index) in messages" 
            :key="index" 
            class="message" 
            :class="message.type === 'user' ? 'user-message' : 'assistant-message'"
          >
            <view class="message-content">
              <text>{{ message.content }}</text>
            </view>
          </view>
          
          <!-- 加载状态 -->
          <view class="message assistant-message" v-if="loading">
            <view class="message-content loading-message">
              <view class="loading-dot"></view>
              <view class="loading-dot"></view>
              <view class="loading-dot"></view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 消息输入 -->
      <view class="message-input-area">
        <view class="input-wrapper">
          <input 
            class="message-input" 
            type="text" 
            v-model="userInput"
            placeholder="请输入您的问题"
            confirm-type="send"
            @confirm="sendMessage"
          />
        </view>
        <view class="send-button" :class="{ 'send-active': userInput.trim() }" @click="sendMessage">
          <uni-icons type="paperplane-filled" size="24" :color="userInput.trim() ? '#2d8cf0' : '#bbb'"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';
import { getSystemAi } from '../api/attraction';

// 当前路由
const currentRoute = ref('');

// 排除的页面列表
const excludedPages = ['/pages/login/login', '/pages/register/register', '/pages/user/user'];

// 是否展开助手面板
const isExpanded = ref(false);

// 是否显示提示
const showHint = ref(false);

// 是否显示助手
const showAssistant = ref(true);

// 用户输入
const userInput = ref('');

// 消息列表
const messages = ref<{ type: 'user' | 'assistant', content: string }[]>([]);

// 加载状态
const loading = ref(false);

// 滚动位置
const scrollTop = ref(0);

// 定时器ID
let hintTimer: number | null = null;

// 拖动相关变量
const buttonPosition = ref({ x: 20, y: 160 });
const isDragging = ref(false);
const startPosition = ref({ x: 0, y: 0 });
const windowWidth = ref(uni.getSystemInfoSync().windowWidth);
const windowHeight = ref(uni.getSystemInfoSync().windowHeight);

// 计算按钮样式
const buttonStyle = computed(() => {
  return {
    right: `${buttonPosition.value.x}rpx`,
    bottom: `${buttonPosition.value.y}rpx`
  };
});

// 触摸开始
const onTouchStart = (e: any) => {
  // 记录是否为点击事件
  const touch = e.touches[0];
  startPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  };
  isDragging.value = false;
};

// 触摸移动
const onTouchMove = (e: any) => {
  isDragging.value = true;
  const touch = e.touches[0];
  
  // 计算移动距离
  const deltaX = startPosition.value.x - touch.clientX;
  const deltaY = startPosition.value.y - touch.clientY;
  
  // 更新按钮位置（从右下角计算）
  let newX = buttonPosition.value.x + deltaX / (windowWidth.value / 750); // 转换为rpx
  let newY = buttonPosition.value.y + deltaY / (windowWidth.value / 750); // 转换为rpx
  
  // 限制在屏幕范围内
  newX = Math.max(20, Math.min(newX, 630)); // 假设按钮宽度为100rpx
  newY = Math.max(20, Math.min(newY, 1000)); // 限制最大范围
  
  // 更新位置
  buttonPosition.value = {
    x: newX,
    y: newY
  };
  
  // 更新起始位置
  startPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  };
};

// 触摸结束
const onTouchEnd = (e: any) => {
  // 如果是拖动，阻止点击事件
  if (isDragging.value) {
    e.stopPropagation();
    e.preventDefault();
  }
};

// 切换助手面板显示状态
const toggleAssistant = () => {
  // 如果是拖动结束，不触发展开
  if (isDragging.value) {
    isDragging.value = false;
    return;
  }
  
  isExpanded.value = !isExpanded.value;
  
  // 如果打开面板，清除提示
  if (isExpanded.value) {
    showHint.value = false;
    if (hintTimer !== null) {
      clearTimeout(hintTimer);
      hintTimer = null;
    }
  }
  
  // 滚动到底部
  if (isExpanded.value) {
    scrollToBottom();
  }
};

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim();
  if (!message) return;
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: message
  });
  
  // 清空输入框
  userInput.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // 显示加载状态
  loading.value = true;
  
  try {
    // 调用API获取回复
    const { data } = await getSystemAi(message);
    
    // 添加助手回复
    messages.value.push({
      type: 'assistant',
      content: data || '抱歉，我无法回答这个问题。'
    });
  } catch (error) {
    console.error('获取AI回复失败', error);
    
    // 添加错误消息
    messages.value.push({
      type: 'assistant',
      content: '抱歉，系统暂时无法回应，请稍后再试。'
    });
  } finally {
    // 隐藏加载状态
    loading.value = false;
    
    // 滚动到底部
    scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    // 使用一个很大的值确保滚动到底部
    scrollTop.value = 99999;
  });
};

// 滚动到底部事件处理
const onScrollToBottom = () => {
  // 保持在底部
};

// 显示提示
const showAssistantHint = () => {
  // 检查当前页面是否应该显示助手
  if (excludedPages.includes(currentRoute.value)) {
    showHint.value = false;
    return;
  }
  
  // 如果助手未展开，显示提示
  if (!isExpanded.value) {
    showHint.value = true;
    
    // 5秒后隐藏提示
    hintTimer = setTimeout(() => {
      showHint.value = false;
    }, 5000) as unknown as number;
  }
};

// 获取当前页面路径
const getCurrentPage = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    // @ts-ignore
    return currentPage.route ? '/' + currentPage.route : '';
  }
  return '';
};

// 监听页面变化
onShow(() => {
  currentRoute.value = getCurrentPage();
  console.log('当前页面路径:', currentRoute.value);
  
  // 判断是否在排除的页面中
  if (excludedPages.includes(currentRoute.value)) {
    console.log('在排除页面中，隐藏助手');
    showAssistant.value = false;
  } else {
    console.log('不在排除页面中，显示助手');
    showAssistant.value = true;
    // 页面加载后3秒显示提示
    if (hintTimer !== null) {
      clearTimeout(hintTimer);
    }
    hintTimer = setTimeout(showAssistantHint, 3000) as unknown as number;
  }
});

// 页面隐藏时清理
onHide(() => {
  if (hintTimer !== null) {
    clearTimeout(hintTimer);
    hintTimer = null;
  }
});

// 组件挂载
onMounted(() => {
  console.log('导览助手组件已加载');
  
  // 初始隐藏提示
  showHint.value = false;
  
  // 获取当前页面
  currentRoute.value = getCurrentPage();
  console.log('初始页面路径:', currentRoute.value);
  
  // 判断是否在排除的页面中
  if (excludedPages.includes(currentRoute.value)) {
    console.log('在排除页面中，初始隐藏助手');
    showAssistant.value = false;
  } else {
    console.log('不在排除页面中，初始显示助手');
    showAssistant.value = true;
  }
  
  // 获取屏幕尺寸
  try {
    const sysInfo = uni.getSystemInfoSync();
    windowWidth.value = sysInfo.windowWidth;
    windowHeight.value = sysInfo.windowHeight;
  } catch (e) {
    console.error('获取屏幕尺寸失败', e);
  }
});

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
});
</script>

<style>
.logo {
  font-size: 30rpx;
  color: #fff;
}

.guide-assistant {
  position: fixed;
  z-index: 999;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.guide-assistant-expanded {
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

/* 助手按钮样式 */
.assistant-button {
  position: absolute;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: auto;
  /* 添加过渡效果 */
  transition: box-shadow 0.2s;
}

.assistant-button:active {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.assistant-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.assistant-avatar image {
  width: 130%;
  height: 130%;
  margin-left: -15%;
  margin-top: -15%;
}

.assistant-hint {
  position: absolute;
  right: 110rpx;
  top: 20rpx;
  background-color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  max-width: 400rpx;
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
}

.assistant-hint:after {
  content: '';
  position: absolute;
  right: -16rpx;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8rpx;
  border-style: solid;
  border-color: transparent transparent transparent #fff;
}

/* 对话面板样式 */
.chat-panel {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 80%;
  background-color: #f5f7fa;
  border-radius: 30rpx 30rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
}

.panel-header {
  height: 100rpx;
  background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.panel-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.panel-close {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-content {
  flex: 1;
  padding: 20rpx 30rpx;
  overflow-y: auto;
}

.chat-messages {
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 24rpx;
  max-width: 80%;
}

.assistant-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  margin-right: 60rpx;
}

.message-content {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.assistant-message .message-content {
  background-color: #fff;
  color: #333;
}

.user-message .message-content {
  background-color: #2d8cf0;
  color: #fff;
}

/* 加载动画 */
.loading-message {
  display: flex;
  align-items: center;
}

.loading-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #bbb;
  margin-right: 8rpx;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0.5);
  }
  40% {
    transform: scale(1.0);
  }
}

/* 输入区域样式 */
.message-input-area {
  height: 120rpx;
  padding: 20rpx 30rpx;
  border-top: 1px solid #eee;
  background-color: #fff;
  display: flex;
  align-items: center;
}

.input-wrapper {
  flex: 1;
  height: 80rpx;
  background-color: #f5f7fa;
  border-radius: 40rpx;
  padding: 0 30rpx;
  margin-right: 20rpx;
}

.message-input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
}

.send-button {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 
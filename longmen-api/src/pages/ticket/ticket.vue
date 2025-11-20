<template>
	<view class="ticket-container">
		<!-- 页面头部 -->
		<view class="ticket-header">
			<text class="header-title">龙门景区门票预约</text>
			<text class="header-subtitle">提前预约，快速入园</text>
		</view>
		
		<!-- 选择日期 -->
		<view class="ticket-section date-section">
			<view class="section-title">
				<text class="title-text">选择参观日期</text>
			</view>
			<scroll-view 
				scroll-x="true" 
				class="date-scroll-view" 
				show-scrollbar="false"
				enable-flex="true"
				:scroll-into-view="'date-' + selectedDate.split('-').join('')"
			>
				<view class="date-picker">
					<view 
						v-for="(date, index) in availableDates" 
						:key="index"
						:id="'date-' + date.value.split('-').join('')"
						:class="['date-item', selectedDate === date.value ? 'date-selected' : '']"
						@click="selectDate(date.value)"
					>
						<text class="date-day">{{ date.day }}</text>
						<text class="date-weekday">{{ date.weekday }}</text>
						<text class="date-month">{{ date.month }}月</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 选择票种 -->
		<view class="ticket-section ticket-type-section">
			<view class="section-title">
				<text class="title-text">选择票种</text>
			</view>
			<view class="ticket-types">
				<view 
					v-for="(type, index) in ticketTypes" 
					:key="index"
					:class="['ticket-type-item', selectedTicketType === type.id ? 'type-selected' : '']"
					@click="selectTicketType(type.id)"
				>
					<view class="type-info">
						<text class="type-name">{{ type.name }}</text>
						<text class="type-desc">{{ type.description }}</text>
					</view>
					<view class="type-price">
						<text class="price">¥{{ type.price }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 选择数量 -->
		<view class="ticket-section quantity-section">
			<view class="section-title">
				<text class="title-text">选择数量</text>
			</view>
			<view class="quantity-selector">
				<view class="quantity-btn minus" @click="decreaseQuantity">-</view>
				<text class="quantity-value">{{ ticketQuantity }}</text>
				<view class="quantity-btn plus" @click="increaseQuantity">+</view>
			</view>
		</view>
		
		<!-- 游客信息 -->
		<view class="ticket-section visitor-section">
			<view class="section-title">
				<text class="title-text">游客信息</text>
			</view>
			<view class="visitor-form">
				<view class="form-item">
					<text class="form-label">姓名</text>
					<input class="form-input" type="text" v-model="visitorName" placeholder="请输入真实姓名" />
				</view>
				<view class="form-item">
					<text class="form-label">手机号</text>
					<input class="form-input" type="number" v-model="visitorPhone" placeholder="请输入手机号码" />
				</view>
				<view class="form-item">
					<text class="form-label">身份证号</text>
					<input class="form-input" type="text" v-model="visitorIdCard" placeholder="请输入身份证号码" />
				</view>
			</view>
		</view>
		
		<!-- 底部结算栏 -->
		<view class="bottom-bar">
			<view class="price-info">
				<text class="total-label">总计:</text>
				<text class="total-price">¥{{ totalPrice }}</text>
			</view>
			<button class="submit-btn" @click="submitOrder">立即预约</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 日期项接口定义
interface DateItem {
	value: string;
	day: string;
	weekday: string;
	month: string;
	full: string;
}

// 可选择的日期
const availableDates = ref<DateItem[]>([
	{ value: '2023-05-20', day: '20', weekday: '周六', month: '5', full: '2023年5月20日' },
	{ value: '2023-05-21', day: '21', weekday: '周日', month: '5', full: '2023年5月21日' },
	{ value: '2023-05-22', day: '22', weekday: '周一', month: '5', full: '2023年5月22日' },
	{ value: '2023-05-23', day: '23', weekday: '周二', month: '5', full: '2023年5月23日' },
	{ value: '2023-05-24', day: '24', weekday: '周三', month: '5', full: '2023年5月24日' },
	{ value: '2023-05-25', day: '25', weekday: '周四', month: '5', full: '2023年5月25日' },
	{ value: '2023-05-26', day: '26', weekday: '周五', month: '5', full: '2023年5月26日' },
]);

// 票种选择
const ticketTypes = ref([
	{ id: 1, name: '成人票', description: '适用于18-60岁成人', price: 80 },
	{ id: 2, name: '学生票', description: '适用于全日制学生（需验证学生证）', price: 60 },
	{ id: 3, name: '儿童票', description: '适用于6-18岁未成年人', price: 40 },
	{ id: 4, name: '老人票', description: '适用于60岁以上老人（需验证身份证）', price: 40 },
]);

// 选择状态
const selectedDate = ref(availableDates.value[0].value);
const selectedTicketType = ref(1);
const ticketQuantity = ref(1);

// 游客信息
const visitorName = ref('');
const visitorPhone = ref('');
const visitorIdCard = ref('');

// 计算总价
const totalPrice = computed(() => {
	const selectedType = ticketTypes.value.find(type => type.id === selectedTicketType.value);
	return selectedType ? selectedType.price * ticketQuantity.value : 0;
});

// 选择日期
const selectDate = (date: string) => {
	selectedDate.value = date;
};

// 选择票种
const selectTicketType = (typeId: number) => {
	selectedTicketType.value = typeId;
};

// 增加数量
const increaseQuantity = () => {
	if (ticketQuantity.value < 10) {
		ticketQuantity.value++;
	} else {
		uni.showToast({
			title: '单次最多预约10张票',
			icon: 'none'
		});
	}
};

// 减少数量
const decreaseQuantity = () => {
	if (ticketQuantity.value > 1) {
		ticketQuantity.value--;
	}
};

// 提交订单
const submitOrder = () => {
	// 表单验证
	if (!visitorName.value) {
		uni.showToast({
			title: '请输入游客姓名',
			icon: 'none'
		});
		return;
	}
	
	if (!visitorPhone.value || !/^1\d{10}$/.test(visitorPhone.value)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		});
		return;
	}
	
	if (!visitorIdCard.value || !/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(visitorIdCard.value)) {
		uni.showToast({
			title: '请输入正确的身份证号',
			icon: 'none'
		});
		return;
	}
	
	// 构建订单数据
	const orderData = {
		date: selectedDate.value,
		ticketTypeId: selectedTicketType.value,
		quantity: ticketQuantity.value,
		visitorName: visitorName.value,
		visitorPhone: visitorPhone.value,
		visitorIdCard: visitorIdCard.value,
		totalPrice: totalPrice.value
	};
	
	// 显示提交中状态
	uni.showLoading({
		title: '提交中...'
	});
	
	// 这里应该调用下单API，暂时用setTimeout模拟
	setTimeout(() => {
		uni.hideLoading();
		
		// 弹出成功提示
		uni.showModal({
			title: '预约成功',
			content: `您已成功预约${selectedDate.value}的龙门景区门票${ticketQuantity.value}张，总计¥${totalPrice.value}`,
			showCancel: false,
			success: () => {
				// 清空表单
				visitorName.value = '';
				visitorPhone.value = '';
				visitorIdCard.value = '';
				ticketQuantity.value = 1;
				
				// 跳转到订单页面或首页
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		});
	}, 1500);
};

// 页面加载时
onMounted(() => {
	// 加载最近7天的可选日期
	const today = new Date();
	const dateList: DateItem[] = [];
	const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	
	for (let i = 0; i < 7; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);
		
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const weekday = weekdays[date.getDay()];
		
		dateList.push({
			value: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
			day: day.toString(),
			weekday: weekday,
			month: month.toString(),
			full: `${year}年${month}月${day}日`
		});
	}
	
	availableDates.value = dateList;
	selectedDate.value = dateList[0].value;
});
</script>

<style>
.ticket-container {
	min-height: 100vh;
	background-color: #f5f7fa;
	padding-bottom: 120rpx;
}

.ticket-header {
	height: 200rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 40rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
}

.header-title {
	font-size: 40rpx;
	font-weight: 600;
	margin-bottom: 10rpx;
}

.header-subtitle {
	font-size: 28rpx;
	opacity: 0.9;
}

.ticket-section {
	margin: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.section-title {
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.title-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	position: relative;
	padding-left: 20rpx;
}

.title-text::before {
	content: '';
	position: absolute;
	left: 0;
	top: 6rpx;
	height: 30rpx;
	width: 6rpx;
	background-color: #2d8cf0;
	border-radius: 3rpx;
}

/* 日期选择样式 */
.date-scroll-view {
	width: 100%;
	white-space: nowrap;
	overflow-x: auto;
	padding: 20rpx 20rpx 30rpx 20rpx;
}

.date-picker {
	display: inline-flex;
	padding: 0 10rpx;
	width: max-content;
}

.date-item {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 120rpx;
	height: 140rpx;
	margin-right: 20rpx;
	border-radius: 16rpx;
	background-color: #f5f7fa;
	transition: all 0.3s ease;
	padding: 0 15rpx;
}

.date-selected {
	background-color: #2d8cf0;
	color: #fff;
	transform: translateY(-3rpx);
	box-shadow: 0 4rpx 8rpx rgba(45, 140, 240, 0.2);
}

.date-day {
	font-size: 40rpx;
	font-weight: 600;
	margin-bottom: 6rpx;
}

.date-weekday {
	font-size: 24rpx;
}

.date-month {
	font-size: 22rpx;
	margin-top: 6rpx;
	opacity: 0.8;
}

/* 票种选择样式 */
.ticket-types {
	padding: 20rpx 30rpx;
}

.ticket-type-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	margin-bottom: 20rpx;
	background-color: #f5f7fa;
	border-radius: 16rpx;
	transition: all 0.3s;
}

.type-selected {
	background-color: #e6f3ff;
	border: 2rpx solid #2d8cf0;
}

.type-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.type-desc {
	font-size: 24rpx;
	color: #999;
}

.price {
	font-size: 36rpx;
	font-weight: 600;
	color: #f56c6c;
}

/* 数量选择样式 */
.quantity-selector {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.quantity-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f5f7fa;
	border-radius: 40rpx;
	font-size: 40rpx;
	font-weight: bold;
}

.quantity-value {
	margin: 0 40rpx;
	font-size: 36rpx;
	font-weight: 600;
	min-width: 60rpx;
	text-align: center;
}

/* 游客信息样式 */
.visitor-form {
	padding: 30rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.form-input {
	height: 88rpx;
	background-color: #f5f7fa;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}

/* 底部结算栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 100rpx;
	padding: 0 30rpx;
	background-color: #fff;
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
	font-size: 40rpx;
	font-weight: 600;
	color: #f56c6c;
}

.submit-btn {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 100rpx;
	margin-right: 30rpx;
	background: linear-gradient(135deg, #42a5f5 0%, #2d8cf0 100%);
	color: #fff;
	font-size: 28rpx;
	border-radius: 40rpx;
}
</style>

import http from '../request'
import { User, UserVO, UserLoginRequest, UserRegisterRequest, UserUpdateRequest } from './types'
import { ResponseWithHeader } from '../request'

/**
 * 用户API
 */

/**
 * 获取当前登录用户信息
 */
export function getLoginUser() {
  return http.get<UserVO>('/api/user/current')
}

/**
 * 用户登录
 * @param userAccount 用户账号
 * @param userPassword 用户密码
 */
export async function login(userAccount: string, userPassword: string) {
  try {
    const res = await http.post<User>('/api/user/login', {
      userAccount,
      userPassword
    }, true); // 设置isAuth为true
    
    // 从响应头获取会话ID和用户ID
    const sessionId = res.header?.['x-session-id'] || res.header?.['X-Session-Id'];
    const userId = res.header?.['x-user-id'] || res.header?.['X-User-Id'];
    
    if (sessionId) {
      uni.setStorageSync('sessionId', sessionId);
    }
    
    if (userId) {
      uni.setStorageSync('userId', userId);
    }
    
    return res.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 用户登录（原方法，保留兼容性）
 * @param request 登录请求
 */
export function userLogin(request: UserLoginRequest) {
  return http.post<User>('/api/user/login', request, true)
}

/**
 * 用户退出登录
 */
export function userLogout() {
  return http.post<boolean>('/api/user/logout')
}

/**
 * 用户注册
 * @param request 注册请求
 */
export function userRegister(request: UserRegisterRequest) {
  return http.post<number>('/api/user/register', request, true)
}

/**
 * 更新用户信息
 * @param request 更新请求
 */
export function updateUser(request: UserUpdateRequest) {
  return http.post<boolean>('/api/user/update/my', request)
}

export default {
  getLoginUser,
  login,
  userLogin,
  userLogout,
  userRegister,
  updateUser
} 
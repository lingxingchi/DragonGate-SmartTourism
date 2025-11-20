/**
 * 网络请求模块
 */

// 基础URL
const BASE_URL = 'http://localhost:8090'

// 请求方法枚举
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// 响应结构接口
export interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

// 扩展响应结构，包含header
export interface ResponseWithHeader<T> extends BaseResponse<T> {
  header?: Record<string, string>
}

// 用于保存登录凭证的key
const TOKEN_KEY = 'token'
const SESSION_KEY = 'sessionId'
const USER_ID_KEY = 'userId'

/**
 * 保存会话标识
 * @param token JWT令牌
 * @param sessionId 会话ID
 * @param userId 用户ID
 */
export function saveAuthInfo(token?: string, sessionId?: string, userId?: string) {
  if (token) {
    uni.setStorageSync(TOKEN_KEY, token)
  }
  
  if (sessionId) {
    uni.setStorageSync(SESSION_KEY, sessionId)
  }
  
  if (userId) {
    uni.setStorageSync(USER_ID_KEY, userId)
  }
}

/**
 * 清除会话标识
 */
export function clearAuthInfo() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(SESSION_KEY)
  uni.removeStorageSync(USER_ID_KEY)
}

/**
 * 获取授权信息
 */
export function getAuthHeader() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const sessionId = uni.getStorageSync(SESSION_KEY)
  const userId = uni.getStorageSync(USER_ID_KEY)
  
  const header: Record<string, string> = {}
  
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  
  if (sessionId) {
    header['Cookie'] = `JSESSIONID=${sessionId}`
    header['X-Session-Id'] = sessionId // 自定义头，某些小程序环境需要
  }
  
  if (userId) {
    header['X-User-Id'] = userId
  }
  
  return header
}

/**
 * HTTP请求封装
 * @param url 请求路径
 * @param method 请求方法
 * @param data 请求数据
 * @param contentType 内容类型
 * @param isAuth 是否是身份验证请求
 * @returns Promise<ResponseWithHeader<T>>
 */
export async function request<T>(
  url: string,
  method: HttpMethod = HttpMethod.GET,
  data?: any,
  contentType: string = 'application/json',
  isAuth: boolean = false
): Promise<ResponseWithHeader<T>> {
  const authHeader = getAuthHeader()
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': contentType,
        ...authHeader
      },
      success: (res) => {
        // 如果是登录接口，需要处理返回的会话信息
        if (isAuth && res.statusCode === 200) {
          // 处理响应头中的会话标识
          const setCookieHeader = res.header['Set-Cookie'] || res.header['set-cookie']
          if (setCookieHeader) {
            const sessionMatch = setCookieHeader.match(/JSESSIONID=([^;]+)/)
            if (sessionMatch && sessionMatch[1]) {
              uni.setStorageSync(SESSION_KEY, sessionMatch[1])
            }
          }
          
          // 获取会话ID和用户ID
          const sessionId = res.header['x-session-id'] || res.header['X-Session-Id']
          const userId = res.header['x-user-id'] || res.header['X-User-Id']
          
          if (sessionId) {
            uni.setStorageSync(SESSION_KEY, sessionId)
          }
          
          if (userId) {
            uni.setStorageSync(USER_ID_KEY, userId)
          }
          
          // 如果响应中包含token，保存token
          const responseData = res.data as BaseResponse<any>
          if (responseData.data && responseData.data.token) {
            saveAuthInfo(responseData.data.token)
          }
        }
        
        if (res.statusCode === 401) {
          // 清除可能过期的凭证
          clearAuthInfo()
          
          // 未授权，跳转登录页
          uni.navigateTo({
            url: '/pages/login/login'
          })
          reject(new Error('未授权，请先登录'))
          return
        }
        
        // 将响应头信息附加到返回数据中
        const responseWithHeader = {
          ...(res.data as BaseResponse<T>),
          header: res.header
        }
        
        resolve(responseWithHeader)
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 导出请求方法
export const http = {
  get<T>(url: string, params?: any): Promise<ResponseWithHeader<T>> {
    // GET请求拼接参数
    if (params) {
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      if (queryString) {
        url += url.includes('?') ? `&${queryString}` : `?${queryString}`
      }
    }
    return request<T>(url, HttpMethod.GET)
  },
  
  post<T>(url: string, data?: any, isAuth: boolean = false): Promise<ResponseWithHeader<T>> {
    return request<T>(url, HttpMethod.POST, data, 'application/json', isAuth)
  },
  
  put<T>(url: string, data?: any): Promise<ResponseWithHeader<T>> {
    return request<T>(url, HttpMethod.PUT, data)
  },
  
  delete<T>(url: string, data?: any): Promise<ResponseWithHeader<T>> {
    return request<T>(url, HttpMethod.DELETE, data)
  }
}

export default http 
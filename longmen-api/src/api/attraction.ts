import http from '../request'
import type { Attraction, AttractionQueryRequest, PageResponse } from './types'

/**
 * 景点API
 */

/**
 * 根据ID获取景点详情
 * @param id 景点ID
 */
export function getAttractionById(id: number) {
  return http.get<Attraction>('/api/attraction/get', { id })
}

/**
 * 分页获取景点列表
 * @param params 查询参数
 */
export function listAttractionByPage(params: AttractionQueryRequest) {
  return http.post<PageResponse<Attraction>>('/api/attraction/list/page', params)
}

/**
 * 获取所有景点列表（不分页）
 * @param params 查询参数
 */
export function listAttraction(params: AttractionQueryRequest = {}) {
  return http.post<Attraction[]>('/api/attraction/list', params)
}

/**
 * 获取AI推荐的景点信息
 * @param params 推荐参数
 * @param params.id 景点ID（可选）
 * @param params.age 年龄（可选）
 * @param params.preference 偏好（可选）
 */
export function getAttractionAi(params: { id?: number; age?: number; preference?: string } = {}) {
  return http.get<string>('/api/attraction/get/ai', params)
}

/**
 * 获取系统AI回答
 * @param requestion 请求问题（可选）
 */
export function getSystemAi(requestion?: string) {
  return http.get<string>('/api/attraction/system/ai', { requestion })
}

export default {
  getAttractionById,
  listAttractionByPage,
  listAttraction,
  getAttractionAi,
  getSystemAi
} 
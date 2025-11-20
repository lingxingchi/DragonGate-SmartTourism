import http from '../request'
import { Route, RouteQueryRequest, PageResponse } from './types'

/**
 * 路线API
 */

/**
 * 根据ID获取路线详情
 * @param id 路线ID
 */
export function getRouteById(id: number) {
  return http.get<Route>('/api/route/get', { id })
}

/**
 * 分页获取路线列表
 * @param params 查询参数
 */
export function listRouteByPage(params: RouteQueryRequest) {
  return http.post<PageResponse<Route>>('/api/route/list/page', params)
}

export default {
  getRouteById,
  listRouteByPage
} 
import http from '../request'
import { Attraction, AttractionRouteListRequest, AttractionRouteVO } from './types'

/**
 * 景点路线API
 */

/**
 * 获取路线详情
 * @param routeId 路线ID
 */
export function getRouteDetail(routeId: number) {
  return http.get<AttractionRouteVO>('/api/attractionroute/detail', { routeId })
}

/**
 * 获取路线包含的景点列表
 * @param request 路线查询请求
 */
export function getRouteAttractions(request: AttractionRouteListRequest) {
  return http.post<Attraction[]>('/api/attractionroute/list', request)
}

export default {
  getRouteDetail,
  getRouteAttractions
} 
import http from '../request'
import { GoodInfoVO, GoodInfoQueryRequest, PageResponse } from './types'

/**
 * 商品信息API
 */

/**
 * 根据ID获取商品详情
 * @param id 商品ID
 */
export function getGoodVO(id: number) {
  return http.get<GoodInfoVO>('/api/goodInfo/get/vo', { id })
}

/**
 * 分页获取商品列表
 * @param params 查询参数
 */
export function listGoodInfoVOByPage(params: GoodInfoQueryRequest) {
  return http.post<PageResponse<GoodInfoVO>>('/api/goodInfo/list/page/vo', params)
}

export default {
  getGoodVO,
  listGoodInfoVOByPage
} 
import http from '../request'
import { GoodsType, GoodsTypeVO } from './types'

/**
 * 商品类型API
 */

/**
 * 根据ID获取商品类型
 * @param id 类型ID
 */
export function getGoodsTypeById(id: number) {
  return http.get<GoodsTypeVO>('/api/goodtype/get', { id })
}

/**
 * 根据名称获取商品类型
 * @param typeName 类型名称
 */
export function getGoodsTypeByName(typeName: string) {
  return http.get<GoodsType>('/api/goodtype/get/name', { typeName })
}

/**
 * 获取所有商品类型列表
 */
export function listGoodsType() {
  return http.get<GoodsType[]>('/api/goodtype/list')
}

export default {
  getGoodsTypeById,
  getGoodsTypeByName,
  listGoodsType
} 
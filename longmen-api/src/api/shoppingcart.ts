import http from '../request'
import { ShoppingcartVO, ShoppingcartAddRequest, DeleteRequest } from './types'

/**
 * 购物车API
 */

/**
 * 添加/修改购物车
 * @param request 购物车添加请求
 * @returns {Promise} 操作结果
 */
export function doShoppingcart(request: ShoppingcartAddRequest) {
  return http.post<boolean>('/api/shoppingcart/', request)
}

/**
 * 获取用户购物车列表
 * @returns {Promise} 购物车商品列表
 */
export function listUserShoppingcart() {
  return http.get<ShoppingcartVO[]>('/api/shoppingcart/list')
}

/**
 * 移除购物车项
 * @param goodsId 商品ID
 * @returns {Promise} 操作结果
 */
export function removeShoppingcart(goodsId: number) {
  const request: DeleteRequest = { id: goodsId }
  return http.post<boolean>('/api/shoppingcart/remove', request)
}

export default {
  doShoppingcart,
  listUserShoppingcart,
  removeShoppingcart
} 
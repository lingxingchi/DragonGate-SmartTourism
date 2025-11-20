/**
 * API接口统一导出
 */

import announceStatement from './announceStatement'
import eventStatement from './eventStatement'
import attraction from './attraction'
import attractionRoute from './attractionRoute'
import goodInfo from './goodInfo'
import goodsType from './goodsType'
import noticeStatement from './noticeStatement'
import route from './route'
import shoppingcart from './shoppingcart'
import user from './user'

// 导出所有类型定义
export * from './types'

export {
  announceStatement,
  eventStatement,
  attraction,
  attractionRoute,
  goodInfo,
  goodsType,
  noticeStatement,
  route,
  shoppingcart,
  user
}

// 默认导出所有API
export default {
  announceStatement,
  eventStatement,
  attraction,
  attractionRoute,
  goodInfo,
  goodsType,
  noticeStatement,
  route,
  shoppingcart,
  user
} 
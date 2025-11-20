import http from '../request'
import type { EventStatementVO } from './types'

/**
 * 活动声明API
 */

/**
 * 根据ID获取活动详情
 * @param id 活动ID
 */
export function getEventStatementVOById(id: number) {
  return http.get<EventStatementVO>(`/api/eventStatement/get/vo?id=${id}`)
}

/**
 * 获取已发布的活动列表
 */
export function listPublishedEventStatements() {
  return http.get<EventStatementVO[]>('/api/eventStatement/list/published')
}

export default {
  getEventStatementVOById,
  listPublishedEventStatements
} 
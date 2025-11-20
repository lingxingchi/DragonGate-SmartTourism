import http from '../request'
import type { AnnounceStatementVO } from './types'

/**
 * 公告声明API
 */

/**
 * 根据ID获取公告详情
 * @param id 公告ID
 */
export function getAnnounceStatementVOById(id: number) {
  return http.get<AnnounceStatementVO>(`/api/announceStatement/get/vo?id=${id}`)
}

/**
 * 获取已发布的公告列表
 */
export function listPublishedAnnouncements() {
  return http.get<AnnounceStatementVO[]>('/api/announceStatement/list/published')
}

export default {
  getAnnounceStatementVOById,
  listPublishedAnnouncements
} 
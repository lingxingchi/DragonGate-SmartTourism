import http from '../request'
import { NoticeStatement } from './types'

/**
 * 通知声明API
 */

/**
 * 获取最新通知
 */
export function getLatestNotice() {
  return http.get<NoticeStatement>('/api/noticeStatement/latest')
}

export default {
  getLatestNotice
} 
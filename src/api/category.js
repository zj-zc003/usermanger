import request from '@/utils/request'

// 获取分类树形结构
export function getCategoryTree() {
  return request({
    url: '/api/categories',
    method: 'get'
  })
}

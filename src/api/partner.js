// src/api/partner.js
import request from '@/utils/request'

/**
 * 获取合伙人申请列表（分页）
 * @param {Object} params 查询参数
 * @param {string} [params.searchName] 搜索姓名
 * @param {number} [params.status] 状态筛选 (0:待审核, 1:已通过, 2:已拒绝)
 * @param {number} params.pageNum 当前页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise} 合伙人申请列表
 */
export function getPartners(params) {
  return request({
    url: '/partner/apply',
    method: 'get',
    params: {
      searchName: params.searchName,
      status: params.status,
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  })
}

/**
 * 获取申请详情
 * @param {number} id 申请ID
 * @returns {Promise} 申请详情
 */
export function getPartnerDetail(id) {
  return request({
    url: `/partner/apply/${id}`,
    method: 'get'
  })
}

/**
 * 添加新合伙人申请
 * @param {Object} data 合伙人申请数据
 * @returns {Promise} 操作结果
 */
export function addPartner(data) {
  return request({
    url: '/partner/apply',
    method: 'post',
    data
  })
}

/**
 * 更新合伙人申请
 * @param {number} id 申请ID
 * @param {Object} data 更新数据
 * @returns {Promise} 操作结果
 */
export function updatePartner(id, data) {
  return request({
    url: `/partner/apply/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除合伙人申请
 * @param {number} id 申请ID
 * @returns {Promise} 操作结果
 */
export function deletePartner(id) {
  return request({
    url: `/partner/apply/${id}`,
    method: 'delete'
  })
}

/**
 * 审核合伙人申请
 * @param {number} id 申请ID
 * @param {boolean} approved 是否通过
 * @returns {Promise} 操作结果
 */
export function reviewPartner(id, approved) {
  return request({
    url: `/partner/apply/${id}/review`,
    method: 'post',
    params: { approved }
  })
}

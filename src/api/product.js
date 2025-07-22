import request from '@/utils/request'

export const listProducts = (query) => {
  return request({
    url: '/api/admin/products',
    method: 'get',
    params: query
  })
}

// 获取产品列表接口
export function getProducts(params) {
  return request({
    url: '/api/admin/products',
    method: 'get',
    params: {
      page: params.page,
      size: params.size,
      title: params.title,
      status: params.status,
      type: params.type
    }
  })
}

export const createProduct = (data) => {
  return request({
    url: '/api/admin/products',
    method: 'post',
    data
  })
}

export const updateProduct = (id, data) => {
  return request({
    url: `/api/admin/products/${id}`,
    method: 'put',
    data
  })
}

export const updateProductStatus = (id, status) => {
  return request({
    url: `/api/admin/products/${id}/status`,
    method: 'put',
    params: { status }
  })
}

export const deleteProduct = (id) => {
  return request({
    url: `/api/admin/products/${id}`,
    method: 'delete'
  })
}

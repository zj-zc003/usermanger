import request from '@/utils/request'

export const listProducts = (query) => {
  return request({
    url: '/api/admin/products',
    method: 'get',
    params: query
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

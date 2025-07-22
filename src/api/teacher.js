import request from '@/utils/request'

export const listProducts = (query) => {
  return request({
    url: '/api/admin/products',
    method: 'get',
    params: query
  })
}

export const getAllTeacher = () =>{
    return request({
        url: '/api/teachers/listDetail',
        method: 'get',
  })
           
}

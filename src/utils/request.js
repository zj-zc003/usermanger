// src/utils/request.js
import axios from 'axios'


// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // 从环境变量获取基础URL
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送之前可以做一些处理，例如添加token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`
    // }
    return config
  },
  error => {
    // 请求错误处理
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做处理
    console.error(response)
    const res = response.data
    
    // 这里根据后端返回的数据结构调整
    if (res.code !== 200) {
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    // 响应错误处理
    console.error('Response error:', error)
    
    return Promise.reject(error)
  }
)

export default service

import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '登录失败，请稍后重试')
    }
  }
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const isLoading = ref(false)
  const userId = ref(0)
  
  async function login(username, password) {
    try {
      isLoading.value = true
      const response = await api.login({ username, password })
      
      if (response.success) {
        isAuthenticated.value = true
        user.value = { username }
        userId.value = response.userId
        return true
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
        console.log(error.message);
        
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  function logout() {
    isAuthenticated.value = false
    user.value = null
  }
  
  return { 
    isAuthenticated, 
    user, 
    isLoading,
    userId,
    login, 
    logout 
  }
})

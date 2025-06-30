import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const isLoading = ref(false)
  
  async function login(username, password) {
    try {
      isLoading.value = true
      const response = await api.login({ username, password })
      
      if (response.success) {
        isAuthenticated.value = true
        user.value = { username }
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
    login, 
    logout 
  }
})

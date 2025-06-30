<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <h1>知识付费平台</h1>
        <p>让知识创造价值</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="form-section">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username"
            placeholder="请输入用户名"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            placeholder="请输入密码"
            required
          >
        </div>
        
        <button type="submit" class="login-btn">登录</button>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
      
      <div class="footer-note">
        © 2023 知识付费系统 | 让学习更有价值
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = () => {
  if (authStore.login(username.value, password.value)) {
    router.push({ name: 'home' })
  } else {
    errorMessage.value = '用户名或密码错误'
    setTimeout(() => errorMessage.value = '', 3000)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.logo-section {
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  padding: 32px 24px;
  text-align: center;
}

.logo-section h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 700;
}

.logo-section p {
  font-size: 16px;
  opacity: 0.9;
}

.form-section {
  padding: 32px 40px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.error-message {
  margin-top: 16px;
  color: #e53e3e;
  text-align: center;
  font-size: 14px;
}

.footer-note {
  padding: 20px;
  text-align: center;
  color: #718096;
  font-size: 14px;
  border-top: 1px solid #edf2f7;
}
</style>

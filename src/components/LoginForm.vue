<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <div class="logo-circle">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h1>知识付费平台</h1>
        <p>让知识创造价值</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="form-section">
        <div class="form-group">
          <label for="username">
            <i class="fas fa-user"></i> 用户名
          </label>
          <input 
            type="text" 
            id="username" 
            v-model.trim="username"
            placeholder="请输入用户名"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> 密码
          </label>
          <input 
            type="password" 
            id="password" 
            v-model.trim="password"
            placeholder="请输入密码"
            required
          >
        </div>
        
        <button type="submit" class="login-btn" :disabled="authStore.isLoading">
          <span v-if="!authStore.isLoading">登 录</span>
          <div v-else class="spinner">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
          </div>
        </button>
        
        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
      </form>
      
      <div class="footer-note">
        <p>© 2023 知识付费系统 | 让学习更有价值</p>
        <p class="link">忘记密码? | 注册新账号</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }
  
  try {
    errorMessage.value = ''
    await authStore.login(username.value, password.value)
  } catch (err) {
    errorMessage.value = err.message || '登录失败，请重试'
    setTimeout(() => { errorMessage.value = '' }, 3000)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.logo-section {
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  padding: 40px 24px;
  text-align: center;
  position: relative;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.logo-circle i {
  font-size: 36px;
  color: white;
}

.logo-section h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: 1px;
}

.logo-section p {
  font-size: 16px;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.form-section {
  padding: 40px;
}

.form-group {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2d3748;
  display: flex;
  align-items: center;
}

.form-group label i {
  margin-right: 10px;
  font-size: 16px;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
  background: white;
}

.login-btn {
  width: 100%;
  padding: 17px;
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  height: 54px;
}

.login-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.login-btn:not(:disabled):hover {
  background: linear-gradient(to right, #3a0ca3, #4361ee);
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(66, 153, 225, 0.4);
}

.login-btn:not(:disabled):active {
  transform: translateY(0);
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #fff5f5;
  color: #e53e3e;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fed7d7;
}

.error-message i {
  margin-right: 8px;
}

.footer-note {
  padding: 25px;
  text-align: center;
  color: #718096;
  font-size: 14px;
  border-top: 1px solid #edf2f7;
  background: #f9fafb;
}

.link {
  color: #4299e1;
  cursor: pointer;
  transition: color 0.3s;
  margin-top: 8px;
}

.link:hover {
  color: #3182ce;
  text-decoration: underline;
}

/* 加载动画 */
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 100%;
  display: inline-block;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}
</style>

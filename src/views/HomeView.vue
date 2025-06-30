<template>
  <div class="home-container">
    <header class="app-header">
      <div class="header-content">
        <h1>知识付费平台</h1>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </header>
    
    <main class="main-content">
      <div class="welcome-card">
        <h2>欢迎回来, {{ username }}!</h2>
        <p>您已成功登录知识付费系统</p>
        <div class="placeholder-content">
          <div class="placeholder-item"></div>
          <div class="placeholder-item"></div>
          <div class="placeholder-item"></div>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      © 2023 知识付费系统 | 让知识创造价值
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const router = useRouter()

const username = computed(() => authStore.user?.username || '用户')

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}

.main-content {
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  padding: 40px;
  text-align: center;
}

.welcome-card h2 {
  font-size: 28px;
  color: #2d3748;
  margin-bottom: 12px;
}

.welcome-card p {
  font-size: 18px;
  color: #718096;
  margin-bottom: 30px;
}

.placeholder-content {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

.placeholder-item {
  width: 200px;
  height: 200px;
  background: #f7fafc;
  border-radius: 10px;
  border: 1px dashed #cbd5e0;
}

.app-footer {
  text-align: center;
  padding: 24px;
  color: #718096;
  border-top: 1px solid #e2e8f0;
}
</style>

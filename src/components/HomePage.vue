<template>
  <div class="home-container">
    <header class="app-header">
      <div class="header-content">
        <div class="brand">
          <i class="fas fa-book-open logo-icon"></i>
          <h1>知识付费平台</h1>
        </div>
        
        <div class="user-actions">
          <div class="user-profile">
            <div class="avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <div class="username">{{ user.username }}</div>
              <div class="user-role">VIP会员</div>
            </div>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> 退出
          </button>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <div class="dashboard">
        <div class="welcome-card">
          <h2>欢迎回来, {{ user.username }}!</h2>
          <p>您已成功登录知识付费系统</p>
          
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-icon bg-blue">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">128</div>
                <div class="stat-label">已购课程</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon bg-green">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">42</div>
                <div class="stat-label">学习时长(小时)</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon bg-purple">
                <i class="fas fa-certificate"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">7</div>
                <div class="stat-label">获得证书</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="placeholder-section">
          <h3>我的课程</h3>
          <div class="courses-grid">
            <div v-for="i in 4" :key="i" class="course-card">
              <div class="course-thumbnail"></div>
              <div class="course-info">
                <div class="course-title">课程标题占位</div>
                <div class="course-progress">
                  <div class="progress-bar">
                    <div class="progress" :style="{ width: (i * 25) + '%' }"></div>
                  </div>
                  <span>{{ i * 25 }}% 完成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">联系我们</a>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="copyright">
          © 2023 知识付费系统 | 让知识创造价值
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user || { username: '用户' })

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.app-header {
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 28px;
  background: rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand h1 {
  font-size: 24px;
  font-weight: 600;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-info {
  text-align: left;
}

.username {
  font-weight: 500;
  font-size: 16px;
}

.user-role {
  font-size: 13px;
  opacity: 0.9;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.main-content {
  flex: 1;
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  padding: 35px;
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

.stats-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #edf2f7;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 15px;
}

.bg-blue { background: linear-gradient(to right, #4361ee, #4895ef); }
.bg-green { background: linear-gradient(to right, #2a9d8f, #4cc9f0); }
.bg-purple { background: linear-gradient(to right, #7209b7, #b5179e); }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.placeholder-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.placeholder-section h3 {
  font-size: 22px;
  color: #2d3748;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.course-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.course-thumbnail {
  height: 160px;
  background: linear-gradient(to right, #f0f4f8, #e2e8f0);
  position: relative;
}

.course-thumbnail::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><path d="M8 5v14l11-7z"/></svg>');
  background-size: contain;
  opacity: 0.2;
}

.course-info {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
}

.course-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  border-radius: 4px;
}

.course-progress span {
  font-size: 14px;
  color: #718096;
  align-self: flex-end;
}

.app-footer {
  background: #2d3748;
  color: #cbd5e0;
  padding: 30px 20px;
  margin-top: 50px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 15px;
}

.footer-links a {
  color: #cbd5e0;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

.copyright {
  font-size: 14px;
  opacity: 0.8;
}
</style>

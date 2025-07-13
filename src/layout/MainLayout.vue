<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="system-name">后台管理系统</div>
      <div class="user-info">
        <div class="user-avatar"></div>
        <!-- 显示登录用户的用户名 -->
        <span class="username">{{ authStore.user?.username || '未知用户' }}</span>
        <div class="user-dropdown">
          <div class="dropdown-item">个人中心</div>
          <div class="dropdown-item" @click="handleLogout">退出登录</div>
        </div>
      </div>
    </header>

    <div class="container">
      <!-- 侧边导航 - 简洁无图标 -->
      <aside class="sidebar">
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'user'}" 
          @click="setActiveMenu('user')"
        >用户管理</div>
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'role'}" 
          @click="setActiveMenu('role')"
        >权限管理</div>
        <!-- 新增素材管理菜单项 -->
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'material'}" 
          @click="setActiveMenu('material')"
        >素材管理</div>
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'course'}" 
          @click="setActiveMenu('course')"
        >课程管理</div>
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'order'}" 
          @click="setActiveMenu('order')"
        >订单管理</div>
        <div 
          class="menu-item" 
          :class="{active: activeMenu === 'setting'}" 
          @click="setActiveMenu('setting')"
        >系统设置</div>
        
        <div class="sub-header">其他功能</div>
        <div 
          class="sub-item" 
          :class="{active: activeMenu === 'report'}" 
          @click="setActiveMenu('report')"
        >数据报表</div>
        <div 
          class="sub-item" 
          :class="{active: activeMenu === 'log'}" 
          @click="setActiveMenu('log')"
        >操作日志</div>
        <div 
          class="sub-item" 
          :class="{active: activeMenu === 'help'}" 
          @click="setActiveMenu('help')"
        >帮助中心</div>
      </aside>

      <!-- 主内容区 -->
      <main class="content">
        <component :is="currentComponent"></component>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { useAuthStore } from '@/store/auth'
//import UserManagementView from '@/views/UserManagementView.vue'
import UserView from '@/views/UserView.vue'
import MaterialView from '@/views/MaterialView3.vue'
import CourseView from '@/views/CourseView.vue'
import roleView from '@/views/RoleView.vue'

const authStore = useAuthStore()

// 动态组件管理
const activeMenu = ref('user')
const currentComponent = ref(markRaw(UserView))

// 简洁的菜单切换逻辑
const setActiveMenu = (menu) => {
  activeMenu.value = menu
  if (menu === 'user') {
    currentComponent.value = markRaw(UserView)
  }// 新增素材管理分支
  else if (menu === 'material') {
    currentComponent.value = markRaw(MaterialView)
  } else if (menu === 'course') {
    currentComponent.value = markRaw(CourseView)
  }
  else if (menu === 'role') {
    currentComponent.value = markRaw(roleView)
  }    
  
  else {
    currentComponent.value = markRaw({
      template: `<div class="placeholder-view">
                  <h2 class="page-title">${menu === 'role' ? '权限管理' : 
                  menu === 'order' ? '订单管理' : 
                  menu === 'setting' ? '系统设置' : 
                  menu === 'report' ? '数据报表' : 
                  menu === 'log' ? '操作日志' : 
                  '帮助中心'}</h2>
                  <p class="content-text">功能页面占位</p>
                </div>`,
      setup() {
        return {}
      }
    })
  }
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #f0f0f0;
}

.system-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  margin-right: 10px;
}

.username {
  font-size: 14px;
  color: #555;
  margin-right: 5px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 120px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  padding: 8px 0;
  display: none;
  z-index: 100;
}

.user-info:hover .user-dropdown {
  display: block;
}

.dropdown-item {
  padding: 8px 15px;
  font-size: 13px;
  color: #666;
}

.dropdown-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #f7f9fb;
}

.sidebar {
  width: 200px;
  background: #fff;
  padding: 20px 0;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.02);
}

.menu-item {
  padding: 12px 25px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #f0f7ff;
  color: #409eff;
}

.menu-item.active {
  background: #f0f7ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.sub-header {
  margin-top: 20px;
  padding: 10px 25px 5px;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sub-item {
  padding: 10px 25px 10px 35px;
  font-size: 13px;
  color: #777;
  cursor: pointer;
}

.sub-item:hover {
  color: #409eff;
}

.sub-item.active {
  color: #409eff;
}

.content {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}
</style>
<!-- src/views/UserView.vue -->
<template>
  <div class="user-view">
    <div class="header">
      <h2 class="page-title">用户管理</h2>
      <div class="actions">
        <button class="btn primary">新增用户</button>
        <button class="btn">导出数据</button>
      </div>
    </div>
    
    <div class="content-card">
      <p class="content-text">用户管理功能区域</p>
      <p class="tip">点击左侧菜单可切换不同功能页面</p>
    </div>
  </div>
</template>

<script setup>
// 用户管理页面内容
</script>

<style scoped>
.user-view {
  padding: 5px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: #c6e2ff;
  color: #409eff;
}

.btn.primary {
  background: #409eff;
  color: white;
  border: none;
}

.btn.primary:hover {
  background: #66b1ff;
}

.content-card {
  background: white;
  border-radius: 6px;
  padding: 30px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
  min-height: 500px;
}

.content-text {
  font-size: 16px;
  color: #555;
  margin: 0 0 15px 0;
}

.tip {
  font-size: 13px;
  color: #999;
  font-style: italic;
}
</style>

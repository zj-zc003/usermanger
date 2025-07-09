<template>
  <div class="user-management-view">
    <div class="header">
      <h2 class="page-title">用户管理</h2>
      <div class="actions">
        <button class="btn primary">新增用户</button>
        <button class="btn">导出数据</button>
      </div>
    </div>
    
    <div class="content-card">
      <h3>用户列表</h3>
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>权限</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.permissions.join(', ') }}</td>
            <td>
              <button class="btn">编辑</button>
              <button class="btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <h3>权限管理</h3>
      <div>
        <label for="permission-select">选择用户：</label>
        <select id="permission-select">
          <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.username }}</option>
        </select>
        <button class="btn">修改权限</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟用户列表数据
const userList = ref([
  { id: 1, username: 'user1', permissions: ['view', 'edit'] },
  { id: 2, username: 'user2', permissions: ['view'] },
  { id: 3, username: 'user3', permissions: ['view', 'delete'] }
])
</script>

<style scoped>
.user-management-view {
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  border: 1px solid #f0f0f0;
  padding: 10px;
  text-align: left;
}

h3 {
  margin-top: 30px;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-right: 10px;
}
</style>
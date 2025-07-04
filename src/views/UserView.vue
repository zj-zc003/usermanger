<!-- src/views/UserView.vue -->
<template>
  <div class="user-view">
    <div class="header">
      <h2 class="page-title">用户管理</h2>
      <div class="actions">
        <button class="btn primary" @click="showCreateUserModal = true">新增用户</button>
        <button class="btn" @click="exportData">导出数据</button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="content-card">
      <table>
        <thead>
          <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>手机号</th>
            <th>昵称</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.nickname }}</td>
            <td>
              <span :class="{ 'text-green': user.status === 1, 'text-red': user.status === 0 }">
                {{ user.status === 1 ? '正常' : '禁用' }}
              </span>
              <button class="btn" @click="toggleUserStatus(user.user_id, user.status)">
                {{ user.status === 1 ? '禁用' : '启用' }}
              </button>
            </td>
            <td>
              <button class="btn" @click="editUser(user)">编辑</button>
              <button class="btn" @click="deleteUser(user.user_id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增用户模态框 -->
    <div v-if="showCreateUserModal" class="modal">
      <div class="modal-content">
        <h3>新增用户</h3>
        <form @submit.prevent="createUser">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="newUser.username" required>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="newUser.password" required>
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="newUser.email">
          </div>
          <div class="form-group">
            <label for="phone">手机号</label>
            <input type="text" id="phone" v-model="newUser.phone">
          </div>
          <button type="submit" class="btn primary">保存</button>
          <button type="button" class="btn" @click="showCreateUserModal = false">取消</button>
        </form>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div v-if="showEditUserModal" class="modal">
      <div class="modal-content">
        <h3>编辑用户</h3>
        <form @submit.prevent="updateUser">
          <div class="form-group">
            <label for="editUsername">用户名</label>
            <input type="text" id="editUsername" v-model="editedUser.username" disabled>
          </div>
          <div class="form-group">
            <label for="editPassword">密码</label>
            <input type="password" id="editPassword" v-model="editedUser.password">
          </div>
          <div class="form-group">
            <label for="editEmail">邮箱</label>
            <input type="email" id="editEmail" v-model="editedUser.email">
          </div>
          <div class="form-group">
            <label for="editPhone">手机号</label>
            <input type="text" id="editPhone" v-model="editedUser.phone">
          </div>
          <button type="submit" class="btn primary">保存</button>
          <button type="button" class="btn" @click="showEditUserModal = false">取消</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 模拟用户列表数据
const userList = ref([]);
const showCreateUserModal = ref(false);
const showEditUserModal = ref(false);
const newUser = ref({
  username: '',
  password: '',
  email: '',
  phone: ''
});
const editedUser = ref({
  user_id: null,
  username: '',
  password: '',
  email: '',
  phone: ''
});

// 获取用户列表
const fetchUserList = async () => {
  try {
    const response = await axios.get('/api/users');
    userList.value = response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
};

// 新增用户
const createUser = async () => {
  try {
    await axios.post('/api/users', newUser.value);
    showCreateUserModal.value = false;
    newUser.value = {
      username: '',
      password: '',
      email: '',
      phone: ''
    };
    fetchUserList();
  } catch (error) {
    console.error('新增用户失败:', error);
  }
};

// 编辑用户
const editUser = (user) => {
  editedUser.value = { ...user };
  showEditUserModal.value = true;
};

// 更新用户信息
const updateUser = async () => {
  try {
    await axios.put(`/api/users/${editedUser.value.user_id}`, editedUser.value);
    showEditUserModal.value = false;
    fetchUserList();
  } catch (error) {
    console.error('更新用户信息失败:', error);
  }
};

// 删除用户
const deleteUser = async (userId) => {
  if (confirm('确定要删除该用户吗？')) {
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUserList();
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  }
};

// 切换用户状态
const toggleUserStatus = async (userId, status) => {
  try {
    await axios.patch(`/api/users/${userId}/status`, { status: status === 1 ? 0 : 1 });
    fetchUserList();
  } catch (error) {
    console.error('切换用户状态失败:', error);
  }
};

// 导出数据
const exportData = () => {
  // 实现导出数据的逻辑
  console.log('导出数据');
};

// 页面加载时获取用户列表
fetchUserList();
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  border: 1px solid #f0f0f0;
  padding: 10px;
  text-align: left;
}

.text-green {
  color: green;
}

.text-red {
  color: red;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  border-radius: 6px;
  padding: 30px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
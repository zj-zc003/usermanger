<template>
  <div class="user-manage-container">
    <!-- 搜索和操作区域 -->
    <div class="operation-panel">
      <el-input
        v-model="searchKey"
        placeholder="搜索用户/手机/邮箱"
        clearable
        style="width: 300px; margin-right: 15px"
        @clear="resetSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button icon="el-icon-search" @click="handleSearch" />
        </template>
      </el-input>
      
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">
        新增用户
      </el-button>
      
      <el-select
        v-model="filterStatus"
        placeholder="用户状态"
        clearable
        style="width: 120px; margin-left: 15px"
      >
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      
      <el-select
        v-model="filterUserType"
        placeholder="用户类型"
        clearable
        style="width: 120px; margin-left: 15px"
      >
        <el-option label="普通用户" :value="1" />
        <el-option label="讲师" :value="2" />
        <el-option label="机构" :value="3" />
      </el-select>
    </div>

    <!-- 用户数据表格 -->
    <el-table
      :data="filteredUsers"
      stripe
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="user_id" label="ID" width="80" />
      <el-table-column label="用户信息" min-width="180">
        <template #default="{ row }">
          <div class="user-info-cell">
            <el-avatar :src="row.avatar" size="small" />
            <div class="user-text">
              <div>{{ row.username }}</div>
              <div class="nickname">{{ row.nickname || '未设置昵称' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'" size="small">
            {{ row.status ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          {{ getUserTypeText(row.user_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="注册时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button
            size="small"
            :type="row.status ? 'danger' : 'success'"
            @click="toggleUserStatus(row)"
          >
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="users.length"
        :page-sizes="[10, 20, 50]"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="currentUser" label-width="100px">
        <el-form-item label="用户名" required>
          <el-input v-model="currentUser.username" />
        </el-form-item>
        <el-form-item label="密码" v-if="dialogType === 'add'">
          <el-input v-model="currentUser.password" type="password" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="currentUser.nickname" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="currentUser.real_name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="currentUser.email" type="email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="currentUser.phone" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="currentUser.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="currentUser.user_type">
            <el-option :label="getUserTypeText(1)" :value="1" />
            <el-option :label="getUserTypeText(2)" :value="2" />
            <el-option :label="getUserTypeText(3)" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-switch
            v-model="currentUser.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'

export default {
  setup() {
    // 模拟用户数据
    const users = ref([
      {
        user_id: 1001,
        username: 'zhangsan',
        password: '123456',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        nickname: '张三',
        avatar: 'https://educreator.com/avatar1.png',
        real_name: '张三',
        gender: 1,
        birthday: '1990-01-01',
        status: 1,
        user_type: 1,
        is_verified: 1,
        invite_code: 'ABCD1234',
        invited_by: null,
        create_time: '2023-05-10 14:30:22'
      },
      {
        user_id: 1002,
        username: 'lisi',
        password: '123456',
        email: 'lisi@example.com',
        phone: '13900139000',
        nickname: '李老师',
        avatar: 'https://educreator.com/avatar2.png',
        real_name: '李四',
        gender: 1,
        birthday: '1985-05-15',
        status: 1,
        user_type: 2,
        is_verified: 1,
        invite_code: 'EFGH5678',
        invited_by: 1001,
        create_time: '2023-06-12 09:15:45'
      },
      {
        user_id: 1003,
        username: 'wangwu',
        password: '123456',
        email: 'wangwu@example.com',
        phone: '13700137000',
        nickname: '王校长',
        avatar: 'https://educreator.com/avatar3.png',
        real_name: '王五',
        gender: 0,
        birthday: '1980-11-20',
        status: 0,
        user_type: 3,
        is_verified: 1,
        invite_code: 'IJKL9012',
        invited_by: 1001,
        create_time: '2023-07-18 16:20:30'
      }
    ])

    // 分页相关状态
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 搜索和筛选条件
    const searchKey = ref('')
    const filterStatus = ref(null)
    const filterUserType = ref(null)

    // 对话框相关状态
    const dialogVisible = ref(false)
    const dialogType = ref('add') // 'add' 或 'edit'
    const currentUser = reactive({
      username: '',
      password: '',
      email: '',
      phone: '',
      nickname: '',
      real_name: '',
      gender: 0,
      user_type: 1,
      status: 1
    })

    // 用户类型映射
    const getUserTypeText = (type) => {
      const types = { 1: '普通用户', 2: '讲师', 3: '机构' }
      return types[type] || '未知'
    }

    // 过滤后的用户列表
    const filteredUsers = computed(() => {
      let result = users.value
      
      // 搜索过滤
      if (searchKey.value) {
        const key = searchKey.value.toLowerCase()
        result = result.filter(user => 
          user.username.toLowerCase().includes(key) ||
          user.phone.includes(key) ||
          user.email.toLowerCase().includes(key)
        )
      }
      
      // 状态过滤
      if (filterStatus.value !== null) {
        result = result.filter(user => user.status === filterStatus.value)
      }
      
      // 用户类型过滤
      if (filterUserType.value !== null) {
        result = result.filter(user => user.user_type === filterUserType.value)
      }
      
      // 分页处理
      const start = (currentPage.value - 1) * pageSize.value
      return result.slice(start, start + pageSize.value)
    })

    // 显示添加用户对话框
    const showAddDialog = () => {
      dialogType.value = 'add'
      Object.assign(currentUser, {
        username: '',
        password: '',
        email: '',
        phone: '',
        nickname: '',
        real_name: '',
        gender: 0,
        user_type: 1,
        status: 1
      })
      dialogVisible.value = true
    }

    // 显示编辑用户对话框
    const showEditDialog = (user) => {
      dialogType.value = 'edit'
      Object.assign(currentUser, JSON.parse(JSON.stringify(user)))
      dialogVisible.value = true
    }

    // 保存用户（添加/编辑）
    const saveUser = () => {
      if (dialogType.value === 'add') {
        // 生成模拟ID
        const newId = Math.max(...users.value.map(u => u.user_id)) + 1
        const newUser = {
          ...currentUser,
          user_id: newId,
          avatar: 'https://educreator.com/default-avatar.png',
          create_time: new Date().toLocaleString(),
          update_time: new Date().toLocaleString()
        }
        users.value.unshift(newUser)
      } else {
        // 更新用户
        const index = users.value.findIndex(u => u.user_id === currentUser.user_id)
        if (index !== -1) {
          users.value[index] = {
            ...users.value[index],
            ...currentUser,
            update_time: new Date().toLocaleString()
          }
        }
      }
      dialogVisible.value = false
    }

    // 切换用户状态
    const toggleUserStatus = (user) => {
      const index = users.value.findIndex(u => u.user_id === user.user_id)
      if (index !== -1) {
        users.value[index].status = user.status ? 0 : 1
      }
    }

    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const resetSearch = () => {
      searchKey.value = ''
      currentPage.value = 1
    }

    // 分页变化处理
    const handlePageChange = (page) => {
      currentPage.value = page
    }

    // 每页数量变化处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    return {
      users,
      searchKey,
      filterStatus,
      filterUserType,
      filteredUsers,
      dialogVisible,
      dialogType,
      currentUser,
      currentPage,
      pageSize,
      getUserTypeText,
      showAddDialog,
      showEditDialog,
      saveUser,
      toggleUserStatus,
      handleSearch,
      resetSearch,
      handlePageChange,
      handleSizeChange
    }
  }
}
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.operation-panel {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-info-cell {
  display: flex;
  align-items: center;
}

.user-info-cell .el-avatar {
  margin-right: 10px;
}

.user-text .nickname {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

<template>
  <div class="role-management">
    <el-table :data="roles" style="width: 100%">
      <el-table-column prop="roleId" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" />
      <el-table-column prop="roleCode" label="角色编码" />
      <el-table-column prop="roleDesc" label="描述" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

const roles = ref([])

onMounted(async () => {
  const res = await axios.get('/api/roles')
  roles.value = res.data
})
</script>

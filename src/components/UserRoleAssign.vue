<template>
  <el-dialog v-model="visible" title="分配角色">
    <el-checkbox-group v-model="selectedRoles">
      <el-checkbox 
        v-for="role in allRoles" 
        :key="role.roleId" 
        :label="role.roleId"
      >
        {{ role.roleName }}
      </el-checkbox>
    </el-checkbox-group>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveRoles">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import axios from '@/utils/axios'

const props = defineProps({
  userId: Number
})
const emit = defineEmits(['update'])

const visible = ref(false)
const allRoles = ref([])
const selectedRoles = ref([])

// 打开弹窗
const open = async () => {
  // 获取所有角色
  const rolesRes = await axios.get('/api/roles')
  allRoles.value = rolesRes.data
  
  // 获取用户当前角色
  const userRolesRes = await axios.get(`/api/roles/user/${props.userId}`)
  selectedRoles.value = userRolesRes.data.map(r => r.roleId)
  
  visible.value = true
}

// 保存角色
const saveRoles = async () => {
  await axios.post('/api/user-roles/update', {
    userId: props.userId,
    roleIds: selectedRoles.value
  })
  visible.value = false
  emit('update')
}

defineExpose({ open })
</script>

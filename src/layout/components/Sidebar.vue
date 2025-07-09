<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

// 完整菜单结构
const fullMenu = [
  {
    title: '仪表盘',
    icon: 'el-icon-monitor',
    path: '/dashboard'
  },
  {
    title: '系统管理',
    icon: 'el-icon-setting',
    children: [
      { title: '用户管理', path: '/system/users', roles: ['ADMIN'] },
      { title: '角色管理', path: '/system/roles', roles: ['ADMIN'] },
      { title: '个人中心', path: '/system/profile' }
    ]
  }
]

// 根据权限过滤菜单
const filteredMenu = computed(() => {
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
  
  return fullMenu.map(item => {
    if (!item.children) {
      return hasPermission(item) ? item : null
    }
    
    const children = item.children
      .filter(child => hasPermission(child))
      .map(child => ({ ...child }))
    
    return children.length > 0 ? { ...item, children } : null
  }).filter(Boolean)
})

// 检查权限
function hasPermission(menuItem) {
  if (!menuItem.roles) return true
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
  return menuItem.roles.some(role => userRoles.includes(role))
}
</script>

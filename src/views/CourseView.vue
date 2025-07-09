<template>
  <div class="material-view">
    <!-- 页面标题和操作区域 -->
    <div class="page-header">
      <h1 class="page-title">课程管理</h1>
      <button class="btn btn-primary" @click="handleCreateMaterial">+ 新建课程</button>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="action-bar">
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索课程标题..." 
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        >
        <select class="status-filter" v-model="statusFilter">
          <option value="">全部状态</option>
          <option value="0">草稿</option>
          <option value="1">已上架</option>
          <option value="2">已下架</option>
        </select>
        <button class="btn btn-default" @click="handleSearch">筛选</button>
      </div>
      <div>
        <button class="btn btn-default">批量操作</button>
      </div>
    </div>
    
    <!-- 课程列表 -->
    <div class="material-table">
      <div class="table-header">
        <div>封面</div>
        <div>课程标题</div>
        <div>分类</div>
        <div>状态</div>
        <div>价格</div>
        <div>创建时间</div>
        <div>操作</div>
      </div>
      
      <div class="table-content">
        <!-- 课程项 - 使用v-for渲染 -->
        <div 
          v-for="(material, index) in materials" 
          :key="index" 
          class="table-row"
        >
          <div class="table-cell">
            <div class="cover-img" :style="{ backgroundImage: `url(${material.cover_image})` }"></div>
          </div>
          <div class="table-cell">{{ material.title }}</div>
          <div class="table-cell">{{ material.category_name }}</div>
          <div class="table-cell">
            <span :class="`status status-${getStatusClass(material.status)}`">
              {{ getStatusText(material.status) }}
            </span>
          </div>
          <div class="table-cell price">
            {{ material.is_free ? '免费' : `¥${material.price}` }}
          </div>
          <div class="table-cell">{{ formatDate(material.create_time) }}</div>
          <div class="table-cell action-btns">
            <button class="action-btn action-edit" @click="handleEditMaterial(material)">
              编辑
            </button>
            <button 
              class="action-btn action-delete" 
              @click="handleDeleteMaterial(material.course_id)"
            >
              删除
            </button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="materials.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <p>暂无课程数据</p>
        </div>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination" v-if="materials.length > 0">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="pagination-btn" 
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 模拟数据 - 实际项目中会从API获取
const mockMaterials = [
  {
    course_id: 1,
    title: '高级UI设计课程课程包',
    category_id: 1,
    category_name: 'UI设计',
    cover_image: 'https://dummyimage.com/50x50/409eff/fff',
    status: 1,
    price: '199.00',
    is_free: 0,
    create_time: '2023-10-15T08:30:00Z',
    study_count: 120,
    rating: 4.8
  },
  {
    course_id: 2,
    title: '产品经理实战指南',
    category_id: 2,
    category_name: '产品设计',
    cover_image: 'https://dummyimage.com/50x50/67c23a/fff',
    status: 0,
    price: '299.00',
    is_free: 0,
    create_time: '2023-10-20T14:45:00Z',
    study_count: 85,
    rating: 4.5
  },
  {
    course_id: 3,
    title: 'JavaScript高级编程',
    category_id: 3,
    category_name: '前端开发',
    cover_image: 'https://dummyimage.com/50x50/e6a23c/fff',
    status: 2,
    price: '159.00',
    is_free: 0,
    create_time: '2023-09-28T10:15:00Z',
    study_count: 210,
    rating: 4.7
  },
  {
    course_id: 4,
    title: 'Python数据分析基础',
    category_id: 4,
    category_name: '数据分析',
    cover_image: 'https://dummyimage.com/50x50/f56c6c/fff',
    status: 1,
    price: '0.00',
    is_free: 1,
    create_time: '2023-11-05T09:20:00Z',
    study_count: 350,
    rating: 4.9
  }
]

// 响应式数据
const materials = ref([...mockMaterials])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

// 计算属性
const totalPages = computed(() => Math.ceil(materials.value.length / pageSize))
/*const filteredMaterials = computed(() => {
  return materials.value.filter(material => {
    const matchesKeyword = material.title.includes(searchKeyword.value)
    const matchesStatus = statusFilter.value === '' || material.status.toString() === statusFilter.value
    return matchesKeyword && matchesStatus
  })
})*/

// 状态文本转换
const getStatusText = (status) => {
  return {
    0: '草稿',
    1: '已上架',
    2: '已下架'
  }[status] || '未知状态'
}

// 状态样式类
const getStatusClass = (status) => {
  return {
    0: 'draft',
    1: 'published',
    2: 'offline'
  }[status] || ''
}

// 日期格式化
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 事件处理函数
const handleSearch = () => {
  console.log('搜索条件:', { keyword: searchKeyword.value, status: statusFilter.value })
  // 实际项目中这里会调用API
}

const handleCreateMaterial = () => {
  console.log('创建新课程')
  // 实际项目中这里会打开创建课程的模态框
}

const handleEditMaterial = (material) => {
  console.log('编辑课程:', material)
  // 实际项目中这里会打开编辑课程的模态框
}

const handleDeleteMaterial = (id) => {
  console.log('删除课程:', id)
  if (confirm('确定要删除这个课程吗？')) {
    // 实际项目中这里会调用删除API
    materials.value = materials.value.filter(m => m.course_id !== id)
  }
}

// 监听分页变化
watch(currentPage, () => {
  console.log('分页变化:', currentPage.value)
  // 实际项目中这里会调用API获取对应页码的数据
})
</script>

<style scoped>
.material-view {
  padding: 20px;
  background-color: #f7f9fb;
  min-height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-box {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
  margin-right: 10px;
}

.status-filter {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 10px;
  background-color: white;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-default {
  background-color: #f4f4f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-default:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.material-table {
  width: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 100px 100px 120px 100px;
  padding: 12px 15px;
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 100px 100px 120px 100px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.table-cell {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.cover-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background-color: #f0f2f5;
  background-size: cover;
  background-position: center;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-published {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-draft {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-offline {
  background-color: #fef0f0;
  color: #f56c6c;
}

.price {
  font-weight: 600;
  color: #e6a23c;
}

.action-btns {
  display: flex;
}

.action-btn {
  padding: 6px 10px;
  margin-right: 5px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.action-edit {
  color: #409eff;
}

.action-edit:hover {
  background-color: #ecf5ff;
}

.action-delete {
  color: #f56c6c;
}

.action-delete:hover {
  background-color: #fef0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
}

.pagination-btn {
  padding: 6px 12px;
  margin: 0 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #909399;
  grid-column: span 7;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #dcdfe6;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .table-header, .table-row {
    grid-template-columns: 60px 1fr 120px 100px 100px 100px;
  }
  .action-btns {
    flex-direction: column;
  }
}
</style>

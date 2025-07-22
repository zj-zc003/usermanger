<template>
  <div class="product-manager">
    <!-- 搜索与筛选区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-controls">
          <el-input
            v-model="searchQuery"
            placeholder="搜索产品名称"
            class="search-input"
            clearable
            size="large"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
          
          <div class="filter-group">
            <el-select v-model="filterStatus" placeholder="状态筛选" class="filter-select" size="large">
              <el-option label="全部" value="all" />
              <el-option label="已上架" value="1" />
              <el-option label="已下架" value="0" />
              <el-option label="草稿" value="2" />
            </el-select>
            
            <el-select v-model="filterType" placeholder="类型筛选" class="filter-select" size="large">
              <el-option label="全部" value="all" />
              <el-option label="专栏" value="1" />
              <el-option label="视频课" value="2" />
              <el-option label="音频课" value="3" />
              <el-option label="电子书" value="4" />
              <el-option label="直播" value="5" />
            </el-select>
          </div>
          
          <div class="action-buttons">
            <el-button type="default" @click="resetFilters" size="large">
              <i class="el-icon-refresh"></i>重置
            </el-button>
            <el-button type="primary" @click="fetchProducts" size="large">
              <i class="el-icon-search"></i>搜索
            </el-button>
            <el-button type="success" @click="showCreateDialog" size="large">
              <i class="el-icon-plus"></i>新建产品
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="list-section">
      <div class="list-container">
        <!-- 列表标题栏 -->
        <div class="list-header">
          <div class="header-left">
            <span class="header-title">产品列表</span>
            <span class="product-count">
              共 {{ pagination.total }} 个产品
            </span>
          </div>
          <div>
            <el-button size="small" text>
              <i class="el-icon-download"></i>导出数据
            </el-button>
          </div>
        </div>
        
        <!-- 表格内容 -->
        <el-table 
          :data="products" 
          v-loading="loading" 
          style="width: 100%"
          :header-cell-style="{ backgroundColor: '#f9fafb', fontWeight: 'bold' }"
        >
          <el-table-column prop="id" label="ID" width="100" align="center" />
          <el-table-column label="封面" width="120" align="center">
            <template #default="{ row }">
              <el-image 
                :src="row.coverKey || 'https://via.placeholder.com/80'" 
                fit="cover" 
                class="product-cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="产品名称" min-width="220" />
          <el-table-column label="价格" width="140" align="right">
            <template #default="{ row }">
              <div class="price-container">
                <span v-if="row.originPrice" class="original-price">
                  ¥{{ row.originPrice.toFixed(2) }}
                </span>
                <span class="current-price">¥{{ row.price.toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="typeTagMap[row.type]" size="medium" effect="light" round>
                {{ typeMap[row.type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="140" align="center">
            <template #default="{ row }">
              <div class="status-container">
                <el-tag 
                  :type="row.status === 1 ? 'success' : row.status === 0 ? 'warning' : 'info'"
                  effect="dark"
                >
                  {{ row.status === 1 ? '已上架' : row.status === 0 ? '已下架' : '草稿' }}
                </el-tag>
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="updateStatus(row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-group">
                <el-button size="small" @click="editProduct(row)" plain>
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteProduct(row.id)" plain>
                  删除
                </el-button>
                <el-button size="small" type="success" v-if="row.status !== 1" @click="publishProduct(row)" plain>
                  上架
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <div class="pagination-info">
            显示第 {{ (pagination.current - 1) * pagination.size + 1 }} 至 
            {{ Math.min(pagination.current * pagination.size, pagination.total) }} 条结果
          </div>
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            layout="prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="fetchProducts"
          />
        </div>
      </div>
    </div>

    <!-- 产品创建/编辑对话框 -->
  <el-dialog 
    v-model="dialogVisible" 
    :title="isEditMode ? '编辑产品' : '创建产品'" 
    width="900px"
    class="product-dialog"
    @closed="resetForm"
  >
    <ProductForm 
      ref="productFormRef"
      :product="currentProduct" 
      @submit="handleFormSubmit" 
      @cancel="dialogVisible = false" 
    />
  </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage,ElMessageBox  } from 'element-plus'
import { ref, reactive, onMounted  } from 'vue'
import ProductForm from '../components/ProductForm.vue'
import { getProducts, updateProductStatus, deleteProduct,createProduct,updateProduct } from '@/api/product'

// 产品类型映射
const typeMap = {
  1: '专栏',
  2: '视频课',
  3: '音频课',
  4: '电子书',
  5: '直播'
}

// 标签类型映射
const typeTagMap = {
  1: 'success',
  2: 'primary',
  3: 'warning',
  4: 'info',
  5: 'danger'
}

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const products = ref([])
const currentProduct = ref(null)

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 生命周期钩子
onMounted(() => {
  fetchProducts()
})

// 获取产品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      size: pagination.size,
      title: searchQuery.value,
      status: filterStatus.value === 'all' ? null : filterStatus.value,
      type: filterType.value === 'all' ? null : filterType.value
    }
    
    const res = await getProducts(params)
    products.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取产品列表失败', error)
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 添加表单引用
const productFormRef = ref(null)


// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
  fetchProducts()
}

// 更新产品状态
const updateStatus = async (product) => {
  try {
    await updateProductStatus(product.id, product.status)
    ElMessage.success(product.status === 1 ? '产品已上架' : '产品已下架')
  } catch (error) {
    console.error('更新状态失败', error)
    // 恢复原始状态
    product.status = product.status === 1 ? 0 : 1
    ElMessage.error('操作失败，请重试')
  }
}

// 对话框关闭时重置表单
const resetForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields?.()
  }
}

// 修正删除函数
async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除此产品吗？删除后不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteProduct(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchProducts()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 发布产品
const publishProduct = (row) => {
  row.status = 1
  updateStatus(row)
}

// 显示创建对话框
const showCreateDialog = () => {
  isEditMode.value = false
  currentProduct.value = {
    title: '',
    subtitle: '',
    coverImg: '',
    description: '',
    price: 0,
    originPrice: 0,
    type: 1,
    status: 2, // 默认草稿状态
    studyMode: 1,
    validDays: 0,
    teacherId: null,
    categoryId: null,
    isRecommend: false,
    sort: 0
  }
  dialogVisible.value = true
}

// 编辑产品
const editProduct = (product) => {
  isEditMode.value = true
  currentProduct.value = { ...product }
  dialogVisible.value = true
}

// 处理表单提交
const handleFormSubmit = async (formData) => {
  try {
    loading.value = true
    let res
    
    if (isEditMode.value) {
      // 更新产品
      res = await updateProduct(formData.id, formData)
    } else {
      // 创建产品
      res = await createProduct(formData)
    }
    
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? '产品更新成功' : '产品创建成功')
      dialogVisible.value = false
      fetchProducts() // 刷新列表
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('表单提交失败', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.size = size
  fetchProducts()
}
</script>

<style scoped>
.product-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 24px;
}

.search-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f2f5;
  padding: 20px;
}

.search-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex: 1;
  min-width: 240px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 160px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

/* 列表区域样式 */
.list-section {
  margin-top: 24px;
}

.list-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f2f5;
  overflow: hidden;
}

.list-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.product-count {
  margin-left: 12px;
  font-size: 14px;
  color: #606266;
  background-color: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 表格内容样式 */
.product-cover {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  transition: transform 0.3s ease;
}

.product-cover:hover {
  transform: scale(1.05);
}

.price-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 13px;
  margin-right: 8px;
}

.current-price {
  color: #f56c6c;
  font-weight: 500;
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-container .el-tag {
  margin-right: 8px;
}

.action-buttons-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 分页样式 */
.pagination-container {
  padding: 16px 24px;
  border-top: 1px solid #f0f2f5;
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

/* 表格悬停效果 */
:deep(.el-table__row):hover {
  background-color: #f8fafc !important;
}

/* 按钮悬停效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 对话框样式 */
.product-dialog {
  border-radius: 12px;
  overflow: hidden;
}

/* 操作按钮组 */
:deep(.el-table__cell:last-child) .cell {
  display: flex;
  justify-content: center;
}
</style>

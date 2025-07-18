<template>
  <div class="page-container">
    <!-- 顶部操作区 -->
    <div class="top-actions">
      <el-button type="primary" @click="openCreateDialog" class="add-product-btn">
        添加产品
      </el-button>
    </div>

    <div class="container">
    
    <!-- 搜索区域 -->
    <div class="search-box">
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="输入关键词" 
        clearable 
        class="search-input"
      />
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="产品名称" 
        clearable 
        class="search-input"
      />
      <el-select 
        v-model="queryParams.status" 
        placeholder="全部" 
        clearable 
        class="search-select"
      >
        <el-option label="上架" :value="1" />
        <el-option label="下架" :value="0" />
      </el-select>
      <el-button type="primary" @click="searchProducts">搜索</el-button>
    </div>
  </div>

    <!-- 产品列表卡片 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="table-card-header">
          <span>产品列表</span>
          <span class="total-count">共 {{ total }} 条记录</span>
        </div>
      </template>
      
      <el-table 
        :data="productList" 
        border 
        stripe 
        class="product-table"
      >
        <el-table-column prop="productId" label="ID" width="80" />
        <el-table-column prop="title" label="产品名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 1 ? 'danger' : 'success'" 
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-popconfirm title="确认删除该产品?" @confirm="deleteProduct(row.productId)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditMode ? '编辑产品' : '添加产品'"
      width="600px"
    >
      <el-form :model="currentProduct" label-width="100px" class="dialog-form">
        <el-form-item label="产品名称" required>
          <el-input 
            v-model="currentProduct.title" 
            placeholder="请输入产品名称" 
            class="dialog-input"
          />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input 
            v-model="currentProduct.description" 
            type="textarea" 
            placeholder="请输入产品描述"
            :rows="4"
            class="dialog-textarea"
          />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select 
            v-model="currentProduct.categoryId" 
            placeholder="请选择分类" 
            class="dialog-select"
          >
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 保持原有JS代码不变
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// API 客户端（需根据实际项目配置），这里模拟引入，实际要替换成真实接口
import { 
  listProducts, 
  createProduct, 
  updateProduct, 
  updateProductStatus, 
  deleteProduct 
} from '@/api/product'

// 产品列表数据
const productList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: null
})

// 弹窗控制
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentProduct = ref({
  productId: null,
  title: '',
  description: '',
  categoryId: null
})

// 模拟分类数据（实际应从 API 获取）
const categories = ref([
  { id: 1, name: '技术教程' },
  { id: 2, name: '行业报告' },
  { id: 3, name: '视频课程' }
])

// 加载产品列表
const loadProducts = async () => {
  try {
    const res = await listProducts(queryParams)
    if (res.code === 200) {
      productList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  } catch (error) {
    ElMessage.error('请求失败')
  }
}

// 搜索产品
const searchProducts = () => {
  queryParams.page = 1
  loadProducts()
}

// 分页处理
const handleSizeChange = (size) => {
  queryParams.size = size
  loadProducts()
}

const handlePageChange = (page) => {
  queryParams.page = page
  loadProducts()
}

// 打开创建弹窗
const openCreateDialog = () => {
  isEditMode.value = false
  currentProduct.value = {
    productId: null,
    title: '',
    description: '',
    categoryId: null
  }
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (product) => {
  isEditMode.value = true
  currentProduct.value = { ...product }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    let res
    if (isEditMode.value) {
      res = await updateProduct(currentProduct.value.productId, currentProduct.value)
    } else {
      res = await createProduct(currentProduct.value)
    }
    
    if (res.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadProducts()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('请求失败')
  }
}

// 切换产品状态
const toggleStatus = async (product) => {
  const newStatus = product.status === 1 ? 0 : 1
  try {
    const res = await updateProductStatus(product.id, newStatus)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      product.status = newStatus
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('请求失败')
  }
}

// 删除产品
async (id) => {
  try {
    const res = await deleteProduct(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadProducts()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('请求失败')
  }
}

// 初始化加载
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.add-product-btn {
  margin-bottom: 16px;
}

/* 搜索区域关键布局 */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px; 
  margin-bottom: 16px;
}
.search-input,
.search-select {
  flex: 1; 
  min-width: 120px; 
}
.page-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 顶部操作区 */
.top-actions {
  margin-bottom: 16px;
}

.add-product-btn {
  padding: 8px 16px;
}

/* 搜索区域卡片样式 */
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  flex-wrap: wrap;
}

.search-input {
  min-width: 240px;
  flex: 1;
  max-width: 400px;
}

.search-select {
  min-width: 140px;
}

/* 产品列表卡片样式 */
.table-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.total-count {
  font-size: 14px;
  color: #606266;
  font-weight: normal;
}

.product-table {
  width: 100%;
  margin-top: 10px;
}

/* 分页样式 */
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* 弹窗表单样式保持不变 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dialog-input,
.dialog-textarea,
.dialog-select {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input, .search-select {
    width: 100%;
    max-width: none;
  }
}
</style>
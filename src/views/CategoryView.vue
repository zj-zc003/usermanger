<!-- CategoryManagement.vue -->
<template>
  <div class="category-management">
    <!-- 添加分类表单 -->
    <el-form :model="newCategory" label-width="80px">
      <el-form-item label="分类名称">
        <el-input v-model="newCategory.name" />
      </el-form-item>
      <el-form-item label="父分类">
        <el-select v-model="newCategory.parentId" clearable>
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createCategory">
          添加分类
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 分类树形表格 -->
    <el-table :data="categories" row-key="id">
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editCategory(row)">编辑</el-button>
          <el-button type="danger" @click="deleteCategory(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryTree
} from '@/api/category'

const categories = ref([])
const newCategory = ref({
  name: '',
  parentId: null
})

// 加载分类树
const loadCategories = async () => {
  const res = await getCategoryTree()
  categories.value = res.data
}

// 创建新分类
const createCategory = async () => {
  await createCategory(newCategory.value)
  loadCategories()
  newCategory.value = { name: '', parentId: null }
  ElMessage.success('分类创建成功')
}

// 删除分类
const deleteCategory = async (id) => {
  await deleteCategory(id)
  loadCategories()
  ElMessage.success('分类已删除')
}

onMounted(loadCategories)
</script>

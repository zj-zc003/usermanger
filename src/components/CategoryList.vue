<template>
  <div class="container mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">分类管理</h2>
        <el-button type="primary" @click="showCreateDialog">
          <i class="el-icon-plus mr-1"></i>添加顶级分类
        </el-button>
      </div>
      
      <el-tree
        :data="categories"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        draggable
        @node-drop="handleDrop"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node flex items-center justify-between w-full">
            <div>
              <span>{{ node.label }}</span>
              <el-tag v-if="data.isSystem" size="small" type="info" class="ml-2">系统</el-tag>
            </div>
            
            <div>
              <el-button size="small" @click="addChildCategory(data)">
                <i class="el-icon-plus"></i>添加子类
              </el-button>
              <el-button size="small" type="primary" @click="editCategory(data)">
                <i class="el-icon-edit"></i>编辑
              </el-button>
              <el-popconfirm
                title="确定删除该分类？"
                :disabled="data.isSystem"
                @confirm="deleteCategory(data.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger" :disabled="data.isSystem">
                    <i class="el-icon-delete"></i>删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    
    <!-- 分类编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditMode ? '编辑分类' : '添加分类'" 
      width="500px"
    >
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="分类名称" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        <el-form-item label="父分类" prop="parentId">
          <el-cascader
            v-model="form.parentId"
            :options="categories"
            :props="{ value: 'id', label: 'name' }"
            clearable
            placeholder="顶级分类"
            class="w-full"
          />
        </el-form-item>
        
        <el-form-item label="排序值" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        
        <div class="flex justify-end">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategoryTree, createCategory, updateCategory, deleteCategory, reorderCategories } from '@/api/category'

const categories = ref([])
const dialogVisible = ref(false)
const isEditMode = ref(false)
const form = reactive({
  id: null,
  name: '',
  parentId: null,
  sortOrder: 0
})

onMounted(async () => {
  await fetchCategories()
})

// 获取分类树
const fetchCategories = async () => {
  try {
    const res = await getCategoryTree()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEditMode.value = false
  resetForm()
  dialogVisible.value = true
}

// 添加子分类
const addChildCategory = (parent) => {
  isEditMode.value = false
  resetForm()
  form.parentId = parent.id
  dialogVisible.value = true
}

// 编辑分类
const editCategory = (category) => {
  isEditMode.value = true
  form.id = category.id
  form.name = category.name
  form.parentId = category.parentId
  form.sortOrder = category.sortOrder
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.parentId = null
  form.sortOrder = 0
}

// 提交表单
const submitForm = async () => {
  try {
    if (isEditMode.value) {
      await updateCategory(form.id, form)
    } else {
      await createCategory(form)
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    console.error('操作失败', error)
  }
}

// 删除分类
const deleteCategory = async (id) => {
  try {
    await deleteCategory(id)
    fetchCategories()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// 处理拖拽排序
const handleDrop = async (draggingNode, dropNode, dropType) => {
  try {
    const parentId = dropType === 'inner' ? dropNode.data.id : dropNode.data.parentId
    const orderIds = dropNode.parent.childNodes.map(node => node.data.id)
    
    await reorderCategories(orderIds, parentId)
    ElMessage.success('排序已更新')
  } catch (error) {
    console.error('排序失败', error)
    ElMessage.error('排序失败，请重试')
    fetchCategories() // 恢复原始顺序
  }
}
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

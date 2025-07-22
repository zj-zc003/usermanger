<script>
import { ref, reactive, onMounted, /*defineProps, defineEmits*/ } from 'vue'
import TinyMceEditor from '@/components/TinyMceEditor.vue'
import { ElMessage } from 'element-plus'
import { getAllTeacher } from '@/api/teacher'
import { getCategoryTree } from '@/api/category' // 新增：导入分类API

export default {
  components: { TinyMceEditor },
  props: {
    product: {
      type: Object,
      required: true,
      default: () => ({
        title: '',
        subtitle: '',
        coverImg: '',
        description: '',
        detailHtml: '',
        price: 0,
        originPrice: 0,
        type: 1,
        teacherId: null,
        categoryId: [],
        status: 1 // 默认状态
      })
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const form = reactive({ 
        ...props.product,
        // 确保categoryId是数组
        categoryId: props.product.categoryId && Array.isArray(props.product.categoryId) 
        ? props.product.categoryId 
        : []
    })
    const teachers = ref([])
    const categories = ref([])

    // 封面图上传成功处理
    // 修改上传成功处理方法
const handleCoverSuccess = (res) => {
  // 转换Windows路径为URL格式
  const formatUrl = (path) => {
    return path.replace(/\\/g, '/')  // 反斜杠转正斜杠
              .replace(/^\.\//, '') // 移除开头的./
              .replace(/^uploads/, '/uploads'); // 添加URL前缀
  };
  
  // 使用格式化后的URL
  form.coverImg = 'http://localhost:8080' + formatUrl(res.url);
}


    // 上传前校验
    const beforeCoverUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      
      if (!isImage) {
        ElMessage.error('只能上传图片文件')
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过5MB')
      }
      
      return isImage && isLt5M
    }

    // 新增：获取讲师列表的 API 调用
    const fetchTeachers = async () => {
      try {
        const response = await getAllTeacher()
       // 映射为下拉框需要的格式 {id, name}
        teachers.value = response.data.map(teacher => ({
            id: teacher.id,
            name: teacher.realName || teacher.nickname
        }))
      } catch (error) {
        ElMessage.error('网络请求错误')
        console.error('获取讲师列表失败:', error)
      }
    }

    const fetchCategories = async () => {
  try {
    const response = await getCategoryTree()
    console.log('分类数据响应:', response) // 添加调试日志
    
    if (response.code === 200 && response.data) {
      // 转换树形结构为级联选择器格式
      categories.value = transformCategoryTree(response.data)
      console.log('转换后的分类数据:', categories.value) // 添加转换结果日志
    } else {
      ElMessage.error('获取分类数据失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('网络请求错误: ' + error.message)
    console.error('获取分类失败:', error)
  }
}

const transformCategoryTree = (nodes) => {
  return nodes.map(node => {
    const transformed = {
      id: node.id,
      name: node.name,
    }
    
    // 递归处理子节点（即使为空数组也要处理）
    if (node.children && Array.isArray(node.children)) {
      transformed.children = transformCategoryTree(node.children)
    }
    
    return transformed
  })
}


    // 组件挂载时加载数据
    onMounted(() => {
      fetchTeachers()
      fetchCategories() // 新增：加载分类数据
    })
    


    // 提交表单
    const submitForm = () => {
      // 基本验证逻辑
      if (!form.title || form.title.trim() === '') {
        ElMessage.error('请输入产品标题')
        return
      }
      
      if (!form.teacherId) {
        ElMessage.error('请选择讲师')
        return
      }
      
      // 分类验证
      if (!form.categoryId || form.categoryId.length === 0) {
        ElMessage.error('请选择分类')
        return
      }
      
      // 价格验证
      if (form.price === null || form.price < 0) {
        ElMessage.error('请输入有效的价格')
        return
      }
      
      // 准备提交的数据
      const submitData = {
        ...form,
        // 提取最后一级分类ID
        categoryId: form.categoryId.length > 0 
          ? form.categoryId[form.categoryId.length - 1] 
          : null,
        
        // 如果后端需要coverKey而不是coverImg
        // coverKey: extractKeyFromUrl(form.coverImg),
        
        // 确保有默认状态
        status: form.status || 1,
        createUser: 3
      }
      
      console.log('提交数据:', submitData)
      emit('submit', submitData)
    }

    return {
      form,
      teachers,
      categories,
      handleCoverSuccess,
      beforeCoverUpload,
      submitForm
    }
  }
}
</script> 

<template>
  <el-form ref="formRef" :model="form" label-width="100px" label-position="top">
    <div class="grid grid-cols-2 gap-6">
      <!-- 左侧区域 -->
      <div>
        <el-form-item label="产品标题" prop="title" required>
          <el-input v-model="form.title" placeholder="请输入产品标题" />
        </el-form-item>
        
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="请输入副标题" />
        </el-form-item>
        
        <el-form-item label="产品类型" prop="type" required>
          <el-select v-model="form.type" class="w-full">
            <el-option label="专栏" :value="1" />
            <el-option label="视频课" :value="2" />
            <el-option label="音频课" :value="3" />
            <el-option label="电子书" :value="4" />
            <el-option label="直播" :value="5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="价格设置">
          <div class="flex gap-3">
            
            <el-form-item prop="price" required class="flex-1">
                售价：
              <el-input-number 
                v-model="form.price" 
                :min="0" 
                :precision="2" 
                placeholder="售价" 
                class="w-full"
              />
            </el-form-item>
            <el-form-item prop="originPrice" class="flex-1">
                原价：
              <el-input-number 
                v-model="form.originPrice" 
                :min="0" 
                :precision="2" 
                placeholder="原价" 
                class="w-full"
              />
            </el-form-item>
          </div>
        </el-form-item>
      </div>
      
      <!-- 右侧区域 -->
      <div>
        <el-form-item label="封面图" prop="coverImg">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/api/materials/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="form.coverImg" :src="form.coverImg" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="text-xs text-gray-400 mt-1">建议尺寸：800x450像素</div>
        </el-form-item>
        
        <el-form-item label="讲师" prop="teacherId" required>
          <el-select v-model="form.teacherId" filterable class="w-full">
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类" prop="categoryId" required>
          <el-cascader
            v-model="form.categoryId"
            :options="categories"
            :props="{ value: 'id', label: 'name' }"
            clearable
            class="w-full"
          />
        </el-form-item>
      </div>
    </div>
    
    <el-form-item label="产品描述" prop="description">
      <el-input 
        v-model="form.description" 
        type="textarea" 
        :rows="3" 
        placeholder="请输入产品描述"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>
    
    <el-form-item label="详情内容" prop="detailHtml">
      <div class="w-full">
        <TinyMceEditor v-model="form.detailHtml" />
      </div>
    </el-form-item>
    
    <div class="flex justify-end gap-3 pt-4">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
  </el-form>
</template>

<style scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

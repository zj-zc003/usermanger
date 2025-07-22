<template>
  <div class="product-edit">
    <el-card>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入产品标题"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品副标题">
              <el-input v-model="formData.subtitle" placeholder="请输入副标题"/>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="封面图" prop="coverKey">
          <media-selector v-model="formData.coverKey" :type="['image']"/>
          <div v-if="formData.coverKey" class="cover-preview">
            <el-image :src="getCoverUrl(formData.coverKey)" fit="cover" style="width:200px;height:150px"/>
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="产品类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择产品类型">
                <el-option label="专栏" :value="1"/>
                <el-option label="视频课" :value="2"/>
                <el-option label="音频课" :value="3"/>
                <el-option label="电子书" :value="4"/>
                <el-option label="直播" :value="5"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="上架" :value="1"/>
                <el-option label="下架" :value="0"/>
                <el-option label="草稿" :value="2"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否推荐">
              <el-switch v-model="formData.isRecommend"/>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="讲师" prop="teacherId">
              <teacher-selector v-model="formData.teacherId"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="价格(¥)" prop="price">
              <el-input-number 
                v-model="formData.price" 
                :min="0" 
                :precision="2" 
                controls-position="right"
                style="width:100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原价(¥)">
              <el-input-number 
                v-model="formData.originPrice" 
                :min="0" 
                :precision="2" 
                controls-position="right"
                style="width:100%"/>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="产品描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入产品描述"/>
        </el-form-item>
        
        <el-form-item label="详情内容">
          <rich-text-editor v-model="formData.detailHtml"/>
        </el-form-item>
        
        <el-divider>章节管理</el-divider>
        
        <div class="chapter-manager">
          <div class="chapter-list">
            <div v-for="(chapter, index) in formData.chapters" :key="index" class="chapter-item">
              <div class="chapter-header">
                <span class="chapter-title">章节 {{ index + 1 }}: {{ chapter.title }}</span>
                <div class="chapter-actions">
                  <el-button size="small" @click="editChapter(index)">编辑</el-button>
                  <el-button size="small" type="danger" @click="removeChapter(index)">删除</el-button>
                </div>
              </div>
              <div class="chapter-info">
                <el-tag size="small">{{ getContentTypeText(chapter.contentType) }}</el-tag>
                <el-tag size="small" v-if="chapter.isFree" type="success">免费</el-tag>
                <span v-if="chapter.materialName">{{ chapter.materialName }}</span>
              </div>
            </div>
            
            <div v-if="formData.chapters.length === 0" class="empty-chapters">
              <el-empty description="暂无章节"/>
            </div>
          </div>
          
          <div class="add-chapter">
            <el-button type="primary" @click="showChapterDialog">添加章节</el-button>
          </div>
        </div>
        
        <el-form-item class="submit-btns">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 章节编辑对话框 -->
    <chapter-dialog 
      ref="chapterDialog"
      :current-chapter="currentChapter"
      @confirm="saveChapter"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TeacherSelector from '@/components/TeacherSelector.vue'
import MediaSelector from '@/components/MediaSelector.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import ChapterDialog from './components/ChapterDialog.vue'
import { 
  getProductDetail, 
  createProduct, 
  updateProduct 
} from '@/api/product'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const productId = ref(null)

const formData = reactive({
  title: '',
  subtitle: '',
  coverKey: '',
  description: '',
  detailHtml: '',
  price: 0,
  originPrice: 0,
  status: 1,
  type: 1,
  studyMode: 1,
  validDays: 0,
  teacherId: null,
  categoryId: null,
  isRecommend: false,
  sort: 0,
  chapters: []
})

const rules = {
  title: [{ required: true, message: '请输入产品标题', trigger: 'blur' }],
  coverKey: [{ required: true, message: '请选择封面图', trigger: 'blur' }],
  type: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择产品状态', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择讲师', trigger: 'change' }],
  price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }]
}

// 获取产品详情（编辑模式）
const loadProductDetail = async () => {
  try {
    const res = await getProductDetail(productId.value)
    Object.assign(formData, res)
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateProduct(formData)
      ElMessage.success('产品更新成功')
    } else {
      const id = await createProduct(formData)
      ElMessage.success('产品创建成功')
      router.push(`/product/edit/${id}`)
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 章节编辑逻辑
const currentChapterIndex = ref(-1)
const currentChapter = ref(null)
const chapterDialog = ref(null)

const showChapterDialog = (index = -1) => {
  currentChapterIndex.value = index
  currentChapter.value = 
    index >= 0 
      ? { ...formData.chapters[index] } 
      : { title: '', contentType: 1, isFree: false, materialId: null }
  
  chapterDialog.value.open()
}

const saveChapter = (chapter) => {
  if (currentChapterIndex.value >= 0) {
    formData.chapters.splice(currentChapterIndex.value, 1, chapter)
  } else {
    formData.chapters.push(chapter)
  }
}

const editChapter = (index) => {
  showChapterDialog(index)
}

const removeChapter = (index) => {
  formData.chapters.splice(index, 1)
}

// 初始化
onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    productId.value = parseInt(route.params.id)
    loadProductDetail()
  }
})
</script>

<template>
  <div class="material-manager">
    <div class="manager-header">
      <h2 class="page-title">素材管理</h2>
      <div class="header-actions">
        <el-select v-model="currentType" placeholder="选择素材类型" class="type-select">
          <el-option label="全部素材" value="all"></el-option>
          <el-option label="图片" value="image"></el-option>
          <el-option label="视频" value="video"></el-option>
          <el-option label="电子书" value="ebook"></el-option>
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索素材名称"
          class="search-input"
          prefix-icon="el-icon-search"
          clearable
        />
        
        <el-button type="primary" icon="el-icon-upload" @click="showUploadDialog">上传素材</el-button>
      </div>
    </div>
    
    <div class="material-content">
      <!-- 素材列表 -->
      <div v-if="filteredMaterials.length > 0" class="material-grid">
        <div v-for="item in filteredMaterials" :key="item.id" class="material-item">
          <div class="material-preview" @click="previewMaterial(item)">
            <!-- 图片预览 -->
            <img 
              v-if="item.type === 'image'" 
              :src="item.url" 
              :alt="item.name"
              class="preview-image"
            />
            
            <!-- 视频预览 -->
            <div v-else-if="item.type === 'video'" class="video-preview">
              <i class="el-icon-video-play"></i>
              <video :src="item.url" class="preview-video"></video>
            </div>
            
            <!-- 电子书预览 -->
            <div v-else class="ebook-preview">
              <i class="el-icon-document"></i>
              <span>{{ getFileExtension(item.name) }}</span>
            </div>
            
            <!-- 操作按钮 -->
            <div class="item-actions">
              <el-button 
                size="mini" 
                icon="el-icon-download" 
                @click.stop="downloadMaterial(item)"
              />
              <el-button 
                size="mini" 
                icon="el-icon-delete" 
                type="danger" 
                @click.stop="deleteMaterial(item.id)"
              />
            </div>
          </div>
          
          <div class="material-info">
            <div class="material-name">{{ item.name }}</div>
            <div class="material-meta">
              <span>{{ formatFileSize(item.size) }}</span>
              <span>{{ formatDate(item.uploadTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-else description="暂无素材数据" class="empty-state">
        <el-button type="primary" @click="showUploadDialog">上传素材</el-button>
      </el-empty>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog 
      title="上传素材" 
      v-model="uploadDialogVisible" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-upload
        class="material-uploader"
        drag
        multiple
        :action="uploadUrl"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :file-list="fileList"
        :show-file-list="true"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip">
          支持格式：图片(JPG/PNG/GIF/最大5MB)、视频(MP4/最大50MB)、电子书(PDF/EPUB/最大20MB)
        </div>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadDialogVisible = false">完成</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="previewMaterialInfo?.name || '素材预览'"
      width="80%"
      top="5vh"
    >
      <div v-if="previewMaterialInfo?.type === 'image'" class="preview-container">
        <img :src="previewMaterialInfo.url" class="preview-full-image" />
      </div>
      
      <div v-else-if="previewMaterialInfo?.type === 'video'" class="preview-container">
        <video :src="previewMaterialInfo.url" controls class="preview-full-video"></video>
      </div>
      
      <div v-else-if="previewMaterialInfo" class="preview-container">
        <div class="ebook-preview-large">
          <i class="el-icon-document" style="font-size: 80px;"></i>
          <div class="ebook-info">
            <p>文件格式: {{ getFileExtension(previewMaterialInfo.name) }}</p>
            <p>文件大小: {{ formatFileSize(previewMaterialInfo.size) }}</p>
            <el-button 
              type="primary" 
              icon="el-icon-download"
              @click="downloadMaterial(previewMaterialInfo)"
            >
              下载电子书
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'MaterialView',
  setup() {
    const currentType = ref('all')
    const searchKeyword = ref('')
    const uploadDialogVisible = ref(false)
    const previewDialogVisible = ref(false)
    const fileList = ref([])
    const previewMaterialInfo = ref({})
    
    // 模拟数据
    const materials = ref([
      {
        id: 1,
        name: '产品主图.jpg',
        type: 'image',
        url: 'https://dummyimage.com/600x400/4a86e8/ffffff',
        size: 1024 * 120,
        uploadTime: new Date(2023, 5, 15)
      },
      {
        id: 2,
        name: '宣传视频.mp4',
        type: 'video',
        url: 'https://example.com/sample.mp4',
        size: 1024 * 1024 * 25,
        uploadTime: new Date(2023, 6, 2)
      },
      {
        id: 3,
        name: '用户手册.pdf',
        type: 'ebook',
        url: 'https://example.com/manual.pdf',
        size: 1024 * 512,
        uploadTime: new Date(2023, 6, 10)
      },
      {
        id: 4,
        name: 'banner背景.png',
        type: 'image',
        url: 'https://dummyimage.com/800x200/00cc66/ffffff',
        size: 1024 * 85,
        uploadTime: new Date(2023, 6, 18)
      }
    ])
    
    // 计算属性：过滤后的素材列表
    const filteredMaterials = computed(() => {
      let filtered = materials.value
      
      // 按类型过滤
      if (currentType.value !== 'all') {
        filtered = filtered.filter(item => item.type === currentType.value)
      }
      
      // 按关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword)
        )
      }
      
      return filtered
    })
    
    // 格式化函数直接内联实现
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const formatDate = (date) => {
      if (!(date instanceof Date)) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      currentType,
      searchKeyword,
      uploadDialogVisible,
      previewDialogVisible,
      fileList,
      previewMaterialInfo,
      materials,
      filteredMaterials,
      formatFileSize,
      formatDate,
      // 其他方法...
    }
  },
  methods: {
    getFileExtension(name) {
      if (!name) return ''
      const parts = name.split('.')
      return parts.length > 1 ? parts.pop().toUpperCase() : '未知'
    },
    
    showUploadDialog() {
      this.uploadDialogVisible = true
      this.fileList = []
    },
    
    beforeUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isVideo = file.type.startsWith('video/')
      const isEbook = ['application/pdf', 'application/epub+zip'].includes(file.type)
      
      if (!isImage && !isVideo && !isEbook) {
        this.$message.error('不支持的文件格式!')
        return false
      }
      
      // 检查文件大小
      let maxSize = 5 * 1024 * 1024 // 默认5MB
      if (isVideo) maxSize = 50 * 1024 * 1024
      if (isEbook) maxSize = 20 * 1024 * 1024
      
      if (file.size > maxSize) {
        this.$message.error(`文件大小不能超过${this.formatFileSize(maxSize)}!`)
        return false
      }
      
      return true
    },
    
    handleUploadSuccess(response, file) {
      this.$message.success(`${file.name} 上传成功!`)
      
      // 模拟添加新素材
      this.materials.value.unshift({
        id: Date.now(),
        name: file.name,
        type: this.getFileType(file.type),
        url: URL.createObjectURL(file.raw),
        size: file.size,
        uploadTime: new Date()
      })
    },
    
    handleUploadError(err) {
      this.$message.error(`上传失败: ${err.message || '未知错误'}`)
    },
    
    getFileType(mimeType) {
      if (mimeType.startsWith('image/')) return 'image'
      if (mimeType.startsWith('video/')) return 'video'
      return 'ebook'
    },
    
    previewMaterial(item) {
      this.previewMaterialInfo = { ...item }
      this.previewDialogVisible = true
    },
    
    downloadMaterial(item) {
      this.$message.info(`开始下载: ${item.name}`)
      // 模拟下载
      const link = document.createElement('a')
      link.href = item.url
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    
    deleteMaterial(id) {
      this.$confirm('确定要删除这个素材吗?', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.materials.value.findIndex(item => item.id === id)
        if (index !== -1) {
          this.materials.value.splice(index, 1)
          this.$message.success('素材已删除')
        }
      }).catch(() => {})
    }
  }
}
</script>

<!-- 将 SCSS 改为纯 CSS -->
<style scoped>
.material-manager {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.type-select {
  width: 150px;
}

.search-input {
  width: 250px;
}

.material-content {
  flex: 1;
  overflow-y: auto;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.material-item {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.material-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.material-item:hover .item-actions {
  opacity: 1;
}

.material-preview {
  position: relative;
  height: 150px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-preview .el-icon-video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
}

.video-preview .preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.ebook-preview {
  text-align: center;
}

.ebook-preview .el-icon-document {
  font-size: 60px;
  color: #409eff;
}

.ebook-preview span {
  display: block;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.item-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.material-info {
  padding: 12px;
}

.material-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-full-image {
  max-width: 100%;
  max-height: 70vh;
}

.preview-full-video {
  width: 100%;
  max-height: 70vh;
}

.ebook-preview-large {
  text-align: center;
  padding: 40px 0;
}

.ebook-info {
  margin-top: 20px;
}

.ebook-info p {
  margin: 10px 0;
  font-size: 16px;
}

/* 深度选择器兼容写法 */
.material-uploader .el-upload {
  width: 100%;
}

.material-uploader .el-upload .el-upload-dragger {
  width: 100%;
  padding: 40px 0;
}
</style>

<template>
  <div class="chapter-management">
    <div class="app-header">
      <h1 class="app-title">课程章节管理</h1>
      <div class="product-info">
        <span class="product-name">{{ currentProduct.title }}</span>
        <el-tag type="info" size="small">{{ currentProduct.teacher }}</el-tag>
      </div>
    </div>

    <el-row :gutter="24" class="main-content">
      <el-col :span="16" class="tree-container">
        <div class="card tree-card">
          <div class="card-header">
            <h3 class="section-title">章节结构</h3>
            <el-button 
              type="primary" 
              icon="el-icon-plus" 
              size="small"
              @click="openCreateDialog(0)"
              class="add-chapter-btn"
            >
              添加章节
            </el-button>
          </div>
          
          <el-tree
            :data="chapters"
            node-key="id"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            @node-drop="handleDrop"
            :expand-on-click-node="false"
            @node-click="setSelectedChapter"
          >
            <template #default="{ data }">
              <div 
                class="chapter-node" 
                :class="{'selected': selectedChapter && selectedChapter.id === data.id}"
              >
                <div class="chapter-info">
                  <el-tag 
                    size="small" 
                    :type="getContentTypeTag(data.contentType)"
                    effect="dark"
                    class="content-type-tag"
                  >
                    {{ contentTypeMap[data.contentType] }}
                  </el-tag>
                  <span class="chapter-title">{{ data.title }}</span>
                  
                  <div class="chapter-meta">
                    <span v-if="data.duration" class="duration">
                      <i class="el-icon-time"></i> {{ formatDuration(data.duration) }}
                    </span>
                    <el-tag v-if="data.isFree" size="mini" type="success" class="free-tag">免费</el-tag>
                  </div>
                </div>
                
                <div class="chapter-actions">
                  <el-button 
                    @click.stop="openEditDialog(data)"
                  >编辑</el-button>
                  <!--<el-button 
                    size="small" 
                    icon="el-icon-plus" 
                    circle 
                    type="success"
                    @click.stop="openCreateDialog(data.id)"
                  ></el-button>-->
                  <el-button 
                    type="danger"
                    @click.stop="deleteChapter(data.id)"
                  >删除</el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>
      
      <el-col :span="8" class="preview-container">
        <div class="card preview-card">
          <div class="card-header">
            <h3 class="section-title">多媒体预览</h3>
          </div>
          
          <div class="preview-area">
            <div v-if="selectedChapter" class="preview-content">
              <div class="preview-header">
                <h4>{{ selectedChapter.title }}</h4>
                <el-tag :type="getContentTypeTag(selectedChapter.contentType)" size="small">
                  {{ contentTypeMap[selectedChapter.contentType] }}
                </el-tag>
              </div>
              
              <div class="media-preview">
                <div v-if="selectedChapter.contentType === 1" class="video-preview">
                  <video-player :src="selectedChapter.previewUrl" />
                </div>
                
                <div v-else-if="selectedChapter.contentType === 2" class="audio-preview">
                  <audio-player :src="selectedChapter.previewUrl" />
                </div>
                
                <div v-else-if="selectedChapter.contentType === 4" class="pdf-preview">
                  <pdf-viewer :src="selectedChapter.previewUrl" :page-count="selectedChapter.pageCount" />
                </div>
                
                <div v-else class="text-preview">
                  <div class="text-content" v-html="selectedChapter.content"></div>
                </div>
              </div>
              
              <div class="chapter-details">
                <div class="detail-item">
                  <span class="detail-label">章节ID:</span>
                  <span>{{ selectedChapter.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">是否免费:</span>
                  <el-tag :type="selectedChapter.isFree ? 'success' : 'info'" size="small">
                    {{ selectedChapter.isFree ? '免费' : '付费' }}
                  </el-tag>
                </div>
                <div class="detail-item">
                  <span class="detail-label">排序值:</span>
                  <span>{{ selectedChapter.sort }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-preview">
              <div class="empty-content">
                <i class="el-icon-picture-outline"></i>
                <p>请选择章节进行预览</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 创建/编辑章节对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model:visible="dialogVisible"
      width="600px"
      custom-class="chapter-dialog"
    >
      <el-form :model="chapterForm" label-width="100px" label-position="top">
        <el-form-item label="章节标题" required>
          <el-input 
            v-model="chapterForm.title" 
            placeholder="输入章节标题" 
            size="large"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="内容类型" required>
              <el-select 
                v-model="chapterForm.contentType" 
                placeholder="选择内容类型"
                class="full-width"
              >
                <el-option 
                  v-for="(label, value) in contentTypeMap" 
                  :key="value"
                  :label="label"
                  :value="Number(value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序值">
              <el-input-number 
                v-model="chapterForm.sort" 
                :min="0" 
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item 
          label="上传文件" 
          v-if="chapterForm.contentType !== 3"
          class="upload-item"
        >
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
          >
            <el-button size="small" type="primary" plain icon="el-icon-upload">
              选择文件
            </el-button>
            <div v-if="chapterForm.file" class="file-info">
              <i class="el-icon-document"></i>
              {{ chapterForm.file.name }} ({{ formatFileSize(chapterForm.file.size) }})
            </div>
            <div v-else class="file-hint">
              支持视频、音频、PDF格式文件
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="内容" v-if="chapterForm.contentType === 3">
          <el-input 
            type="textarea" 
            v-model="chapterForm.content" 
            :rows="6" 
            placeholder="输入图文内容"
          />
        </el-form-item>
        
        <el-form-item label="是否免费" class="free-switch">
          <el-switch 
            v-model="chapterForm.isFree" 
            active-text="免费" 
            inactive-text="付费" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChapter">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import VideoPlayer from '@/components/VideoPlayer.vue';
import AudioPlayer from '@/components/AudioPlayer.vue';
import PdfViewer from '@/components/PdfViewer.vue';

export default {
  components: {
    VideoPlayer,
    AudioPlayer,
    PdfViewer
  },
  setup() {
    // 模拟数据
    const currentProduct = ref({
      id: 1001,
      title: 'Vue3 高级开发实战',
      teacher: '张老师'
    });
    
    const chapters = ref([
      {
        id: 1,
        productId: 1001,
        title: '第一章 Vue3基础',
        contentType: 1, // 1:视频 2:音频 3:图文 4:PDF
        previewUrl: '/mock/videos/chapter1.mp4',
        duration: 1250,
        isFree: true,
        sort: 1,
        parentId: 0,
        children: [
          {
            id: 2,
            productId: 1001,
            title: 'Composition API',
            contentType: 1,
            previewUrl: '/mock/videos/chapter1-1.mp4',
            duration: 420,
            isFree: true,
            sort: 1,
            parentId: 1
          },
          {
            id: 3,
            productId: 1001,
            title: '响应式原理',
            contentType: 4,
            previewUrl: '/mock/pdfs/reactive.pdf',
            pageCount: 12,
            duration: 0,
            isFree: false,
            sort: 2,
            parentId: 1
          }
        ]
      },
      {
        id: 4,
        productId: 1001,
        title: '第二章 状态管理',
        contentType: 3, // 图文
        content: '<p>Vuex 和 Pinia 是 Vue 生态中最流行的状态管理方案。本章将深入比较两者的优缺点，并通过实际案例展示如何在不同场景下选择合适的状态管理方案。</p><p><strong>主要内容：</strong></p><ul><li>Vuex 核心概念与使用</li><li>Pinia 的现代化设计理念</li><li>模块化状态管理实践</li><li>性能优化技巧</li></ul>',
        isFree: false,
        sort: 2,
        parentId: 0,
        children: [
          {
            id: 5,
            productId: 1001,
            title: 'Pinia 实战',
            contentType: 1,
            previewUrl: '/mock/videos/chapter2-1.mp4',
            duration: 680,
            isFree: false,
            sort: 1,
            parentId: 4
          }
        ]
      }
    ]);
    
    // 内容类型映射
    const contentTypeMap = {
      1: '视频',
      2: '音频',
      3: '图文',
      4: 'PDF'
    };
    
    // 选中的章节
    const selectedChapter = ref(null);
    
    // 设置选中的章节
    const setSelectedChapter = (data) => {
      selectedChapter.value = data;
    };
    
    // 对话框状态
    const dialogVisible = ref(false);
    const isEditing = ref(false);
    const parentChapterId = ref(0);
    
    // 章节表单
    const chapterForm = reactive({
      id: null,
      title: '',
      contentType: 1,
      file: null,
      content: '',
      isFree: false,
      sort: 0
    });
    
    // 对话框标题
    const dialogTitle = computed(() => {
      return isEditing.value ? '编辑章节' : '创建章节';
    });
    
    // 打开创建对话框
    const openCreateDialog = (parentId) => {
      parentChapterId.value = parentId;
      isEditing.value = false;
      resetForm();
      dialogVisible.value = true;
    };
    
    // 打开编辑对话框
    const openEditDialog = (chapter) => {
      Object.assign(chapterForm, {
        id: chapter.id,
        title: chapter.title,
        contentType: chapter.contentType,
        content: chapter.content || '',
        isFree: chapter.isFree,
        sort: chapter.sort
      });
      isEditing.value = true;
      dialogVisible.value = true;
    };
    
    // 重置表单
    const resetForm = () => {
      Object.assign(chapterForm, {
        id: null,
        title: '',
        contentType: 1,
        file: null,
        content: '',
        isFree: false,
        sort: 0
      });
    };
    
    // 处理文件选择
    const handleFileChange = (file) => {
      chapterForm.file = file.raw;
    };
    
    // 保存章节
    const saveChapter = () => {
      // 模拟保存逻辑
      const newChapter = {
        id: isEditing.value ? chapterForm.id : Date.now(),
        productId: currentProduct.value.id,
        title: chapterForm.title,
        contentType: chapterForm.contentType,
        isFree: chapterForm.isFree,
        sort: chapterForm.sort,
        parentId: parentChapterId.value
      };
      
      if (chapterForm.contentType === 3) {
        newChapter.content = chapterForm.content;
      } else {
        // 模拟上传后返回的URL
        newChapter.previewUrl = `/mock/${contentTypeMap[chapterForm.contentType].toLowerCase()}/new-chapter`;
        if (chapterForm.contentType === 1 || chapterForm.contentType === 2) {
          newChapter.duration = Math.floor(Math.random() * 600) + 60; // 随机时长
        } else if (chapterForm.contentType === 4) {
          newChapter.pageCount = Math.floor(Math.random() * 20) + 5; // 随机页数
        }
      }
      
      // 添加到树形结构
      if (isEditing.value) {
        // 更新逻辑
        const updateChapterInTree = (tree) => {
          for (let i = 0; i < tree.length; i++) {
            if (tree[i].id === newChapter.id) {
              tree[i] = { ...tree[i], ...newChapter };
              return true;
            }
            if (tree[i].children && tree[i].children.length > 0) {
              if (updateChapterInTree(tree[i].children)) return true;
            }
          }
          return false;
        };
        
        updateChapterInTree(chapters.value);
      } else {
        // 创建逻辑
        if (parentChapterId.value === 0) {
          chapters.value.push(newChapter);
        } else {
          const addToParent = (tree) => {
            for (let i = 0; i < tree.length; i++) {
              if (tree[i].id === parentChapterId.value) {
                if (!tree[i].children) tree[i].children = [];
                tree[i].children.push(newChapter);
                return true;
              }
              if (tree[i].children && tree[i].children.length > 0) {
                if (addToParent(tree[i].children)) return true;
              }
            }
            return false;
          };
          
          addToParent(chapters.value);
        }
      }
      
      dialogVisible.value = false;
      ElMessage.success(isEditing.value ? '章节更新成功' : '章节创建成功');
    };
    
    // 删除章节
    const deleteChapter = (id) => {
      ElMessageBox.confirm('确定删除此章节？所有子章节也将被删除', '警告', {
        type: 'warning'
      }).then(() => {
        const removeFromTree = (tree) => {
          for (let i = 0; i < tree.length; i++) {
            if (tree[i].id === id) {
              tree.splice(i, 1);
              return true;
            }
            if (tree[i].children && tree[i].children.length > 0) {
              if (removeFromTree(tree[i].children)) return true;
            }
          }
          return false;
        };
        
        if (removeFromTree(chapters.value)) {
          ElMessage.success('章节删除成功');
          if (selectedChapter.value && selectedChapter.value.id === id) {
            selectedChapter.value = null;
          }
        }
      }).catch(() => {});
    };
    
    // 树形拖拽验证
    const allowDrop = (draggingNode, dropNode) => {
      // 只允许同级拖拽
      return draggingNode.level === dropNode.level;
    };
    
    // 处理拖拽完成
    const handleDrop = () => {
      // 这里可以调用API保存排序结果
      ElMessage.success('章节顺序已更新');
    };
    
    // 格式化时长
    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // 获取内容类型标签样式
    const getContentTypeTag = (type) => {
      const typeMap = {
        1: 'danger', // 视频
        2: 'warning', // 音频
        3: '', // 图文
        4: 'success' // PDF
      };
      return typeMap[type] || '';
    };
    
    return {
      currentProduct,
      chapters,
      contentTypeMap,
      selectedChapter,
      dialogVisible,
      dialogTitle,
      chapterForm,
      openCreateDialog,
      openEditDialog,
      saveChapter,
      deleteChapter,
      handleFileChange,
      allowDrop,
      handleDrop,
      formatDuration,
      formatFileSize,
      getContentTypeTag,
      setSelectedChapter
    };
  }
};
</script>

<style scoped lang="scss">
.chapter-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.app-header {
  margin-bottom: 24px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #4c84ff 0%, #2a5ebd 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(42, 94, 189, 0.25);
  
  .app-title {
    margin: 0;
    font-weight: 600;
    font-size: 24px;
    display: flex;
    align-items: center;
    
    &::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 24px;
      background: white;
      border-radius: 2px;
      margin-right: 12px;
    }
  }
  
  .product-info {
    display: flex;
    align-items: center;
    margin-top: 8px;
    
    .product-name {
      font-size: 16px;
      margin-right: 12px;
      font-weight: 500;
    }
  }
}

.main-content {
  margin-top: 16px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafbfc;
  
  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .add-chapter-btn {
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: 500;
  }
}

.tree-container {
  .tree-card {
    height: calc(100vh - 220px);
    display: flex;
    flex-direction: column;
    
    :deep(.el-tree) {
      flex: 1;
      overflow: auto;
      padding: 0 16px 16px;
    }
  }
}

.preview-container {
  .preview-card {
    height: calc(100vh - 220px);
    display: flex;
    flex-direction: column;
    
    .preview-area {
      flex: 1;
      overflow: auto;
      padding: 0 16px 16px;
    }
  }
}

.chapter-node {
  padding: 8px; /* 减少内边距 */
  min-height: 42px; /* 设置最小高度 */
  box-sizing: border-box; /* 确保尺寸计算包含内边距 */
  
  /* 保持其他样式不变 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 8px;
  transition: background 0.3s ease;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &.selected {
    background-color: #ecf5ff;
    border-left: 3px solid #409eff;
  }
}

/* 调整章节信息区域的布局 */
.chapter-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px; /* 增加元素间距 */
  
  .content-type-tag {
    font-weight: 500;
    min-width: 50px;
    text-align: center;
    flex-shrink: 0; /* 防止标签被压缩 */
  }
}

/* 优化章节标题的显示 */
.chapter-title {
  font-weight: 500;
  color: #303133;
  flex: 1; /* 允许标题根据需要扩展 */
  min-width: 0; /* 允许文本截断 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 调整元数据区域 */
.chapter-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0; /* 防止元数据区域被压缩 */
  
  .duration {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap; /* 防止时间换行 */
  }
  
  .free-tag {
    font-weight: 500;
    white-space: nowrap; /* 防止标签文字换行 */
  }
}

/* 调整操作按钮 */
.chapter-actions {
  display: flex;
  gap: 8px; /* 增加按钮间距 */
  flex-shrink: 0; /* 防止按钮被压缩 */
  
  .el-button {
    opacity: 0.7;
    transition: opacity 0.3s;
    padding: 6px 10px; /* 调整按钮内边距 */
    font-size: 12px; /* 减小按钮字体大小 */
    
    &:hover {
      opacity: 1;
    }
  }
}

.preview-area {
  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    
    h4 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  
  .media-preview {
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
    border: 1px solid #ebeef5;
    
    .video-preview, .audio-preview, .pdf-preview {
      padding: 12px;
    }
    
    .text-preview {
      padding: 16px;
      background: white;
      
      .text-content {
        line-height: 1.8;
        color: #606266;
        
        :deep(p) {
          margin: 8px 0;
        }
        
        :deep(ul) {
          padding-left: 20px;
          margin: 12px 0;
        }
        
        :deep(li) {
          margin-bottom: 6px;
        }
      }
    }
  }
  
  .chapter-details {
    margin-top: 20px;
    padding: 16px;
    background: #f9fafc;
    border-radius: 8px;
    
    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        width: 80px;
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #909399;
  
  .empty-content {
    padding: 40px;
    
    i {
      font-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
      display: block;
    }
    
    p {
      margin: 0;
      font-size: 16px;
    }
  }
}

.upload-item {
  :deep(.el-upload) {
    width: 100%;
  }
  
  .file-info {
    margin-top: 12px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 14px;
  }
  
  .file-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
}

.free-switch {
  :deep(.el-form-item__content) {
    justify-content: flex-start;
  }
}

.full-width {
  width: 100%;
}

@media (max-width: 1200px) {
  .el-col {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }
  
  .preview-container {
    margin-top: 24px;
  }
}
/* 为树节点添加垂直间距 */
:deep(.el-tree-node__content) {
  height: auto !important; /* 允许节点根据内容调整高度 */
  margin-bottom: 4px; /* 节点之间的垂直间距 */
}
</style>

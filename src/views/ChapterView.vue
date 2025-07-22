<template>
  <div class="chapter-management">
    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 章节树形结构 -->
        <div class="card">
          <div class="card-header">
            <h3>{{ currentProduct.title }} - 章节管理</h3>
            <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog(0)">添加章节</el-button>
          </div>
          
          <el-tree
            :data="chapters"
            node-key="id"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            @node-drop="handleDrop"
            :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <div class="chapter-node">
                <div class="chapter-info">
                  <el-tag size="small" :type="getContentTypeTag(data.contentType)">
                    {{ contentTypeMap[data.contentType] }}
                  </el-tag>
                  <span class="chapter-title">{{ data.title }}</span>
                  
                  <div class="chapter-meta">
                    <span v-if="data.duration" class="duration">
                      <i class="el-icon-time"></i> {{ formatDuration(data.duration) }}
                    </span>
                    <el-tag v-if="data.isFree" size="mini" type="success">免费</el-tag>
                  </div>
                </div>
                
                <div class="chapter-actions">
                  <el-button size="small" icon="el-icon-edit" @click="openEditDialog(data)"></el-button>
                  <el-button size="small" icon="el-icon-plus" @click="openCreateDialog(data.id)"></el-button>
                  <el-button 
                    size="small" 
                    icon="el-icon-delete" 
                    type="danger"
                    @click="deleteChapter(data.id)"
                  ></el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>
      
      <el-col :span="8">
        <!-- 多媒体预览区 -->
        <div class="card">
          <div class="card-header">
            <h3>多媒体预览</h3>
          </div>
          
          <div class="preview-area">
            <div v-if="selectedChapter" class="preview-content">
              <h4>{{ selectedChapter.title }}</h4>
              
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
            
            <div v-else class="empty-preview">
              <el-empty description="请选择章节进行预览" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 创建/编辑章节对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form :model="chapterForm" label-width="100px">
        <el-form-item label="章节标题" required>
          <el-input v-model="chapterForm.title" placeholder="输入章节标题" />
        </el-form-item>
        
        <el-form-item label="内容类型" required>
          <el-select v-model="chapterForm.contentType" placeholder="选择内容类型">
            <el-option 
              v-for="(label, value) in contentTypeMap" 
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="上传文件" v-if="chapterForm.contentType !== 3">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div v-if="chapterForm.file" class="file-info">
              {{ chapterForm.file.name }} ({{ formatFileSize(chapterForm.file.size) }})
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
        
        <el-form-item label="是否免费">
          <el-switch v-model="chapterForm.isFree"></el-switch>
        </el-form-item>
        
        <el-form-item label="排序值">
          <el-input-number v-model="chapterForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import VideoPlayer from './components/VideoPlayer.vue';
import AudioPlayer from './components/AudioPlayer.vue';
import PdfViewer from './components/PdfViewer.vue';

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
        content: '<p>Vuex 和 Pinia 是 Vue 生态中最流行的状态管理方案...</p>',
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
    const allowDrop = (draggingNode, dropNode, type) => {
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
      getContentTypeTag
    };
  }
};
</script>

<style scoped>
.chapter-management {
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.chapter-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
}

.chapter-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.chapter-title {
  margin: 0 10px;
  font-weight: 500;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.chapter-actions {
  margin-left: 10px;
}

.preview-area {
  padding: 20px;
  min-height: 500px;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.video-preview, .audio-preview {
  margin-top: 15px;
}

.text-preview {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.file-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>

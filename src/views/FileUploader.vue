<template>
  <div class="upload-container">
    <div class="upload-header">
      <h2>素材上传</h2>
      <p>支持图片、文档、视频、音频和压缩文件，最大100MB</p>
      <button class="close-btn" @click="cancel">×</button>
    </div>

    <!-- 文件选择区域 -->
    <div class="upload-area">
      <input 
        type="file" 
        id="fileInput" 
        ref="fileInput"
        @change="handleFileSelect" 
        multiple
        hidden
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-rar-compressed"
      >
      <label for="fileInput" class="file-select-btn">
        <span>📁 选择文件</span>
      </label>
      
      <div 
        class="drop-zone" 
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="{ 'drag-active': isDragActive }"
      >
        <p>📤 拖拽文件到此处上传</p>
      </div>
    </div>

    <!-- 文件元数据表单 -->
    <div class="metadata-form" v-if="files.length > 0">
      <div class="form-group">
        <label for="category">分类：</label>
        <select id="category" v-model="currentCategoryId">
          <option value="">-- 请选择分类 --</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group" v-for="(file, index) in files" :key="file.id">
        <div class="file-header">
          <div class="file-icon">{{ getFileIcon(file.type) }}</div>
          <div class="file-name">{{ file.name }}</div>
        </div>
        
        <div class="file-metadata">
          <div class="input-group">
            <label :for="`title-${index}`">标题：</label>
            <input 
              type="text" 
              :id="`title-${index}`" 
              v-model="file.metadata.title"
              placeholder="请输入标题（默认使用文件名）"
              maxlength="100"
            >
          </div>
          
          <div class="input-group">
            <label :for="`desc-${index}`">描述：</label>
            <textarea 
              :id="`desc-${index}`" 
              v-model="file.metadata.description"
              placeholder="请输入文件描述"
              maxlength="500"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件列表展示 -->
    <div class="file-list" v-if="files.length > 0">
      <div class="file-item" v-for="(file, index) in files" :key="file.id">
        <div class="file-info">
          <div class="file-icon">
            <span>{{ getFileIcon(file.type) }}</span>
          </div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatSize(file.size) }}</div>
            <div class="file-status" :class="getStatusClass(uploadStatuses[index])">
              {{ uploadStatuses[index] }}
            </div>
          </div>
        </div>
        
        <div class="file-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="{ success: progress[index] === 100, error: uploadStatuses[index].includes('失败') }"
              :style="{ width: progress[index] + '%' }"
            ></div>
          </div>
          <div class="progress-text">{{ progress[index] }}%</div>
        </div>
        
        <button class="remove-btn" @click="removeFile(index)" :disabled="isUploading">
          <span>×</span>
        </button>
      </div>
    </div>

    <!-- 上传控制 -->
    <div class="upload-controls">
      <button 
        class="upload-btn" 
        @click="startUpload"
        :disabled="files.length === 0 || isUploading"
      >
        <span>{{ uploadButtonText }}</span>
      </button>
      <button 
        class="cancel-btn" 
        @click="resetUpload"
        v-if="files.length > 0 && !isUploading"
      >
        <span>取消</span>
      </button>
    </div>

    <!-- 上传状态 -->
    <div class="upload-status">
      <div v-if="globalUploadStatus" :class="['status-message', statusClass]">
        {{ globalUploadStatus }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FileUploader',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: Number,
      default: 1
    }
  },
  emits: ['upload-success', 'upload-error', 'cancel'],
  data() {
    return {
      // 文件上传状态
      files: [],
      progress: [],
      uploadStatuses: [],
      isUploading: false,
      globalUploadStatus: '',
      isDragActive: false,
      nextFileId: 1,
      
      // 文件元数据
      currentCategoryId: '',
      
      // API配置
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
    };
  },
  computed: {
    uploadButtonText() {
      if (this.isUploading) return '上传中...';
      return this.files.length > 0 ? `上传 ${this.files.length} 个文件` : '请选择文件';
    },
    statusClass() {
      if (this.globalUploadStatus.includes('成功')) return 'success';
      if (this.globalUploadStatus.includes('失败')) return 'error';
      return 'info';
    }
  },
  methods: {
    // 文件处理方法
    handleFileSelect(e) {
      const input = e.target;
      if (input.files && input.files.length > 0) {
        this.addFiles(Array.from(input.files));
      }
      // 重置input以允许再次选择相同文件
      input.value = '';
    },
    handleDragOver() {
      this.isDragActive = true;
    },
    handleDragLeave() {
      this.isDragActive = false;
    },
    handleDrop(e) {
      this.isDragActive = false;
      if (e.dataTransfer?.files) {
        this.addFiles(Array.from(e.dataTransfer.files));
      }
    },
    addFiles(fileList) {
      for (const file of fileList) {
        // 检查文件大小（最大100MB）
        if (file.size > 100 * 1024 * 1024) {
          this.globalUploadStatus = `文件 ${file.name} 超过100MB大小限制`;
          continue;
        }

        // 检查文件类型
        const fileType = file.type.split('/')[0];
        const supportedTypes = ['image', 'video', 'audio', 'application'];
        if (!supportedTypes.includes(fileType)) {
          this.globalUploadStatus = `不支持的文件类型: ${file.name}`;
          continue;
        }

        // 添加到文件列表
        this.files.push({
          id: this.nextFileId++,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          metadata: {
            title: '',
            description: '',
            categoryId: this.currentCategoryId
          }
        });
        
        // 初始化进度和状态
        this.progress.push(0);
        this.uploadStatuses.push('等待上传');
      }
    },
    
    // 文件管理方法
    removeFile(index) {
      this.files.splice(index, 1);
      this.progress.splice(index, 1);
      this.uploadStatuses.splice(index, 1);
    },
    resetUpload() {
      this.files = [];
      this.progress = [];
      this.uploadStatuses = [];
      this.isUploading = false;
      this.globalUploadStatus = '';
      this.currentCategoryId = '';
    },
    
    // 辅助函数
    formatSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    getFileIcon(type) {
      if (!type) return '📁';
      if (type.startsWith('image')) return '🖼️';
      if (type.startsWith('video')) return '🎬';
      if (type.startsWith('audio')) return '🔊';
      if (type.includes('pdf')) return '📄';
      if (type.includes('word')) return '📝';
      if (type.includes('excel')) return '📊';
      if (type.includes('zip') || type.includes('rar')) return '📦';
      return '📁';
    },
    getStatusClass(status) {
      if (status.includes('成功')) return 'success';
      if (status.includes('失败')) return 'error';
      return '';
    },
    
    // 上传逻辑
    async startUpload() {
      if (this.files.length === 0 || this.isUploading) return;
      
      this.isUploading = true;
      this.globalUploadStatus = '开始上传文件...';
      
      // 重置所有上传状态
      this.uploadStatuses = this.files.map(() => '等待上传');
      this.progress = this.files.map(() => 0);

      try {
        // 并行上传所有文件
        const uploadPromises = this.files.map((file, index) => {
          return this.uploadFile(file, index);
        });

        // 等待所有文件上传完成
        const results = await Promise.all(uploadPromises);
        
        // 统计上传结果
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;
        
        this.globalUploadStatus = `上传完成: ${successCount} 个成功, ${errorCount} 个失败`;
        
        // 触发成功事件
        const successFiles = results
          .filter(r => r.success)
          .map(r => r.response);
        
        if (successFiles.length > 0) {
          this.$emit('upload-success', successFiles);
        }
        
      } catch (error) {
        this.globalUploadStatus = `上传失败: ${error.message}`;
        this.$emit('upload-error', error);
      } finally {
        this.isUploading = false;
      }
    },
    
    async uploadFile(fileInfo, index) {
      try {
        this.uploadStatuses[index] = '准备上传';
        
        // 准备FormData
        const formData = new FormData();
        formData.append('file', fileInfo.file);
        
        // 添加元数据（使用默认值或用户输入）
        const metadata = {
          title: fileInfo.metadata.title || fileInfo.name,
          description: fileInfo.metadata.description || '',
          categoryId: fileInfo.metadata.categoryId || this.currentCategoryId || null,
          userId: this.currentUserId
        };
        
        // 添加元数据到FormData
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        
        // 发送上传请求
        const response = await axios.post(
          `${this.apiBaseUrl}/api/materials/upload`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              // 更新上传进度
              if (progressEvent.total > 0) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                this.progress[index] = percentCompleted;
                this.uploadStatuses[index] = `上传中 (${percentCompleted}%)`;
              }
            }
          }
        );
        
        // 处理响应
        if (response.data && response.data.code === 200) {
          this.uploadStatuses[index] = '上传成功';
          this.progress[index] = 100;
          return {
            success: true,
            fileInfo,
            response: response.data.data
          };
        } else {
          throw new Error(response.data?.message || '上传失败');
        }
        
      } catch (error) {
        console.error('上传失败:', error);
        this.progress[index] = 0;
        
        let errorMessage = '上传失败';
        if (error.response) {
          // 处理后端返回的错误信息
          if (error.response.status === 400) {
            errorMessage = '文件无效或缺失';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = `服务器错误: ${error.response.status}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.uploadStatuses[index] = errorMessage;
        
        return {
          success: false,
          fileInfo,
          error: errorMessage
        };
      }
    },
    
    // 取消上传
    cancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.upload-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.upload-header {
  position: relative;
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.upload-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.upload-header p {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f56c6c;
}

.upload-area {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.file-select-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  background: #f8f9fa;
  border: 2px dashed #3498db;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  width: 45%;
  font-weight: 500;
  color: #2c3e50;
}

.file-select-btn:hover {
  background: #e3f2fd;
  transform: translateY(-3px);
}

.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: #f8f9fa;
  border: 2px dashed #95a5a6;
  border-radius: 10px;
  width: 55%;
  transition: all 0.3s ease;
}

.drop-zone p {
  color: #7f8c8d;
  margin: 0;
  text-align: center;
}

.drag-active {
  background: #e3f2fd;
  border-color: #3498db;
}

.drag-active p {
  color: #3498db;
}

.metadata-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.form-group:last-child {
  border-bottom: none;
}

.file-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.file-header .file-icon {
  font-size: 1.5rem;
  margin-right: 10px;
}

.file-header .file-name {
  font-weight: 500;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.input-group input, 
.input-group textarea,
.input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.input-group textarea {
  min-height: 80px;
  resize: vertical;
}

.file-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: #edf2f7;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-info .file-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 8px;
  margin-right: 15px;
  font-size: 1.4rem;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.file-status {
  font-size: 0.85rem;
  margin-top: 3px;
}

.file-status.success {
  color: #67c23a;
}

.file-status.error {
  color: #f56c6c;
}

.file-progress {
  width: 200px;
  margin: 0 15px;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-fill.success {
  background: #67c23a;
}

.progress-fill.error {
  background: #f56c6c;
}

.progress-text {
  font-size: 0.8rem;
  text-align: center;
  color: #7f8c8d;
  margin-top: 5px;
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fce8e6;
  transform: scale(1.1);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.upload-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.upload-btn, .cancel-btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.upload-btn {
  background: #3498db;
  color: white;
}

.upload-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.upload-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #f56c6c;
  border: 1px solid #e0e0e0;
}

.cancel-btn:hover {
  background: #fce8e6;
  transform: translateY(-2px);
}

.upload-status {
  margin-top: 20px;
  text-align: center;
}

.status-message {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  display: inline-block;
}

.status-message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
}

.status-message.info {
  background: #e3f2fd;
  color: #1565c0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

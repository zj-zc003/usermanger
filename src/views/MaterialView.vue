<template>
  <div class="app-container">
    <!-- 头部导航 -->
    <header class="app-header">
      <h1>素材管理系统</h1>
      <div class="nav-buttons">
        <button 
          :class="['nav-btn', { active: activeView === 'management' }]"
          @click="switchView('management')"
        >
          素材管理
        </button>
        <button 
          :class="['nav-btn', { active: activeView === 'upload' }]"
          @click="switchView('upload')"
        >
          上传素材
        </button>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="app-content">
      <!-- 素材管理视图 -->
      <div v-if="activeView === 'management'" class="material-management">
        <!-- 素材管理头部 -->
        <div class="material-header">
          <div class="page-title">
            <h1>素材管理</h1>
            <p>管理您的所有教学素材，包括图片、文档、视频等</p>
          </div>
          <div class="actions">
            <button class="btn btn-outline" @click="toggleFilterPanel">
              {{ showFilterPanel ? '隐藏筛选' : '显示筛选' }}
            </button>
            <button class="btn btn-primary" @click="switchView('upload')">
              上传素材
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-wrapper">
          <!-- 左侧筛选面板 -->
          <div class="filter-panel" :class="{ 'mobile-hidden': !showFilterPanel }">
            <div class="search-box">
              <input type="text" placeholder="搜索素材..." v-model="searchKeyword">
            </div>
            
            <div class="filter-group">
              <h3>素材分类</h3>
              <ul class="filter-options">
                <li><a href="#" :class="{active: activeCategory === 'all'}" @click.prevent="setActiveCategory('all')">全部素材</a></li>
                <li><a href="#" :class="{active: activeCategory === 'image'}" @click.prevent="setActiveCategory('image')">图片</a></li>
                <li><a href="#" :class="{active: activeCategory === 'document'}" @click.prevent="setActiveCategory('document')">文档</a></li>
                <li><a href="#" :class="{active: activeCategory === 'video'}" @click.prevent="setActiveCategory('video')">视频</a></li>
                <li><a href="#" :class="{active: activeCategory === 'audio'}" @click.prevent="setActiveCategory('audio')">音频</a></li>
                <li><a href="#" :class="{active: activeCategory === 'archive'}" @click.prevent="setActiveCategory('archive')">压缩包</a></li>
              </ul>
            </div>
            
            <div class="filter-group">
              <h3>素材标签</h3>
              <ul class="filter-options">
                <li><a href="#" :class="{active: activeTag === 'common'}" @click.prevent="setActiveTag('common')">常用素材</a></li>
                <li><a href="#" :class="{active: activeTag === 'course'}" @click.prevent="setActiveTag('course')">课程资料</a></li>
                <li><a href="#" :class="{active: activeTag === 'marketing'}" @click.prevent="setActiveTag('marketing')">营销素材</a></li>
                <li><a href="#" :class="{active: activeTag === 'case'}" @click.prevent="setActiveTag('case')">用户案例</a></li>
              </ul>
            </div>
            
            <div class="filter-group">
              <h3>排序方式</h3>
              <ul class="filter-options">
                <li><a href="#" :class="{active: sortBy === 'date'}" @click.prevent="setSortBy('date')">最新上传</a></li>
                <li><a href="#" :class="{active: sortBy === 'name'}" @click.prevent="setSortBy('name')">名称排序</a></li>
                <li><a href="#" :class="{active: sortBy === 'size'}" @click.prevent="setSortBy('size')">文件大小</a></li>
              </ul>
            </div>
          </div>

          <!-- 素材展示区域 -->
          <div class="material-container">
            <div class="material-grid">
              <!-- 素材卡片 -->
              <div 
                v-for="(material, index) in filteredMaterials" 
                :key="index"
                class="material-card"
                :style="{ 
                  transform: hoverIndex === index ? 'translateY(-3px)' : 'none',
                  boxShadow: hoverIndex === index ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)'
                }"
                @mouseenter="hoverIndex = index"
                @mouseleave="hoverIndex = -1"
              >
                <div class="card-thumb">
                  <span class="file-icon">{{ getFileIcon(material.type) }}</span>
                  <span class="card-tag">{{ getTypeName(material.type) }}</span>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ material.title }}</h3>
                  <div class="card-meta">
                    <span>{{ formatFileSize(material.size) }}</span>
                    <span>{{ material.date }}</span>
                  </div>
                  <div class="card-actions">
                    <button class="action-btn" @click="downloadMaterial(material)">下载</button>
                    <button class="action-btn" @click="copyLink(material)">复制链接</button>
                    <button class="action-btn" @click="showMoreOptions(material)">更多</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 空状态提示 -->
            <div v-if="filteredMaterials.length === 0" class="empty-state">
              <h3>暂无素材</h3>
              <p>点击"上传素材"按钮添加您的第一个素材</p>
              <button class="btn btn-primary" @click="switchView('upload')">上传素材</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传视图 -->
      <div v-if="activeView === 'upload'" class="file-uploader">
        <div class="upload-header">
          <h2>素材上传</h2>
          <p>支持图片、文档和视频文件，最大100MB</p>
          <button class="back-btn" @click="switchView('management')">
            &larr; 返回管理
          </button>
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
            <select id="category" v-model="currentCategoryId" class="category-select">
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
                >
              </div>
              
              <div class="input-group">
                <label :for="`desc-${index}`">描述：</label>
                <textarea 
                  :id="`desc-${index}`" 
                  v-model="file.metadata.description"
                  placeholder="请输入文件描述"
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
                <div class="file-status" v-if="uploadStatuses[index]">
                  {{ uploadStatuses[index] }}
                </div>
              </div>
            </div>
            
            <div class="file-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
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
    </main>
  </div>
</template>

<script>
export default {
  name: 'MaterialSystem',
  data() {
    return {
      // 视图控制
      activeView: 'management', // 'management' 或 'upload'
      
      // 素材管理相关数据
      searchKeyword: '',
      activeCategory: 'all',
      activeTag: '',
      sortBy: 'date',
      hoverIndex: -1,
      showFilterPanel: true,
      materials: [
        {
          id: 1,
          title: '2023年春季课程封面设计',
          type: 'image',
          size: 1200000,
          date: '2023-02-15',
          tags: ['course', 'common']
        },
        {
          id: 2,
          title: 'JavaScript高级编程讲义',
          type: 'document',
          size: 3400000,
          date: '2023-03-10',
          tags: ['course']
        },
        {
          id: 3,
          title: '618促销活动营销海报',
          type: 'image',
          size: 2100000,
          date: '2023-05-20',
          tags: ['marketing']
        },
        {
          id: 4,
          title: 'Vue3.0实战教学视频',
          type: 'video',
          size: 124000000,
          date: '2023-04-05',
          tags: ['course', 'common']
        },
        {
          id: 5,
          title: '产品功能介绍语音解说',
          type: 'audio',
          size: 8700000,
          date: '2023-03-22',
          tags: ['case']
        },
        {
          id: 6,
          title: '用户案例收集模板',
          type: 'document',
          size: 800000,
          date: '2023-01-18',
          tags: ['case']
        }
      ],
      
      // 上传相关数据
      files: [],
      progress: [],
      uploadStatuses: [],
      isUploading: false,
      globalUploadStatus: '',
      isDragActive: false,
      nextFileId: 1,
      currentCategoryId: '',
      categories: [
        { id: 1, name: '产品图片' },
        { id: 2, name: '宣传视频' },
        { id: 3, name: '用户文档' },
        { id: 4, name: '其他素材' }
      ]
    };
  },
  computed: {
    // 素材管理计算属性
    filteredMaterials() {
      let result = [...this.materials];
      
      // 搜索过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(m => 
          m.title.toLowerCase().includes(keyword) || 
          (m.tags && m.tags.some(tag => tag.includes(keyword)))
        );
      }
      
      // 分类过滤
      if (this.activeCategory !== 'all') {
        result = result.filter(m => m.type === this.activeCategory);
      }
      
      // 标签过滤
      if (this.activeTag) {
        result = result.filter(m => m.tags && m.tags.includes(this.activeTag));
      }
      
      // 排序
      if (this.sortBy === 'date') {
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (this.sortBy === 'name') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'size') {
        result.sort((a, b) => b.size - a.size);
      }
      
      return result;
    },
    
    // 上传计算属性
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
    // 视图切换方法
    switchView(view) {
      this.activeView = view;
      // 切换到管理视图时重置上传状态
      if (view === 'management') {
        this.resetUpload();
      }
    },
    
    // 素材管理方法
    setActiveCategory(category) {
      this.activeCategory = category;
    },
    setActiveTag(tag) {
      this.activeTag = this.activeTag === tag ? '' : tag;
    },
    setSortBy(by) {
      this.sortBy = by;
    },
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    getFileIcon(type) {
      const icons = {
        image: '🖼️',
        document: '📝',
        video: '🎬',
        audio: '🔊',
        archive: '📦'
      };
      return icons[type] || '📁';
    },
    getTypeName(type) {
      const names = {
        image: '图片',
        document: '文档',
        video: '视频',
        audio: '音频',
        archive: '压缩包'
      };
      return names[type] || '文件';
    },
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
      else return (bytes / 1073741824).toFixed(1) + ' GB';
    },
    downloadMaterial(material) {
      alert(`开始下载: ${material.title}`);
    },
    copyLink(material) {
      const link = `https://example.com/materials/${material.id}`;
      navigator.clipboard.writeText(link).then(() => {
        alert('链接已复制到剪贴板');
      });
    },
    showMoreOptions(material) {
      alert(`打开 ${material.title} 的更多选项`);
    },
    
    // 上传方法
    handleFileSelect(e) {
      const input = e.target;
      if (input.files && input.files.length > 0) {
        this.addFiles(Array.from(input.files));
      }
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
        if (!['image', 'video', 'application'].includes(fileType)) {
          this.globalUploadStatus = `不支持的文件类型: ${file.name}`;
          continue;
        }

        // 添加到文件列表
        this.files.push({
          id: this.nextFileId++,
          file,
          name: file.name,
          size: file.size,
          type: fileType === 'application' ? 'document' : fileType,
          metadata: {
            title: '',
            description: '',
            categoryId: this.currentCategoryId
          }
        });
        
        // 初始化进度和状态
        this.progress.push(0);
        this.uploadStatuses.push('');
      }
    },
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
    formatSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    async startUpload() {
      if (this.files.length === 0 || this.isUploading) return;
      
      this.isUploading = true;
      this.globalUploadStatus = '开始上传文件...';
      
      // 重置所有上传状态
      this.uploadStatuses = this.files.map(() => '等待上传');
      this.progress = this.files.map(() => 0);

      try {
        // 模拟上传过程
        const uploadPromises = this.files.map((file, index) => {
          return this.simulateUpload(file, index);
        });

        // 等待所有文件上传完成
        const results = await Promise.all(uploadPromises);
        
        // 统计上传结果
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;
        
        this.globalUploadStatus = `上传完成: ${successCount} 个成功, ${errorCount} 个失败`;
        
        // 成功上传后添加到素材列表
        results.filter(r => r.success).forEach(result => {
          this.addToMaterialList(result.fileInfo);
        });
        
      } catch (error) {
        this.globalUploadStatus = `上传失败: ${error.message}`;
      } finally {
        this.isUploading = false;
      }
    },
    async simulateUpload(fileInfo, index) {
      try {
        this.uploadStatuses[index] = '准备上传';
        
        // 模拟上传进度
        const interval = setInterval(() => {
          if (this.progress[index] < 95) {
            this.progress[index] += 5;
            this.uploadStatuses[index] = `上传中 (${this.progress[index]}%)`;
          } else {
            clearInterval(interval);
          }
        }, 300);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearInterval(interval);
        
        // 模拟上传成功
        this.progress[index] = 100;
        this.uploadStatuses[index] = '上传成功';
        
        return {
          success: true,
          fileInfo
        };
        
      } catch (error) {
        this.progress[index] = 0;
        this.uploadStatuses[index] = '上传失败';
        return {
          success: false,
          fileInfo,
          error: error.message || '上传失败'
        };
      }
    },
    addToMaterialList(fileInfo) {
      const newMaterial = {
        id: Date.now(),
        title: fileInfo.metadata.title || fileInfo.name,
        type: fileInfo.type,
        size: fileInfo.size,
        date: new Date().toISOString().split('T')[0],
        tags: fileInfo.metadata.categoryId ? [this.categories.find(c => c.id == fileInfo.metadata.categoryId)?.name] : []
      };
      
      this.materials.unshift(newMaterial);
    }
  }
};
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部样式 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e6ed;
}

.app-header h1 {
  font-size: 24px;
  color: #2c3e50;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 8px 16px;
  background: #f0f4f8;
  border: 1px solid #d1d8e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: #e3eaf3;
}

.nav-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* 内容区域样式 */
.app-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
  padding: 25px;
}

/* 上传视图样式 */
.file-uploader {
  max-width: 800px;
  margin: 0 auto;
}

.upload-header {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
}

.upload-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.upload-header p {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: transparent;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
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
  background-color: #fff;
}

/* 增加下拉框选项的样式 */
.category-select option {
  padding: 8px;
  background: #fff;
}

.input-group textarea {
  min-height: 80px;
  resize: vertical;
}

.file-list {
  margin-top: 20px;
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
  color: #e74c3c;
  margin-top: 3px;
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
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  color: #e74c3c;
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

/* 素材管理视图样式 */
.material-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e6ed;
}

.page-title h1 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.page-title p {
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.btn-outline {
  background: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-outline:hover {
  background-color: #f5f7fa;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.filter-panel {
  width: 220px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.filter-group {
  margin-bottom: 18px;
}

.filter-group h3 {
  font-size: 15px;
  margin-bottom: 10px;
  color: #606266;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.filter-options {
  list-style: none;
  padding: 0;
}

.filter-options li {
  margin-bottom: 8px;
}

.filter-options a {
  display: block;
  padding: 6px 10px;
  border-radius: 4px;
  color: #606266;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-options a:hover {
  background-color: #f0f7ff;
  color: #409eff;
}

.filter-options a.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.material-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.material-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #ebeef5;
}

.card-thumb {
  height: 140px;
  background-color: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.file-icon {
  font-size: 36px;
  color: #409eff;
  font-weight: bold;
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.95);
  padding: 3px 8px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #ebeef5;
}

.card-body {
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 42px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.action-btn {
  color: #606266;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px 30px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
  max-width: 400px;
}

.category-select:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .filter-panel {
    width: 100%;
  }
  
  .upload-area {
    flex-direction: column;
  }
  
  .file-select-btn, .drop-zone {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .material-header, .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .actions {
    width: 100%;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .material-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .filter-panel.mobile-hidden {
    display: none;
  }
  
  .app-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .nav-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>

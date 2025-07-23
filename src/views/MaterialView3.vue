<template>
  <div class="material-system">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-tabs">
        <button 
          :class="['tab-btn', activeView === 'management' ? 'active' : '']"
          @click="switchView('management')"
        >
          素材管理
        </button>
        <button 
          :class="['tab-btn', activeView === 'upload' ? 'active' : '']"
          @click="switchView('upload')"
        >
          上传素材
        </button>
        <button 
          :class="['tab-btn', activeView === 'category' ? 'active' : '']"
          @click="switchView('category')"
        >
          分类管理
        </button>
      </div>
      
    </div>
    <!-- 在MaterialSystem组件中添加预览模态框 -->
  <div class="preview-modal" v-if="showPreview && previewMaterial">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ previewMaterial.title }}</h3>
        <button class="close-btn" @click="closePreview">×</button>
      </div>
      
      <div class="preview-container">
        <!-- 图片预览 -->
        <div v-if="previewMaterial.fileType === 'image'" class="image-preview">
          <img :src="previewMaterial.fileUrl2" 
               :alt="previewMaterial.title" 
               ref="previewImage"
               @load="imageLoaded = true">
          <div v-if="!imageLoaded" class="loading-placeholder">
            <div class="loader"></div>
            <p>加载图片中...</p>
          </div>
          <div class="image-controls">
            <button @click="zoomIn">放大</button>
            <button @click="zoomOut">缩小</button>
            <button @click="resetZoom">重置</button>
          </div>
        </div>
        
        <!-- 视频预览 -->
        <div v-else-if="previewMaterial.fileType === 'video'" class="video-preview">
          <video controls ref="videoPlayer">
            <source :src="previewMaterial.fileUrl2" :type="getVideoType(previewMaterial.fileFormat)">
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <!-- PDF预览 -->
        <div v-else-if="previewMaterial.fileFormat === 'pdf'" class="pdf-preview">
          <iframe :src="`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(previewMaterial.fileUrl2)}`" 
                  frameborder="0"
                  class="pdf-viewer"></iframe>
        </div>
        
        <!-- 其他文件预览 -->
        <div v-else class="generic-preview">
          <div class="file-icon-large">{{ getFileIcon(previewMaterial.fileType) }}</div>
          <p>此文件类型不支持预览</p>
          <button class="download-btn" @click="downloadMaterial(previewMaterial)">下载文件</button>
        </div>
      </div>
      
      <div class="file-info">
        <p><strong>文件类型：</strong> {{ getTypeName(previewMaterial.fileType) }} ({{ previewMaterial.fileFormat }})</p>
        <p><strong>文件大小：</strong> {{ formatFileSize(previewMaterial.fileSize) }}</p>
        <p><strong>上传时间：</strong> {{ formatDate(previewMaterial.createdAt) }}</p>
        <p><strong>描述：</strong> {{ previewMaterial.description || '无描述' }}</p>
      </div>
      
      <div class="modal-footer">
        <button @click="downloadMaterial(previewMaterial)">下载</button>
        <button @click="copyLink(previewMaterial)">复制链接</button>
        <button class="close" @click="closePreview">关闭</button>
      </div>
    </div>
  </div>

    <!-- 素材管理视图 -->
    <div v-if="activeView === 'management'" class="material-management">
      <!-- 筛选面板 -->
      <div class="filter-panel">
        <div class="filter-group">
          <label>分类：</label>
          <select v-model="selectedCategory">
            <option value="">全部</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>类型：</label>
          <select v-model="selectedType">
            <option value="">全部</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="document">文档</option>
            <option value="audio">音频</option>
            <option value="archive">压缩包</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>排序：</label>
          <select v-model="sortBy">
            <option value="created_at">上传时间</option>
            <option value="title">名称</option>
            <option value="file_size">文件大小</option>
          </select>
          <select v-model="sortOrder">
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
        
        <div class="filter-group search-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索素材名称或描述"
          >
          <button @click="loadMaterials">搜索</button>
        </div>
      </div>

      <!-- 素材展示区域 -->
      <div class="material-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>正在加载素材数据...</p>
        </div>
        
        <div v-else>
          <div class="stats-bar">
            共找到 {{ filteredMaterials.length }} 个素材
            <span v-if="filteredMaterials.length > 0" class="clear-filter" @click="resetFilters">
              清除筛选条件
            </span>
          </div>
          
          <div class="material-grid">
            <!-- 素材卡片 -->
            <div 
              v-for="(material, index) in filteredMaterials" 
              :key="material.id"
              class="material-card"
              :style="{ 
                transform: hoverIndex === index ? 'translateY(-3px)' : 'none',
                boxShadow: hoverIndex === index ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)'
              }"
              @mouseenter="hoverIndex = index"
              @mouseleave="hoverIndex = -1"
              @click="viewMaterial(material)"
            >
              <div class="card-thumb">
                <div class="file-icon-wrapper">
                  <span class="file-icon">{{ getFileIcon(material.fileType) }}</span>
                </div>
                <span class="card-tag">{{ getTypeName(material.fileType) }}</span>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ material.title }}</h3>
                <div class="card-meta">
                  <span>{{ formatFileSize(material.fileSize) }}</span>
                  <span>{{ formatDate(material.createdAt) }}</span>
                </div>
                <div class="card-meta">
                  <span>下载: {{ material.downloadCount }}</span>
                  <span>浏览: {{ material.viewCount }}</span>
                </div>
                <div class="card-actions">
                  <button class="action-btn" @click.stop="downloadMaterial(material)">下载</button>
                  <button class="action-btn" @click.stop="copyLink(material)">复制链接</button>
                  <button class="action-btn danger" @click.stop="deleteMaterial(material)">删除</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态提示 -->
          <div v-if="filteredMaterials.length === 0" class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>暂无素材</h3>
            <p>点击"上传素材"按钮添加您的第一个素材</p>
            <button class="btn btn-primary" @click="switchView('upload')">上传素材</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传视图 -->
    <div v-else-if="activeView === 'upload'" class="upload-view">
      <!-- 这里可以放置上传组件 -->
      <file-uploader @upload-success="handleUploadSuccess" @cancel="switchView('management')" />
    </div>

    <!-- 状态通知 -->
    <div v-if="globalStatus" :class="['global-status', globalStatus.type]">
      {{ globalStatus.message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import FileUploader from './FileUploader.vue';

export default {
  name: 'MaterialSystem',
  components: {
    FileUploader
  },
  data() {
    return {
      showPreview: false,
      previewMaterial: null,
      imageLoaded: false,
      zoomLevel: 1,
      activeView: 'management',
      loading: true,
      materials: [],
      categories: [],
      searchQuery: '',
      selectedCategory: '',
      selectedType: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      hoverIndex: -1,
      globalStatus: null,
      userName: '管理员',
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
    };
  },
  computed: {
    filteredMaterials() {
      let result = [...this.materials];
      
      // 应用搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(m => 
          m.title.toLowerCase().includes(query) || 
          (m.description && m.description.toLowerCase().includes(query))
        );
      }
      
      // 应用分类过滤
      if (this.selectedCategory) {
        result = result.filter(m => m.categoryId == this.selectedCategory);
      }
      
      // 应用类型过滤
      if (this.selectedType) {
        result = result.filter(m => m.fileType === this.selectedType);
      }
      
      // 应用排序
      return result.sort((a, b) => {
        let valA, valB;
        
        switch (this.sortBy) {
          case 'title':
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
            break;
          case 'file_size':
            valA = a.fileSize;
            valB = b.fileSize;
            break;
          default: // created_at
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
        }
        
        return this.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }
  },
  mounted() {
    this.loadCategories();
    this.loadMaterials();
  },
  methods: {
    // 查看素材详情（预览）
    viewMaterial(material) {
      // 增加浏览量
      this.incrementViewCount(material.id);
      
      // 打开预览
      this.previewMaterial = material;
      this.showPreview = true;
      this.imageLoaded = false;
      this.zoomLevel = 1;
      
      // 添加到预览历史
      this.addToPreviewHistory(material);
    },
    
    // 关闭预览
    closePreview() {
      this.showPreview = false;
      this.previewMaterial = null;
      
      // 暂停视频播放
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause();
      }
    },
    
    // 图片放大
    zoomIn() {
      this.zoomLevel += 0.1;
      this.$refs.previewImage.style.transform = `scale(${this.zoomLevel})`;
    },
    
    // 图片缩小
    zoomOut() {
      if (this.zoomLevel > 0.2) {
        this.zoomLevel -= 0.1;
        this.$refs.previewImage.style.transform = `scale(${this.zoomLevel})`;
      }
    },
    
    // 重置缩放
    resetZoom() {
      this.zoomLevel = 1;
      this.$refs.previewImage.style.transform = 'scale(1)';
    },
    
    // 获取视频MIME类型
    getVideoType(format) {
      const types = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime'
      };
      return types[format.toLowerCase()] || 'video/mp4';
    },
    
    // 添加到预览历史
    addToPreviewHistory(material) {
      const history = JSON.parse(localStorage.getItem('previewHistory') || '[]');
      
      // 避免重复添加
      if (!history.some(item => item.id === material.id)) {
        history.unshift({
          id: material.id,
          title: material.title,
          fileType: material.fileType,
          previewTime: new Date().toISOString()
        });
        
        // 只保留最近的10条记录
        if (history.length > 10) history.pop();
        
        localStorage.setItem('previewHistory', JSON.stringify(history));
      }
    },
    // 切换视图
    switchView(view) {
      this.activeView = view;
      if (view === 'management') {
        this.loadMaterials();
      }
    },
    
    // 加载素材数据
    async loadMaterials() {
      try {
        this.loading = true;
        this.globalStatus = null;
        
        const response = await axios.get(`${this.apiBaseUrl}/api/materials`, {
          params: {
            search: this.searchQuery,
            fileType: this.selectedType,
            categoryId: this.selectedCategory,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
          }
        });
        
        this.materials = response.data.map(material => ({
          ...material,
          // 添加前端需要的额外字段
          tags: material.categoryId ? [this.getCategoryName(material.categoryId)] : []
        }));
        
      } catch (error) {
        console.error('加载素材失败:', error);
        this.globalStatus = { 
          type: 'error', 
          message: '加载素材失败，请刷新重试' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    // 加载分类数据
    async loadCategories() {
  try {
    const response = await axios.get(`${this.apiBaseUrl}/api/categories`);
    console.error(response.data)
    // 确保响应是数组
    this.categories = Array.isArray(response.data.data) 
      ? response.data.data 
      : [];
      
  } catch (error) {
    console.error('获取分类失败:', error);
    this.categories = []; // 确保始终是数组
    this.globalStatus = { 
      type: 'warning', 
      message: '获取分类失败，使用默认分类' 
    };
  }
},
    
    // 处理上传成功
    handleUploadSuccess(newMaterials) {
      // 切换到管理视图
      this.activeView = 'management';
      
      // 添加新素材到列表
      newMaterials.forEach(material => {
        this.materials.unshift({
          ...material,
          tags: material.categoryId ? [this.getCategoryName(material.categoryId)] : []
        });
      });
      
      // 显示成功消息
      this.globalStatus = {
        type: 'success',
        message: `成功上传 ${newMaterials.length} 个素材`
      };
      
      // 3秒后自动关闭消息
      setTimeout(() => {
        this.globalStatus = null;
      }, 3000);
    },
    
    // 查看素材详情
    /*viewMaterial(material) {
      // 增加浏览量
      this.incrementViewCount(material.id);
      
      // 这里可以打开详情弹窗
      this.$emit('view-material', material);
    },*/
    
    // 增加浏览量
    async incrementViewCount(id) {
      try {
        await axios.post(`${this.apiBaseUrl}/api/materials/${id}/view`);
        const material = this.materials.find(m => m.id === id);
        if (material) {
          material.viewCount += 1;
        }
      } catch (error) {
        console.error('记录浏览量失败:', error);
      }
    },
    
    // 下载素材
    async downloadMaterial(material) {
      try {
        // 增加下载计数
        await axios.post(`${this.apiBaseUrl}/api/materials/${material.id}/download`);
        
        // 获取下载URL
        const downloadUrl = material.fileUrl2;
        
        // 创建临时链接下载
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = material.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 更新本地计数
        material.downloadCount += 1;
        
        // 显示成功消息
        this.globalStatus = {
          type: 'success',
          message: '文件下载已开始'
        };
        
      } catch (error) {
        console.error('下载失败:', error);
        this.globalStatus = {
          type: 'error',
          message: '下载失败，请重试'
        };
      }
    },
    
    // 复制链接
    copyLink(material) {
      navigator.clipboard.writeText(material.fileUrl2)
        .then(() => {
          this.globalStatus = {
            type: 'success',
            message: '文件链接已复制到剪贴板'
          };
        })
        .catch(err => {
          console.error('复制失败:', err);
          this.globalStatus = {
            type: 'error',
            message: '复制失败，请手动复制'
          };
        });
    },
    
    // 删除素材
    async deleteMaterial(material) {
      if (!confirm(`确定要删除素材 "${material.title}" 吗？此操作不可撤销。`)) {
        return;
      }
      
      try {
        await axios.delete(`${this.apiBaseUrl}/api/materials/${material.id}`);
        
        // 从列表中移除
        this.materials = this.materials.filter(m => m.id !== material.id);
        
        this.globalStatus = {
          type: 'success',
          message: '素材已删除'
        };
        
      } catch (error) {
        console.error('删除失败:', error);
        this.globalStatus = {
          type: 'error',
          message: '删除失败，请重试'
        };
      }
    },
    
    // 根据分类ID获取分类名称
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    },
    
    // 获取文件图标
    getFileIcon(fileType) {
      switch (fileType) {
        case 'image': return '🖼️';
        case 'video': return '🎬';
        case 'audio': return '🔊';
        case 'document': return '📄';
        case 'archive': return '📦';
        default: return '📁';
      }
    },
    
    // 获取类型名称
    getTypeName(fileType) {
      switch (fileType) {
        case 'image': return '图片';
        case 'video': return '视频';
        case 'audio': return '音频';
        case 'document': return '文档';
        case 'archive': return '压缩包';
        default: return '文件';
      }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    
    // 格式化日期显示
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    
    // 重置筛选条件
    resetFilters() {
      this.searchQuery = '';
      this.selectedCategory = '';
      this.selectedType = '';
      this.sortBy = 'created_at';
      this.sortOrder = 'desc';
      this.loadMaterials();
    },
    
    // 退出登录
    logout() {
      // 这里实现退出逻辑
      this.$emit('logout');
    }
  }
};
</script>

<style scoped>
.material-system {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.nav-tabs {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 16px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tab-btn:hover {
  background: #ecf5ff;
  border-color: #c6e2ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info button {
  padding: 5px 10px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background: #f9fafc;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #606266;
}

.filter-group select, .filter-group input {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-group input {
  width: 250px;
}

.filter-group button {
  padding: 8px 15px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.material-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-bar {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.clear-filter {
  margin-left: 15px;
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.material-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #ebeef5;
}

.material-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-3px);
}

.card-thumb {
  position: relative;
  height: 160px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon-wrapper {
  font-size: 60px;
  opacity: 0.7;
}

.card-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.card-body {
  padding: 15px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
  margin-bottom: 5px;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  padding: 6px 0;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.action-btn.danger:hover {
  background: #fef0f0;
  border-color: #fbc4c4;
  color: #f56c6c;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 60px;
  opacity: 0.3;
  margin-bottom: 15px;
}

.empty-state h3 {
  color: #303133;
  margin-bottom: 10px;
}

.empty-state p {
  color: #909399;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #66b1ff;
}

.global-status {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  opacity: 0.95;
}

.global-status.success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.global-status.error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.global-status.warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}
/* 预览模态框样式 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.preview-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  width: 100%;
  text-align: center;
  overflow: auto;
}

.image-preview img {
  max-width: 100%;
  max-height: 60vh;
  transition: transform 0.3s ease;
}

.image-controls {
  margin-top: 15px;
}

.image-controls button {
  margin: 0 5px;
  padding: 5px 10px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.video-preview {
  width: 100%;
}

.video-preview video {
  width: 100%;
  max-height: 60vh;
}

.pdf-preview {
  width: 100%;
  height: 60vh;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
}

.generic-preview {
  text-align: center;
  padding: 40px 0;
}

.file-icon-large {
  font-size: 80px;
  opacity: 0.7;
  margin-bottom: 20px;
}

.download-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
}

.file-info {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  font-size: 14px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.modal-footer button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-footer .close {
  background: #f56c6c;
  color: white;
}

.loading-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

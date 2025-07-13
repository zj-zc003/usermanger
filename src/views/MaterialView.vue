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
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loader"></div>
              <p>正在加载素材数据...</p>
            </div>
            
            <div v-else>
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
                >
                  <div class="card-thumb">
                    <span class="file-icon">{{ getFileIcon(material.file_type) }}</span>
                    <span class="card-tag">{{ getTypeName(material.file_type) }}</span>
                  </div>
                  <div class="card-body">
                    <h3 class="card-title">{{ material.title }}</h3>
                    <div class="card-meta">
                      <span>{{ formatFileSize(material.file_size) }}</span>
                      <span>{{ formatDate(material.created_at) }}</span>
                    </div>
                    <div class="card-meta">
                      <span>下载: {{ material.download_count }}</span>
                      <span>浏览: {{ material.view_count }}</span>
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
      </div>

      <!-- 上传视图 -->
      <div v-else-if="activeView === 'upload'" class="upload-view">
        <div class="view-header">
          <button class="back-btn" @click="switchView('management')">
            &larr; 返回管理
          </button>
          <h2>素材上传</h2>
        </div>
        
        <!-- 使用新的上传组件 -->
        <file-uploader 
          @upload-success="handleUploadSuccess"
          @cancel="switchView('management')"
          :categories="categories"
        />
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import FileUploader from './FileUploader.vue'; // 导入新的上传组件

export default {
  name: 'MaterialSystem',
  components: {
    FileUploader
  },
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
      loading: true,
      materials: [],
      
      // 筛选和分类数据
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
        result = result.filter(m => m.file_type === this.activeCategory);
      }
      
      // 标签过滤
      if (this.activeTag) {
        result = result.filter(m => m.tags && m.tags.includes(this.activeTag));
      }
      
      // 排序
      if (this.sortBy === 'date') {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (this.sortBy === 'name') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (this.sortBy === 'size') {
        result.sort((a, b) => b.file_size - a.file_size);
      }
      
      return result;
    }
  },
  mounted() {
    this.loadMaterials();
  },
  methods: {
    // 视图切换方法
    switchView(view) {
      this.activeView = view;
    },
    
    // 素材加载方法
    async loadMaterials() {
      try {
        this.loading = true;
        const response = await axios.get('/api/materials', {
          params: {
            sortBy: this.sortBy,
            sortOrder: 'desc'
          }
        });
        
        this.materials = response.data.map(material => ({
          ...material,
          // 添加前端需要的额外字段
          tags: material.category_id ? [this.getCategoryName(material.category_id)] : []
        }));
      } catch (error) {
        console.error('加载素材失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 处理上传成功事件
    handleUploadSuccess(successResults) {
      // 刷新素材列表
      this.loadMaterials();
      
      // 切换回管理视图
      this.switchView('management');
      
      // 显示成功消息
      if (successResults.length > 0) {
        this.$message.success(`成功上传 ${successResults.length} 个素材`);
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
      this.loadMaterials(); // 重新加载数据
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
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    downloadMaterial(material) {
      // 调用后端下载接口
      axios.post(`/api/materials/${material.id}/download`)
        .then(() => {
          // 本地更新下载计数
          material.download_count += 1;
          
          // 实际下载文件
          const link = document.createElement('a');
          link.href = material.file_url;
          link.download = material.file_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(error => {
          console.error('下载失败:', error);
          this.$message.error('下载失败');
        });
    },
    copyLink(material) {
      const link = material.file_url;
      navigator.clipboard.writeText(link).then(() => {
        this.$message.success('链接已复制到剪贴板');
      });
    },
    showMoreOptions(material) {
      this.$message.info(`打开 ${material.title} 的更多选项`);
    },
    
    // 辅助方法
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    }
  }
};
</script>

<style scoped>
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
.upload-view {
  max-width: 800px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.view-header h2 {
  flex-grow: 1;
  text-align: center;
  color: #2c3e50;
}

.back-btn {
  background: transparent;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  position: absolute;
  left: 0;
}

.back-btn:hover {
  background: #f0f7ff;
  border-radius: 4px;
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
  margin-bottom: 5px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
  margin-top: 10px;
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

/* 新增加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

/* 响应式设计 */
@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .filter-panel {
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
    text-align: center;
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

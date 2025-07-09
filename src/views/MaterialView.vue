<template>
  <div class="material-management">
    <!-- 素材管理头部 -->
    <div class="material-header">
      <div class="page-title">
        <h1>素材管理</h1>
        <p>管理您的所有教学素材，包括图片、文档、视频等</p>
      </div>
      <div class="actions">
        <button class="btn btn-outline" @click="toggleFilterPanel">筛选</button>
        <button class="btn btn-primary" @click="handleUpload">上传素材</button>
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
          <button class="btn btn-primary" @click="handleUpload">上传素材</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialView',
  data() {
    return {
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
      ]
    };
  },
  computed: {
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
    }
  },
  methods: {
    setActiveCategory(category) {
      this.activeCategory = category;
    },
    setActiveTag(tag) {
      this.activeTag = this.activeTag === tag ? '' : tag;
    },
    setSortBy(by) {
      this.sortBy = by;
    },
    getFileIcon(type) {
      const icons = {
        image: 'IMG',
        document: 'DOC',
        video: 'VID',
        audio: 'AUD',
        archive: 'ZIP'
      };
      return icons[type] || 'FILE';
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
    handleUpload() {
      alert('上传功能将在后续版本中开放');
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
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    }
  }
};
</script>

<style scoped>
/* 样式部分保持完整 */
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
  .material-header {
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
}
</style>

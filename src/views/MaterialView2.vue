<template>
  <div class="category-management">
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
      <div class="user-info">
        <span>管理员</span>
        <button @click="logout">退出</button>
      </div>
    </div>

    <!-- 分类管理视图 -->
    <div class="category-container">
      <div class="category-header">
        <h2><i class="fas fa-folder-open"></i> 素材分类管理</h2>
        <div class="category-actions">
          <button class="btn btn-primary" @click="showCreateDialog = true">
            <i class="fas fa-plus"></i> 新建分类
          </button>
        </div>
      </div>
      
      <div class="category-content">
        <!-- 统计信息 -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e1f0ff;">
              <i class="fas fa-folder" style="color: #3a8bff;"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ categories.length }}</div>
              <div class="stat-label">总分类数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #e6f7e9;">
              <i class="fas fa-file" style="color: #4caf50;"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalMaterials }}</div>
              <div class="stat-label">总素材数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #fff2e6;">
              <i class="fas fa-star" style="color: #ff9800;"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ mostUsedCategory.name || '-' }}</div>
              <div class="stat-label">最常用分类</div>
            </div>
          </div>
        </div>
        
        <!-- 分类列表 -->
        <div class="category-list-container">
          <div class="list-header">
            <h3>所有分类</h3>
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索分类名称..."
              >
              <i class="fas fa-search"></i>
            </div>
          </div>
          
          <div class="category-list">
            <div 
              v-for="(category, index) in filteredCategories" 
              :key="category.id"
              class="category-card"
              :class="{ 'active': hoverCategoryIndex === index }"
              @mouseenter="hoverCategoryIndex = index"
              @mouseleave="hoverCategoryIndex = -1"
            >
              <div class="category-icon">
                <i class="fas fa-folder"></i>
              </div>
              <div class="category-details">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-meta">
                  <span class="category-id">ID: {{ category.id }}</span>
                  <span>创建时间: {{ formatDate(category.createdAt) }}</span>
                </div>
                <div class="category-meta">
                  <span>素材数量: {{ getMaterialCount(category.id) }}</span>
                  <span>最后更新: {{ category.updatedAt ? formatDate(category.updatedAt) : '无' }}</span>
                </div>
              </div>
              <div class="category-actions">
                <button class="action-btn edit" @click="editCategory(category)">
                  <i class="fas fa-edit"></i> 编辑
                </button>
                <button 
                  class="action-btn delete" 
                  @click="deleteCategory(category)"
                  :disabled="getMaterialCount(category.id) > 0"
                >
                  <i class="fas fa-trash-alt"></i> 删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="filteredCategories.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-folder-open"></i>
            </div>
            <h3>暂无分类</h3>
            <p>点击"新建分类"按钮添加您的第一个分类</p>
            <button class="btn btn-primary" @click="showCreateDialog = true">
              <i class="fas fa-plus"></i> 新建分类
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑分类对话框 -->
    <div v-if="showCreateDialog" class="category-dialog">
      <div class="dialog-backdrop" @click="closeDialog"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>{{ editingCategory ? '编辑分类' : '新建分类' }}</h3>
          <button class="close-btn" @click="closeDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>分类名称 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="newCategoryName" 
              placeholder="输入分类名称"
              :class="{ 'input-error': nameError }"
            >
            <div v-if="nameError" class="error-message">{{ nameError }}</div>
          </div>
          <div class="form-group">
            <label>分类描述</label>
            <textarea 
              v-model="newCategoryDesc" 
              placeholder="输入分类描述（可选）"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-confirm" @click="saveCategory">
            {{ editingCategory ? '保存更改' : '创建分类' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 状态通知 -->
    <div v-if="globalStatus" :class="['global-status', globalStatus.type]">
      <i :class="statusIcon"></i>
      {{ globalStatus.message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryManagement',
  data() {
    return {
      activeView: 'category',
      categories: [],
      materials: [],
      searchQuery: '',
      showCreateDialog: false,
      editingCategory: null,
      newCategoryName: '',
      newCategoryDesc: '',
      nameError: '',
      hoverCategoryIndex: -1,
      globalStatus: null
    };
  },
  computed: {
    filteredCategories() {
      if (!this.searchQuery) return this.categories;
      const query = this.searchQuery.toLowerCase();
      return this.categories.filter(category => 
        category.name.toLowerCase().includes(query)
      );
    },
    totalMaterials() {
      return this.materials.length;
    },
    mostUsedCategory() {
      if (this.categories.length === 0) return {};
      
      let maxCount = 0;
      let mostUsed = this.categories[0];
      
      this.categories.forEach(category => {
        const count = this.getMaterialCount(category.id);
        if (count > maxCount) {
          maxCount = count;
          mostUsed = category;
        }
      });
      
      return mostUsed;
    },
    statusIcon() {
      if (!this.globalStatus) return '';
      return {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
      }[this.globalStatus.type];
    }
  },
  mounted() {
    this.loadCategories();
    this.loadMaterials();
  },
  methods: {
    loadCategories() {
      // 模拟API请求
      setTimeout(() => {
        this.categories = [
          { id: 1, name: '产品图片', createdAt: '2023-01-15T08:30:00Z', updatedAt: '2023-06-10T14:20:00Z' },
          { id: 2, name: '宣传视频', createdAt: '2023-02-20T10:15:00Z', updatedAt: '2023-05-15T09:45:00Z' },
          { id: 3, name: '用户文档', createdAt: '2023-03-05T14:45:00Z', updatedAt: '2023-04-22T11:30:00Z' },
          { id: 4, name: '品牌素材', createdAt: '2023-04-10T09:20:00Z', updatedAt: '2023-07-01T16:10:00Z' },
          { id: 5, name: '营销资料', createdAt: '2023-05-18T11:30:00Z' },
          { id: 6, name: '教程资源', createdAt: '2023-06-22T13:40:00Z' },
          { id: 7, name: '社交媒体', createdAt: '2023-07-05T15:55:00Z' }
        ];
      }, 500);
    },
    loadMaterials() {
      // 模拟API请求
      setTimeout(() => {
        this.materials = [
          { id: 101, title: '产品主图', categoryId: 1, fileType: 'image', fileSize: 2456789 },
          { id: 102, title: '宣传视频', categoryId: 2, fileType: 'video', fileSize: 124567890 },
          { id: 103, title: '用户手册', categoryId: 3, fileType: 'document', fileSize: 3456789 },
          { id: 104, title: '品牌Logo', categoryId: 4, fileType: 'image', fileSize: 156789 },
          { id: 105, title: '营销PPT', categoryId: 5, fileType: 'document', fileSize: 5678901 },
          { id: 106, title: '使用教程', categoryId: 6, fileType: 'video', fileSize: 98765432 },
          { id: 107, title: '社交媒体封面', categoryId: 7, fileType: 'image', fileSize: 789012 },
          { id: 108, title: '产品展示视频', categoryId: 2, fileType: 'video', fileSize: 234567890 }
        ];
      }, 500);
    },
    getMaterialCount(categoryId) {
      return this.materials.filter(m => m.categoryId === categoryId).length;
    },
    switchView(view) {
      this.activeView = view;
    },
    logout() {
      console.log('用户退出');
      this.globalStatus = {
        type: 'success',
        message: '您已成功退出系统'
      };
      setTimeout(() => {
        this.globalStatus = null;
      }, 3000);
    },
    formatDate(dateString) {
      if (!dateString) return '无';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    editCategory(category) {
      this.editingCategory = category;
      this.newCategoryName = category.name;
      this.newCategoryDesc = category.description || '';
      this.showCreateDialog = true;
      this.nameError = '';
    },
    closeDialog() {
      this.showCreateDialog = false;
      this.editingCategory = null;
      this.newCategoryName = '';
      this.newCategoryDesc = '';
      this.nameError = '';
    },
    validateCategoryName() {
      this.nameError = '';
      
      if (!this.newCategoryName.trim()) {
        this.nameError = '分类名称不能为空';
        return false;
      }
      
      if (this.newCategoryName.length > 20) {
        this.nameError = '分类名称不能超过20个字符';
        return false;
      }
      
      const exists = this.categories.some(category => 
        category.name.toLowerCase() === this.newCategoryName.toLowerCase() &&
        (!this.editingCategory || category.id !== this.editingCategory.id)
      );
      
      if (exists) {
        this.nameError = '分类名称已存在';
        return false;
      }
      
      return true;
    },
    saveCategory() {
      if (!this.validateCategoryName()) return;
      
      if (this.editingCategory) {
        // 更新分类
        const index = this.categories.findIndex(c => c.id === this.editingCategory.id);
        if (index !== -1) {
          this.categories[index] = {
            ...this.categories[index],
            name: this.newCategoryName,
            description: this.newCategoryDesc,
            updatedAt: new Date().toISOString()
          };
          this.globalStatus = {
            type: 'success',
            message: '分类更新成功'
          };
        }
      } else {
        // 创建新分类
        const newCategory = {
          id: Math.max(...this.categories.map(c => c.id), 0) + 1,
          name: this.newCategoryName,
          description: this.newCategoryDesc,
          createdAt: new Date().toISOString()
        };
        this.categories.push(newCategory);
        this.globalStatus = {
          type: 'success',
          message: '分类创建成功'
        };
      }
      
      this.closeDialog();
      
      setTimeout(() => {
        this.globalStatus = null;
      }, 3000);
    },
    deleteCategory(category) {
      if (!confirm(`确定要删除分类 "${category.name}" 吗？此操作不可撤销。`)) {
        return;
      }
      
      if (this.getMaterialCount(category.id) > 0) {
        this.globalStatus = {
          type: 'error',
          message: '分类下存在素材，无法删除'
        };
        return;
      }
      
      this.categories = this.categories.filter(c => c.id !== category.id);
      this.globalStatus = {
        type: 'success',
        message: '分类已删除'
      };
      
      setTimeout(() => {
        this.globalStatus = null;
      }, 3000);
    }
  }
};
</script>

<style scoped>
.category-management {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

.user-info span {
  font-weight: 500;
}

.user-info button {
  padding: 5px 10px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.category-header h2 {
  font-size: 22px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #66b1ff;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #777;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  font-size: 18px;
  color: #333;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.category-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  display: flex;
  gap: 15px;
}

.category-card.active {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: #c6e2ff;
}

.category-icon {
  font-size: 32px;
  color: #409eff;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #e1f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-details {
  flex: 1;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  color: #777;
  font-size: 13px;
  margin-bottom: 8px;
}

.category-id {
  font-family: monospace;
}

.category-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 100px;
  padding-left: 15px;
  border-left: 1px solid #eee;
}

.action-btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.edit {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #409eff;
}

.action-btn.edit:hover {
  background: #d9ecff;
}

.action-btn.delete {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  color: #f56c6c;
}

.action-btn.delete:hover:not([disabled]) {
  background: #fde2e2;
}

.action-btn.delete[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  border: 2px dashed #eee;
  border-radius: 10px;
  margin-top: 20px;
}

.empty-icon {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #777;
  margin-bottom: 25px;
}

.category-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 500px;
  z-index: 2001;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.dialog-header {
  padding: 20px;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f0f0f0;
}

.dialog-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #409eff;
  outline: none;
}

.form-group textarea {
  resize: vertical;
}

.error-message {
  color: #f56c6c;
  font-size: 13px;
  margin-top: 5px;
}

.required {
  color: #f56c6c;
}

.dialog-footer {
  padding: 15px 20px;
  background: #f5f7fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-cancel:hover {
  background: #ebeef5;
}

.btn-confirm {
  background: #409eff;
  border: 1px solid #409eff;
  color: white;
}

.btn-confirm:hover {
  background: #66b1ff;
}

.global-status {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 90%;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
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

@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .category-list {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .dialog-content {
    width: 90%;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .category-card {
    flex-direction: column;
  }
  
  .category-actions {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #eee;
    padding: 15px 0 0 0;
    margin-top: 15px;
  }
}
</style>

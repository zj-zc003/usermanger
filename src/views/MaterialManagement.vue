<template>
  <div class="material-container">
    <div class="material-header">
      <h2 class="page-title">素材管理</h2>
      <el-button type="primary" class="upload-btn" @click="showUploadDialog">
        <i class="el-icon-upload"></i>上传素材
      </el-button>
    </div>
    
    <div class="operation-panel">
      <div class="search-box">
        <el-input 
          v-model="searchQuery"
          placeholder="搜索素材名称..."
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>
      
      <el-select v-model="filterType" placeholder="素材类型" clearable>
        <el-option label="全部类型" value=""></el-option>
        <el-option label="图片" value="image"></el-option>
        <el-option label="音频" value="audio"></el-option>
        <el-option label="电子书" value="ebook"></el-option>
        <el-option label="文档" value="doc"></el-option>
        <el-option label="视频" value="video"></el-option>
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
      />
    </div>
    
    <div class="material-table">
      <el-table :data="filteredMaterials" style="width: 100%" v-if="filteredMaterials.length > 0">
        <el-table-column label="素材" width="300">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <div class="material-icon" :style="{backgroundColor: getTypeBgColor(row.type)}">
                <i :class="getTypeIcon(row.type)" :style="{color: getTypeColor(row.type)}"></i>
              </div>
              <div>
                <div style="font-weight: 500;">{{ row.name }}</div>
                <div style="font-size: 12px; color: #909399;">{{ formatDate(row.created_at) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <span :class="['type-tag', row.type]">{{ getTypeLabel(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" :formatter="formatSize" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" icon="el-icon-view" @click="previewMaterial(row)"></el-button>
            <el-button size="small" icon="el-icon-edit" @click="editMaterial(row)"></el-button>
            <el-button size="small" icon="el-icon-delete" type="danger" @click="deleteMaterial(row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="empty-state" v-else>
        <i class="el-icon-folder-opened"></i>
        <h3>暂无素材内容</h3>
        <p>您还没有上传任何素材，点击"上传素材"按钮开始添加</p>
        <el-button type="primary" @click="showUploadDialog">
          <i class="el-icon-upload"></i> 上传素材
        </el-button>
      </div>
    </div>
    
    <div class="pagination-container" v-if="filteredMaterials.length > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="materials.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传素材" width="600px">
      <el-form :model="newMaterial" label-width="80px">
        <el-form-item label="素材名称">
          <el-input v-model="newMaterial.name" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="素材类型">
          <el-select v-model="newMaterial.type" placeholder="请选择类型">
            <el-option label="图片" value="image"></el-option>
            <el-option label="音频" value="audio"></el-option>
            <el-option label="电子书" value="ebook"></el-option>
            <el-option label="文档" value="doc"></el-option>
            <el-option label="视频" value="video"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件上传">
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip">支持图片、音频、电子书、文档、视频等格式</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newMaterial.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入素材描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addMaterial">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  setup() {
    // 素材类型常量
    const MATERIAL_TYPES = {
      image: { label: '图片', icon: 'el-icon-picture', color: '#67C23A', bgColor: '#e1f3d8' },
      audio: { label: '音频', icon: 'el-icon-headset', color: '#E6A23C', bgColor: '#faecd8' },
      ebook: { label: '电子书', icon: 'el-icon-notebook-2', color: '#F56C6C', bgColor: '#fde2e2' },
      doc: { label: '文档', icon: 'el-icon-document', color: '#409EFF', bgColor: '#d9ecff' },
      video: { label: '视频', icon: 'el-icon-video-camera', color: '#909399', bgColor: '#e9e9eb' }
    };
    
    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    
    // 搜索和过滤
    const searchQuery = ref('');
    const filterType = ref('');
    const dateRange = ref([]);
    
    // 对话框可见性
    const uploadDialogVisible = ref(false);
    
    // 新素材
    const newMaterial = reactive({
      name: '',
      type: 'image',
      description: '',
      file: null
    });
    
    // 模拟素材数据
    const materials = ref([
      { id: 1, name: '课程封面图', type: 'image', size: 245760, created_at: '2023-08-10' },
      { id: 2, name: '产品介绍视频', type: 'video', size: 52428800, duration: 300, created_at: '2023-08-05' },
      { id: 3, name: '教学PPT', type: 'doc', size: 1024000, created_at: '2023-08-15' },
      { id: 4, name: '背景音乐', type: 'audio', size: 5120000, duration: 180, created_at: '2023-07-28' },
      { id: 5, name: 'Python电子书', type: 'ebook', size: 3145728, created_at: '2023-08-12' },
      { id: 6, name: '用户头像集', type: 'image', size: 1048576, created_at: '2023-08-01' },
      { id: 7, name: '产品使用教程', type: 'doc', size: 2048000, created_at: '2023-07-20' },
      { id: 8, name: '宣传视频', type: 'video', size: 73400320, duration: 420, created_at: '2023-08-18' },
      { id: 9, name: '系统通知音效', type: 'audio', size: 256000, duration: 5, created_at: '2023-08-03' },
      { id: 10, name: '课程Banner图', type: 'image', size: 786432, created_at: '2023-08-16' },
      { id: 11, name: 'JavaScript指南', type: 'ebook', size: 4194304, created_at: '2023-07-25' },
      { id: 12, name: '产品白皮书', type: 'doc', size: 3145728, created_at: '2023-08-08' }
    ]);
    
    // 过滤后的素材
    const filteredMaterials = computed(() => {
      let result = materials.value;
      
      // 按类型过滤
      if (filterType.value) {
        result = result.filter(m => m.type === filterType.value);
      }
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(m => 
          m.name.toLowerCase().includes(query)
        );
      }
      
      // 日期过滤
      if (dateRange.value && dateRange.value.length === 2) {
        const [start, end] = dateRange.value;
        result = result.filter(m => {
          const date = new Date(m.created_at);
          const startDate = new Date(start);
          const endDate = new Date(end);
          endDate.setDate(endDate.getDate() + 1); // 包含结束日期
          return date >= startDate && date < endDate;
        });
      }
      
      // 分页处理
      const start = (currentPage.value - 1) * pageSize.value;
      return result.slice(start, start + pageSize.value);
    });
    
    // 获取类型标签
    const getTypeLabel = (type) => MATERIAL_TYPES[type]?.label || type;
    
    // 获取类型图标
    const getTypeIcon = (type) => MATERIAL_TYPES[type]?.icon || 'el-icon-document';
    
    // 获取类型颜色
    const getTypeColor = (type) => MATERIAL_TYPES[type]?.color || '#909399';
    
    // 获取类型背景色
    const getTypeBgColor = (type) => MATERIAL_TYPES[type]?.bgColor || '#f5f7fa';
    
    // 格式化文件大小
    const formatSize = (row, column, cellValue) => {
      const bytes = cellValue;
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    // 显示上传对话框
    const showUploadDialog = () => {
      newMaterial.name = '';
      newMaterial.type = 'image';
      newMaterial.description = '';
      newMaterial.file = null;
      uploadDialogVisible.value = true;
    };
    
    // 处理文件变化
    const handleFileChange = (file) => {
      newMaterial.file = file.raw;
      if (!newMaterial.name) {
        newMaterial.name = file.name.split('.')[0];
      }
    };
    
    // 添加素材
    const addMaterial = () => {
      if (!newMaterial.name.trim()) {
        ElMessage.warning('请输入素材名称');
        return;
      }
      
      const newId = materials.value.length ? Math.max(...materials.value.map(m => m.id)) + 1 : 1;
      
      materials.value.push({
        id: newId,
        name: newMaterial.name,
        type: newMaterial.type,
        size: newMaterial.file ? newMaterial.file.size : Math.floor(Math.random() * 5000000) + 100000,
        created_at: new Date().toISOString().split('T')[0],
        duration: ['audio', 'video'].includes(newMaterial.type) ? Math.floor(Math.random() * 600) + 30 : null
      });
      
      ElMessage.success('素材添加成功');
      uploadDialogVisible.value = false;
    };
    
    // 编辑素材
    const editMaterial = (material) => {
      ElMessage.info(`编辑素材: ${material.name}`);
    };
    
    // 删除素材
    const deleteMaterial = (material) => {
      ElMessageBox.confirm(`确定要删除 "${material.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        materials.value = materials.value.filter(m => m.id !== material.id);
        ElMessage.success('素材已删除');
      }).catch(() => {});
    };
    
    // 预览素材
    const previewMaterial = (material) => {
      ElMessage.info(`预览素材: ${material.name}`);
    };
    
    // 处理分页变化
    const handlePageChange = (page) => {
      currentPage.value = page;
    };
    
    return {
      currentPage,
      pageSize,
      searchQuery,
      filterType,
      dateRange,
      uploadDialogVisible,
      newMaterial,
      filteredMaterials,
      getTypeLabel,
      getTypeIcon,
      getTypeColor,
      getTypeBgColor,
      formatSize,
      formatDate,
      showUploadDialog,
      handleFileChange,
      addMaterial,
      editMaterial,
      deleteMaterial,
      previewMaterial,
      handlePageChange
    };
  }
}
</script>

<style scoped>
.material-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #f7f9fb;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2d3d;
}

.operation-panel {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.material-table {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  flex: 1;
}

.type-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.type-tag.image { background: #e1f3d8; color: #67C23A; }
.type-tag.audio { background: #faecd8; color: #E6A23C; }
.type-tag.ebook { background: #fde2e2; color: #F56C6C; }
.type-tag.doc { background: #d9ecff; color: #409EFF; }
.type-tag.video { background: #e9e9eb; color: #909399; }

.material-icon {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.material-icon i {
  font-size: 22px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 60px;
  color: #c0c4cc;
}

.empty-state h3 {
  font-size: 18px;
  margin: 15px 0 10px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}
</style>

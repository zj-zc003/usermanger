<template>
  <div class="partner-view">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left-section">
        <h2 class="page-title">合伙人管理</h2>
        <el-button 
          type="primary"
          @click="handleAddPartner"
        >
          添加合伙人
        </el-button>
        <el-button 
          type="danger"
          :disabled="selectedPartners.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button 
          type="warning"
          @click="fetchPartners"
        >
          刷新数据
        </el-button>
      </div>
      <div class="right-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索姓名或手机号"
          style="width: 250px; margin-right: 15px;"
          clearable
          @clear="fetchPartners"
          @keyup.enter="fetchPartners"
        />
        <el-select 
          v-model="statusFilter" 
          placeholder="状态筛选" 
          clearable
          @change="fetchPartners"
        >
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 状态统计卡片 -->
    <div class="status-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(card, index) in statusCards" :key="index">
          <div 
            class="status-card"
            :class="'status-' + card.status"
            @click="handleCardClick(card.status)"
          >
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-count">{{ card.count }}人</div>
            </div>
            <div>
              <i :class="card.icon"></i>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 合伙人列表 -->
    <div class="partner-list">
      <el-table 
        :data="partners" 
        border 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="dark">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请日期" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核日期" width="180">
          <template #default="{ row }">
            {{ row.auditTime ? formatDateTime(row.auditTime) : '未审核' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
  <template #default="{ row }">
<!--<el-button 
      size="mini" 
      type="primary"
      @click="handleViewDetails(row)"
      style="padding: 5px 8px" 
    >查看</el-button>
    
    <el-button 
      size="mini" 
      @click="handleEdit(row)"
      style="padding: 5px 8px" 
    >编辑</el-button>-->
    <el-button 
      size="mini" 
      type="warning"
      @click="showReviewDialog(row)"
    >审核</el-button>
    <el-button 
      size="mini" 
      type="danger" 
      @click="handleDelete(row.id)"
      :disabled="row.status === 1"
      style="padding: 5px 8px" 
    >删除</el-button>
  </template>
</el-table-column>

      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-section">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="totalPartners"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 审核对话框（新增） -->
    <el-dialog
      title="合伙人审核"
      v-model="reviewDialogVisible"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="申请人">
          <span>{{ currentApply.realName }} ({{ currentApply.phone }})</span>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            type="textarea"
            v-model="reviewComment"
            placeholder="请输入审核意见"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="submitReview(false)">拒 绝</el-button>
          <el-button type="primary" @click="submitReview(true)">通 过</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="showDialog"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="currentPartner" 
        label-width="100px" 
        :rules="rules" 
        ref="partnerForm"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="realName">
              <el-input 
                v-model="currentPartner.realName" 
                placeholder="请输入姓名" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input 
                v-model="currentPartner.phone" 
                placeholder="请输入手机号" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="currentPartner.status">
                <el-radio 
                  v-for="status in statusOptions" 
                  :key="status.value" 
                  :label="status.value"
                >
                  {{ status.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户ID" prop="userId">
              <el-input 
                v-model.number="currentPartner.userId" 
                placeholder="请输入用户ID" 
                type="number"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false">取 消</el-button>
          <el-button type="primary" @click="submitPartner">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog 
      title="合伙人详情" 
      v-model="showDetailDialog"
      width="700px"
    >
      <div v-if="currentDetail" class="partner-detail">
        <el-descriptions 
          title="基本信息" 
          border 
          :column="2"
        >
          <el-descriptions-item label="姓名">
            {{ currentDetail.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentDetail.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ currentDetail.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentDetail.status)" effect="dark">
              {{ getStatusLabel(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请日期">
            {{ formatDateTime(currentDetail.applyTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="审核日期">
            {{ currentDetail.auditTime ? formatDateTime(currentDetail.auditTime) : '未审核' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showDetailDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PartnerView',
  data() {
    return {
      reviewDialogVisible: false,  // 审核对话框显示控制
      currentApply: {},            // 当前审核的申请对象
      reviewComment: '',           // 审核备注
      loading: false,
      partners: [],
      selectedPartners: [],
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      totalPartners: 0,
      showDialog: false,
      showDetailDialog: false,
      isEditing: false,
      currentPartner: {
        id: null,
        userId: null,
        realName: '',
        phone: '',
        status: 0
      },
      currentDetail: null,
      statusOptions: [
        { label: '待审核', value: 0 },
        { label: '已通过', value: 1 },
        { label: '已拒绝', value: 2 }
      ],
      statusCards: [
        { title: '待审核', status: 0, count: 0, color: '#e6a23c' },
        { title: '已通过', status: 1, count: 0, color: '#67c23a' },
        { title: '已拒绝', status: 2, count: 0, color: '#f56c6c' }
      ],
      rules: {
        realName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2到10个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '请输入用户ID', trigger: 'blur' },
          { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEditing ? '编辑合伙人' : '添加合伙人';
    }
  },
  mounted() {
    this.fetchPartners();
  },
  methods: {

    // 显示审核对话框
  showReviewDialog(row) {
    this.currentApply = { ...row };
    this.reviewComment = '';
    this.reviewDialogVisible = true;
  },
  
  // 提交审核结果 - 修改为匹配后端API
    async submitReview(approved) {
    try {
      // 使用查询参数传递 approved 而不是请求体
      await axios.post(
        `http://localhost:8080/partner/apply/${this.currentApply.id}/review?approved=${approved}`,
        { comment: this.reviewComment }
      );
      
      this.$message.success(approved ? "申请已通过" : "申请已拒绝");
      this.reviewDialogVisible = false;
      this.fetchPartners();
    } catch (error) {
      this.$message.error(`审核失败: ${error.response?.data?.message || error.message}`);
    }
  },
  
  // 状态格式化
  formatStatus(status) {
    const statusMap = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝'
    };
    return statusMap[status] || status;
  },

    // API请求方法 - 直接使用axios
    async getPartners(params) {
      const response = await axios.get('http://localhost:8080/partner/apply', { 
        params,
        timeout: 5000
      });
      return response.data;
    },
    
    async addPartner(data) {
      const response = await axios.post('http://localhost:8080/partner/apply', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    
    async updatePartner(id, data) {
      const response = await axios.put(`http://localhost:8080/partner/apply/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    },
    
    async deletePartner(id) {
      const response = await axios.delete(`http://localhost:8080/partner/apply/${id}`);
      return response.data;
    },
    
    async batchDeletePartners(ids) {
      const response = await axios.delete('http://localhost:8080/partner/apply/batch', {
        data: { ids }
      });
      return response.data;
    },
    
    // 主业务方法
    async fetchPartners() {
      try {
        this.loading = true;
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          status: this.statusFilter || undefined,
          search: this.searchQuery || undefined
        };

        const response = await this.getPartners(params);
        
        if (!response || !response.list) {
          throw new Error('无效的响应数据格式');
        }
        
        this.partners = response.list;
        this.totalPartners = response.total;
        this.updateStatusCards();
        
      } catch (error) {
        console.error('获取合伙人列表失败:', error);
        
        let errorMessage = '未知错误';
        if (error.response) {
          errorMessage = `服务器响应错误: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = '网络错误: 服务器无响应';
        } else {
          errorMessage = `请求错误: ${error.message}`;
        }
        
        this.$message.error(`获取合伙人列表失败: ${errorMessage}`);
      } finally {
        this.loading = false;
      }
    },
    
    formatDateTime(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchPartners();
    },
    
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchPartners();
    },
    
    handleSelectionChange(selection) {
      this.selectedPartners = selection;
    },
    
    handleAddPartner() {
      this.isEditing = false;
      this.currentPartner = {
        id: null,
        userId: null,
        realName: '',
        phone: '',
        status: 0
      };
      this.showDialog = true;
    },
    
    handleEdit(partner) {
      this.isEditing = true;
      this.currentPartner = { ...partner };
      this.showDialog = true;
    },
    
    handleViewDetails(partner) {
      this.currentDetail = { ...partner };
      this.showDetailDialog = true;
    },
    
    async handleDelete(id) {
      try {
        await this.$confirm('确定要删除此合伙人申请吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await this.deletePartner(id);
        this.$message.success('删除成功');
        this.fetchPartners();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
          this.$message.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    },
    
    async handleBatchDelete() {
      if (this.selectedPartners.length === 0) return;
      
      try {
        await this.$confirm(`确定要删除选中的${this.selectedPartners.length}个合伙人吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const ids = this.selectedPartners.map(p => p.id);
        await this.batchDeletePartners(ids);
        this.$message.success('批量删除成功');
        this.selectedPartners = [];
        this.fetchPartners();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error);
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'));
        }
      }
    },
    
    async submitPartner() {
      try {
        await this.$refs.partnerForm.validate();
        
        // 准备提交数据
        const partnerData = { ...this.currentPartner };
        
        if (this.isEditing) {
          await this.updatePartner(this.currentPartner.id, partnerData);
          this.$message.success('更新成功');
        } else {
          await this.addPartner(partnerData);
          this.$message.success('添加成功');
        }
        
        this.showDialog = false;
        this.fetchPartners();
      } catch (error) {
        if (error instanceof Error) {
          console.error('操作失败:', error);
          this.$message.error('操作失败: ' + error.message);
        }
      }
    },
    
    getStatusTagType(status) {
      const map = {
        0: 'warning',  // 待审核
        1: 'success',  // 已通过
        2: 'danger'    // 已拒绝
      };
      return map[status] || '';
    },
    
    getStatusLabel(status) {
      const map = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      };
      return map[status] || '未知状态';
    },
    
    handleCardClick(status) {
      this.statusFilter = status;
      this.fetchPartners();
    },
    
    updateStatusCards() {
      // 重置状态卡片
      this.statusCards.forEach(card => card.count = 0);
      
      // 统计各个状态的数量
      this.partners.forEach(partner => {
        const card = this.statusCards.find(c => c.status === partner.status);
        if (card) {
          card.count++;
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
/* 添加在 <style scoped lang="scss"> 内部 */

/* 调整所有按钮的内边距 */
.el-button {
  padding: 5px 8px !important;
}

/* 调整操作列宽度 */
.partner-list .el-table__row .el-table_1_column_6 {
  min-width: 200px;
}


.partner-view {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-right: 20px;
  }
}

.right-section {
  display: flex;
  align-items: center;
}

.status-cards {
  margin-bottom: 20px;
  
  .status-card {
    display: flex;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    &.status-0 {
      background: linear-gradient(to right, #fff8e1, #ffe0b2);
    }
    
    &.status-1 {
      background: linear-gradient(to right, #e8f5e9, #c8e6c9);
    }
    
    &.status-2 {
      background: linear-gradient(to right, #ffebee, #ffcdd2);
    }
    
    .card-content {
      flex: 1;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .card-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .card-count {
        font-size: 24px;
        font-weight: bold;
      }
    }
    
  }
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.partner-detail {
  .detail-section {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
    
    h3 {
      margin-bottom: 15px;
      font-weight: 500;
      color: #606266;
    }
    
    .data-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      
      .data-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .data-value {
        font-size: 22px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}
</style>

<template>
  <div class="pdf-viewer">
    <div class="pdf-container">
      <div v-for="page in pages" :key="page" class="pdf-page">
        <div class="page-number">第 {{ page }} 页</div>
        <div class="page-content">
          <div class="mock-pdf-content">
            <div class="pdf-header">PDF文档预览</div>
            <div class="pdf-body">
              <p>这是PDF文档的模拟视图</p>
              <p>实际实现中会使用PDF.js等库渲染</p>
            </div>
            <div class="pdf-footer">
              第 {{ page }} 页 / 共 {{ pageCount }} 页
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    pageCount: {
      type: Number,
      default: 1
    }
  },
  computed: {
    pages() {
      return Array.from({ length: Math.min(3, this.pageCount) }, (_, i) => i + 1);
    }
  }
};
</script>

<style scoped>
.pdf-container {
  border: 1px solid #eee;
  padding: 10px;
  background: #f9f9f9;
}

.pdf-page {
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.page-number {
  padding: 5px 10px;
  background: #f0f0f0;
  font-size: 12px;
}

.mock-pdf-content {
  padding: 15px;
  min-height: 300px;
}

.pdf-header, .pdf-footer {
  padding: 8px;
  background: #f5f5f5;
  text-align: center;
}

.pdf-body {
  padding: 20px;
  min-height: 250px;
}
</style>

<template>
  <div class="tinymce-editor">
    <div class="toolbar" v-if="toolbarVisible">
      <div class="toolbar-group" v-for="(group, index) in toolbarGroups" :key="index">
        <button 
          v-for="tool in group" 
          :key="tool" 
          @click="execCommand(tool)"
          :title="getTooltip(tool)"
          :class="{ active: isActive(tool) }"
        >
          <i :class="toolIcons[tool] || 'fa fa-font'"></i>
        </button>
      </div>
    </div>
    <div 
      ref="editor" 
      class="editor-content" 
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeyDown"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'TinyMceEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      // 工具栏配置
      toolbarGroups: [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['formatBlock'],
        ['alignleft', 'aligncenter', 'alignright'],
        ['insertUnorderedList', 'insertOrderedList'],
        ['createLink', 'unlink'],
        ['insertImage'],
        ['undo', 'redo']
      ],
      // 工具栏图标映射
      toolIcons: {
        'bold': 'fa fa-bold',
        'italic': 'fa fa-italic',
        'underline': 'fa fa-underline',
        'strikethrough': 'fa fa-strikethrough',
        'formatBlock': 'fa fa-paragraph',
        'alignleft': 'fa fa-align-left',
        'aligncenter': 'fa fa-align-center',
        'alignright': 'fa fa-align-right',
        'insertUnorderedList': 'fa fa-list-ul',
        'insertOrderedList': 'fa fa-list-ol',
        'createLink': 'fa fa-link',
        'unlink': 'fa fa-unlink',
        'insertImage': 'fa fa-image',
        'undo': 'fa fa-undo',
        'redo': 'fa fa-redo'
      },
      // 工具栏提示文本
      toolTips: {
        'bold': '加粗',
        'italic': '斜体',
        'underline': '下划线',
        'strikethrough': '删除线',
        'formatBlock': '段落格式',
        'alignleft': '左对齐',
        'aligncenter': '居中对齐',
        'alignright': '右对齐',
        'insertUnorderedList': '无序列表',
        'insertOrderedList': '有序列表',
        'createLink': '添加链接',
        'unlink': '移除链接',
        'insertImage': '插入图片',
        'undo': '撤销',
        'redo': '重做'
      }
    }
  },
  computed: {
    toolbarVisible() {
      return this.toolbar
    }
  },
  mounted() {
    // 设置初始内容
    this.$refs.editor.innerHTML = this.modelValue || ''
    // 设置编辑器高度
    this.$refs.editor.style.minHeight = `${this.height}px`
    
    // 添加Font Awesome字体图标
    this.addFontAwesome()
  },
  watch: {
    modelValue(newVal) {
      if (newVal !== this.$refs.editor.innerHTML) {
        this.$refs.editor.innerHTML = newVal
      }
    }
  },
  methods: {
    // 添加Font Awesome图标库
    addFontAwesome() {
      const existingLink = document.querySelector('link[href*="font-awesome"]')
      if (existingLink) return
      
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
      document.head.appendChild(link)
    },
    
    // 执行编辑器命令
    execCommand(command, value = null) {
      if (command === 'insertImage') {
        this.insertImage()
        return
      }
      
      if (command === 'formatBlock') {
        const format = prompt('请输入格式 (p, h1, h2, h3, h4, h5, h6, blockquote, pre):', 'p')
        if (format) {
          document.execCommand('formatBlock', false, `<${format}>`)
        }
        return
      }
      
      document.execCommand(command, false, value)
      this.$refs.editor.focus()
    },
    
    // 插入图片
    insertImage() {
      const url = prompt('请输入图片URL:', 'https://via.placeholder.com/400x200')
      if (url) {
        document.execCommand('insertImage', false, url)
      }
    },
    
    // 获取工具栏提示
    getTooltip(command) {
      return this.toolTips[command] || command
    },
    
    // 检查命令是否处于活动状态
    isActive(command) {
      if (command === 'formatBlock') {
        return document.queryCommandValue('formatBlock') !== ''
      }
      return document.queryCommandState(command)
    },
    
    // 处理输入事件
    handleInput() {
      this.$emit('update:modelValue', this.$refs.editor.innerHTML)
    },
    
    // 处理键盘事件
    handleKeyDown(e) {
      // 处理Tab键（缩进）
      if (e.key === 'Tab') {
        e.preventDefault()
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      }
    }
  }
}
</script>

<style scoped>
.tinymce-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.tinymce-editor:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.toolbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 6px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.toolbar-group {
  display: flex;
  border-right: 1px solid #e0e0e0;
  padding-right: 8px;
  margin-right: 8px;
}

.toolbar-group:last-child {
  border-right: none;
  margin-right: 0;
  padding-right: 0;
}

.toolbar button {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 14px;
}

.toolbar button:hover {
  background-color: #e8f4ff;
  color: #409eff;
}

.toolbar button.active {
  background-color: #e8f4ff;
  color: #409eff;
}

.editor-content {
  padding: 15px;
  min-height: 300px;
  outline: none;
  overflow-y: auto;
}

.editor-content:focus {
  outline: none;
}

.editor-content p {
  margin: 0 0 10px 0;
}

.editor-content img {
  max-width: 100%;
  height: auto;
}
</style>

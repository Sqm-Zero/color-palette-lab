<template>
  <div class="gradient-card">
    <div class="preview" :style="{ background: css }" @click="copyCss"></div>
    <div class="meta">
      <code class="css">{{ css }}</code>
      <div class="actions">
        <button class="btn" @click="copyCss">复制 CSS</button>
        <button class="btn" @click="exportSvg">导出 SVG</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    css: { type: String, required: true }
  },
  methods: {
    copyCss() {
      navigator.clipboard.writeText(this.css)
        .then(() => alert('已复制 CSS 渐变'))
        .catch(err => console.error('复制失败', err))
    },
    exportSvg() {
      const svg = this.generateSvg(this.css)
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'gradient.svg'
      a.click()
      URL.revokeObjectURL(url)
    },
    generateSvg(css) {
      // 将 CSS 渐变作为 <rect> 的 fill，通过 foreignObject 兼容大多数线性/径向渐变
      const escaped = css.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">\n  <defs/>\n  <foreignObject width="100%" height="100%">\n    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${escaped}"></div>\n  </foreignObject>\n</svg>`
    }
  }
}
</script>

<style scoped>
.gradient-card { 
  border: 1px solid #eaecef; 
  border-radius: 8px; 
  overflow: hidden; 
  background: #fff; 
}
.preview { height: 140px; cursor: pointer; }
.meta { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .75rem; }
.css { font-family: monospace; font-size: .8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.actions { display: flex; gap: .5rem; }
.btn { background: #3eaf7c; color: #fff; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: .85rem; }
.btn:hover { opacity: .9 }
</style>


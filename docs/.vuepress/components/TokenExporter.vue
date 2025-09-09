<template>
  <div class="token-exporter">
    <div class="controls">
      <button @click="downloadCss">导出 CSS 变量</button>
      <button @click="downloadScss">导出 SCSS 变量</button>
      <button @click="downloadLess">导出 LESS 变量</button>
      <button @click="downloadTailwind">导出 Tailwind 配置</button>
      <button @click="downloadSd">导出 Style Dictionary</button>
      <button @click="downloadZip">打包导出 Zip</button>
    </div>
    <pre class="preview"><code>{{ preview }}</code></pre>
  </div>
</template>

<script>
export default {
  props: {
    palette: { type: Array, required: true },
    prefix: { type: String, default: 'color' }
  },
  computed: {
    preview() {
      const css = this.generateCssVars()
      return css
    }
  },
  methods: {
    slug(i) { return String(i + 1).padStart(2, '0') },
    generateCssVars() {
      const lines = [':root {']
      this.palette.forEach((hex, i) => {
        lines.push(`  --${this.prefix}-${this.slug(i)}: ${hex};`)
      })
      lines.push('}')
      return lines.join('\n')
    },
    generateScss() {
      return this.palette.map((hex, i) => `$${this.prefix}-${this.slug(i)}: ${hex};`).join('\n') + '\n'
    },
    generateLess() {
      return this.palette.map((hex, i) => `@${this.prefix}-${this.slug(i)}: ${hex};`).join('\n') + '\n'
    },
    generateTailwind() {
      const colors = {}
      this.palette.forEach((hex, i) => { colors[this.slug(i)] = hex })
      return `module.exports = { theme: { extend: { colors: { ${this.prefix}: ${JSON.stringify(colors, null, 2)} } } } }\n`
    },
    generateSd() {
      const out = { color: {} }
      this.palette.forEach((hex, i) => { out.color[this.slug(i)] = { value: hex } })
      return JSON.stringify({ token: { [this.prefix]: out } }, null, 2)
    },
    download(text, filename, type='text/plain') {
      const blob = new Blob([text], { type: `${type};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    downloadCss() { this.download(this.generateCssVars(), `${this.prefix}-tokens.css`, 'text/css') },
    downloadScss() { this.download(this.generateScss(), `${this.prefix}-tokens.scss`, 'text/x-scss') },
    downloadLess() { this.download(this.generateLess(), `${this.prefix}-tokens.less`, 'text/plain') },
    downloadTailwind() { this.download(this.generateTailwind(), `tailwind.config.js`) },
    downloadSd() { this.download(this.generateSd(), `${this.prefix}-tokens.json`, 'application/json') },
    async downloadZip() {
      const files = [
        { name: `${this.prefix}-tokens.css`, text: this.generateCssVars() },
        { name: `${this.prefix}-tokens.scss`, text: this.generateScss() },
        { name: `${this.prefix}-tokens.less`, text: this.generateLess() },
        { name: `tailwind.config.js`, text: this.generateTailwind() },
        { name: `${this.prefix}-tokens.json`, text: this.generateSd() }
      ]
      const JSZip = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
      const zip = new JSZip.default()
      files.forEach(f => zip.file(f.name, f.text))
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.prefix}-tokens.zip`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped>
.token-exporter { display: grid; gap: .75rem; }
.controls { display: flex; gap: .5rem; flex-wrap: wrap; }
.preview { background: #f7fafc; padding: .75rem; border-radius: 6px; max-height: 220px; overflow: auto; }
button { background: #3eaf7c; color: #fff; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: .85rem; }
button:hover { opacity: .9 }
</style>


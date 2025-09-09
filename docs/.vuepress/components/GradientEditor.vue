<template>
  <div class="gradient-editor">
    <div class="controls">
      <label>类型</label>
      <select v-model="type">
        <option value="linear">线性</option>
        <option value="radial">径向</option>
      </select>
      <label v-if="type==='linear'">角度</label>
      <input v-if="type==='linear'" type="range" min="0" max="360" v-model.number="angle" />
      <span v-if="type==='linear'">{{ angle }}°</span>
      <button @click="addStop">添加色标</button>
      <button @click="exportSvg">导出 SVG</button>
    </div>
    <div class="stops">
      <div v-for="(s, i) in stops" :key="i" class="stop">
        <input type="color" v-model="s.color" />
        <input type="range" min="0" max="100" v-model.number="s.pos" />
        <span>{{ s.pos }}%</span>
        <button @click="moveUp(i)" :disabled="i===0">上移</button>
        <button @click="moveDown(i)" :disabled="i===stops.length-1">下移</button>
        <button @click="removeStop(i)">移除</button>
      </div>
    </div>
    <div class="preview" :style="{ background: css }"></div>
    <div class="output">
      <code class="css">{{ css }}</code>
      <button @click="copyCss">复制 CSS</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#A18CD1', pos: 0 },
        { color: '#FBC2EB', pos: 100 }
      ]
    }
  },
  computed: {
    css() {
      const stops = this.stops
        .slice()
        .sort((a,b)=>a.pos-b.pos)
        .map(s => `${s.color} ${s.pos}%`)
        .join(', ')
      return this.type === 'linear'
        ? `linear-gradient(${this.angle}deg, ${stops})`
        : `radial-gradient(circle, ${stops})`
    }
  },
  methods: {
    addStop() { this.stops.push({ color: '#ffffff', pos: 50 }) },
    removeStop(i) { this.stops.splice(i, 1) },
    moveUp(i) { if (i>0) { const t=this.stops[i-1]; this.$set(this.stops, i-1, this.stops[i]); this.$set(this.stops, i, t) } },
    moveDown(i) { if (i<this.stops.length-1) { const t=this.stops[i+1]; this.$set(this.stops, i+1, this.stops[i]); this.$set(this.stops, i, t) } },
    copyCss() {
      navigator.clipboard.writeText(this.css)
        .then(()=>alert('已复制 CSS'))
        .catch(()=>{})
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
      const escaped = css.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">\n  <defs/>\n  <foreignObject width="100%" height="100%">\n    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${escaped}"></div>\n  </foreignObject>\n</svg>`
    }
  }
}
</script>

<style scoped>
.gradient-editor { display: grid; gap: .75rem; }
.controls { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.stops { display: grid; gap: .5rem; }
.stop { display: grid; grid-template-columns: 120px 1fr auto auto auto auto; align-items: center; gap: .5rem; }
.preview { height: 160px; border: 1px solid #eaecef; border-radius: 8px; }
.output { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.css { font-family: monospace; font-size: .85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
button { background: #3eaf7c; color: #fff; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: .85rem; }
button:hover { opacity: .9 }
</style>


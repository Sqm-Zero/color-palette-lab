<template>
  <div class="gradient-sampler">
    <div class="controls">
      <label>CSS 渐变</label>
      <input type="text" v-model="css" placeholder="linear-gradient(135deg, #A18CD1, #FBC2EB)" />
      <label>采样数量</label>
      <input type="range" min="2" max="8" v-model.number="count" />
      <span>{{ count }}</span>
      <button @click="sample">采样生成色卡</button>
      <button @click="importToRecommender" :disabled="!colors.length">导入推荐器</button>
    </div>
    <div class="preview" :style="{ background: css }"></div>
    <div class="result" v-if="colors.length">
      <ColorPalette :colors="colors" />
    </div>
  </div>
</template>

<script>
import ColorPalette from './ColorPalette.vue'

export default {
  components: { ColorPalette },
  data() {
    return {
      css: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)',
      count: 5,
      colors: []
    }
  },
  methods: {
    sample() {
      const matches = this.css.match(/#([0-9a-fA-F]{6})/g) || []
      if (matches.length < 2) return alert('请至少提供两个颜色')
      const hexes = matches.map(h => h)
      const result = []
      for (let i = 0; i < this.count; i++) {
        const t = i / (this.count - 1)
        const idx = t * (hexes.length - 1)
        const i0 = Math.floor(idx)
        const i1 = Math.min(hexes.length - 1, i0 + 1)
        const localT = idx - i0
        const c = this.mix(hexes[i0], hexes[i1], localT)
        result.push(c)
      }
      this.colors = result
    },
    mix(h1, h2, t) {
      const c1 = this.hexToRgb(h1)
      const c2 = this.hexToRgb(h2)
      const r = Math.round(c1.r + (c2.r - c1.r) * t)
      const g = Math.round(c1.g + (c2.g - c1.g) * t)
      const b = Math.round(c1.b + (c2.b - c1.b) * t)
      return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(b)}`
    },
    hexToRgb(hex) {
      const m = hex.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/)
      return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    },
    toHex(v) { return v.toString(16).padStart(2, '0') },
    importToRecommender() {
      try {
        localStorage.setItem('palette_from_sampler', JSON.stringify(this.colors))
        alert('已导入推荐器，请前往“高级色彩工具”载入。')
      } catch {}
    }
  }
}
</script>

<style scoped>
.gradient-sampler { display: grid; gap: .75rem; }
.controls { display: grid; gap: .5rem; grid-template-columns: 120px 1fr 120px 1fr auto auto; align-items: center; }
.controls input[type="text"] { grid-column: span 4; padding: 6px 8px; border: 1px solid #eaecef; border-radius: 4px; }
.preview { height: 140px; border-radius: 8px; border: 1px solid #eaecef; }
.result { margin-top: .5rem; }
</style>


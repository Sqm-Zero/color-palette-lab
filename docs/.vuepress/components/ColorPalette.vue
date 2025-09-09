<template>
    <div class="color-palette">
      <div class="palette-toolbar">
        <button class="btn" @click.stop="copyAllColors">复制全部</button>
        <button class="btn" @click.stop="exportAsJson">导出 JSON</button>
        <button class="btn" @click.stop="exportAsGpl">导出 GPL</button>
        <button class="btn" @click.stop="exportAsAco">导出 ACO</button>
        <button class="btn" @click.stop="exportAsAse">导出 ASE</button>
        <button class="btn" @click.stop="exportAsPng">导出 PNG</button>
      </div>
      <div class="blocks" ref="blocks">
        <div 
          v-for="(color, index) in colors" 
          :key="index"
          class="color-block"
          :style="{ backgroundColor: color }"
          @click="copyToClipboard(color)"
        >
          <span class="color-code">{{ color }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import chroma from 'chroma-js'
  
  export default {
    props: {
      colors: {
        type: Array,
        required: true
      }
    },
    methods: {
      copyToClipboard(text) {
        navigator.clipboard.writeText(text)
          .then(() => {
            alert(`已复制: ${text}`)
          })
          .catch(err => {
            console.error('复制失败:', err)
          })
      },
      copyAllColors() {
        const joined = this.colors.join(', ')
        navigator.clipboard.writeText(joined)
          .then(() => {
            alert('已复制全部颜色: ' + joined)
          })
          .catch(err => console.error('复制全部失败:', err))
      },
      exportAsJson() {
        try {
          const json = JSON.stringify({ colors: this.colors }, null, 2)
          const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'palette.json'
          a.click()
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('导出 JSON 失败:', e)
        }
      },
      exportAsGpl() {
        try {
          const header = ['GIMP Palette', 'Name: Exported Palette', 'Columns: 0', '#']
          const lines = this.colors.map(hex => {
            const rgb = chroma(hex).rgb()
            const [r, g, b] = rgb
            return `${Math.round(r)}\t${Math.round(g)}\t${Math.round(b)}\t${hex}`
          })
          const content = header.concat(lines).join('\n')
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'palette.gpl'
          a.click()
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('导出 GPL 失败:', e)
        }
      },
      exportAsAco() {
        try {
          const buffer = this.createAcoBuffer(this.colors)
          const blob = new Blob([buffer], { type: 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'palette.aco'
          a.click()
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('导出 ACO 失败:', e)
        }
      },
      exportAsAse() {
        try {
          const buffer = this.createAseBuffer(this.colors)
          const blob = new Blob([buffer], { type: 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'palette.ase'
          a.click()
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('导出 ASE 失败:', e)
        }
      },
      async exportAsPng() {
        try {
          const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')).default
          const node = this.$refs.blocks
          const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 })
          const url = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = url
          a.download = 'palette.png'
          a.click()
        } catch (e) {
          console.error('导出 PNG 失败:', e)
        }
      },
      createAcoBuffer(hexColors) {
        const count = hexColors.length
        const bytes = 4 + count * 10
        const buffer = new ArrayBuffer(bytes)
        const view = new DataView(buffer)
        let offset = 0
        view.setUint16(offset, 1, false); offset += 2
        view.setUint16(offset, count, false); offset += 2
        hexColors.forEach(hex => {
          const [r, g, b] = chroma(hex).rgb().map(v => Math.round(v * 257))
          view.setUint16(offset, 0, false); offset += 2
          view.setUint16(offset, r, false); offset += 2
          view.setUint16(offset, g, false); offset += 2
          view.setUint16(offset, b, false); offset += 2
          view.setUint16(offset, 0, false); offset += 2
        })
        return buffer
      },
      createAseBuffer(hexColors) {
        const encoder = (s) => new TextEncoder().encode(s)
        const blocks = hexColors.map(hex => this._aseColorBlock(hex))
        const header = new ArrayBuffer(12)
        const hv = new DataView(header)
        const sig = encoder('ASEF')
        const hbytes = new Uint8Array(header)
        hbytes.set(sig, 0)
        hv.setUint16(4, 1, false)
        hv.setUint16(6, 0, false)
        hv.setUint32(8, blocks.length, false)
        const total = 12 + blocks.reduce((s, b) => s + b.byteLength, 0)
        const out = new Uint8Array(total)
        out.set(new Uint8Array(header), 0)
        let offset = 12
        blocks.forEach(b => { out.set(new Uint8Array(b), offset); offset += b.byteLength })
        return out.buffer
      },
      _aseColorBlock(hex) {
        const name = hex
        const nameLen = name.length + 1
        const nameBytes = new ArrayBuffer(2 + nameLen * 2)
        const nv = new DataView(nameBytes)
        nv.setUint16(0, nameLen, false)
        for (let i = 0; i < name.length; i++) {
          nv.setUint16(2 + i * 2, name.charCodeAt(i), false)
        }
        nv.setUint16(2 + (nameLen - 1) * 2, 0, false)
        const model = new TextEncoder().encode('RGB ')
        const rgb = chroma(hex).rgb().map(v => v / 255)
        const colorArea = new ArrayBuffer(4 + 4 * 4 + 2)
        const cv = new DataView(colorArea)
        new Uint8Array(colorArea).set(model, 0)
        cv.setFloat32(4, rgb[0], false)
        cv.setFloat32(8, rgb[1], false)
        cv.setFloat32(12, rgb[2], false)
        cv.setFloat32(16, 1.0, false)
        cv.setUint16(20, 0, false)
        const bodyLen = nameBytes.byteLength + colorArea.byteLength
        const block = new ArrayBuffer(2 + 4 + bodyLen)
        const bv = new DataView(block)
        bv.setUint16(0, 1, false)
        bv.setUint32(2, bodyLen, false)
        new Uint8Array(block).set(new Uint8Array(nameBytes), 6)
        new Uint8Array(block).set(new Uint8Array(colorArea), 6 + nameBytes.byteLength)
        return block
      },
      getTextColor(bgColor) {
        return chroma.contrast(bgColor, 'white') > 4.5 ? 'white' : 'black'
      }
    }
  }
  </script>
  
  <style scoped>
  .color-palette {
    display: flex;
    flex-wrap: wrap;
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .palette-toolbar {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .btn {
    background: #3eaf7c;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .btn:hover { opacity: 0.9; }
  
  .blocks { display: flex; flex: 1 1 100%; }
  .color-block {
    flex: 1;
    min-width: 120px;
    height: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 10px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .color-block:hover {
    transform: scale(1.05);
    z-index: 1;
  }
  
  .color-code {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
  }
  </style>
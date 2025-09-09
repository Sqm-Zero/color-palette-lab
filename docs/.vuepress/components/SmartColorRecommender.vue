<template>
    <div class="smart-recommender">
        <div class="input-section">
            <h3>智能配色生成器</h3>

            <div class="color-input">
                <label>主色选择</label>
                <input type="color" v-model="baseColor" @input="onParamsChange">
                <input type="text" v-model="baseColor" @input="validateColor">
            </div>

            <div class="style-selector">
                <label>风格偏好</label>
                <select v-model="selectedStyle" @change="onParamsChange">
                    <option value="monochromatic">单色系</option>
                    <option value="analogous">类似色</option>
                    <option value="complementary">互补色</option>
                    <option value="triadic">三色组合</option>
                    <option value="tetradic">四色组合</option>
                </select>
            </div>

            <div class="mood-selector">
                <label>色彩情绪</label>
                <div class="mood-buttons">
                    <button v-for="mood in moods" :key="mood.value" :class="{ active: selectedMood === mood.value }"
                        @click="selectMood(mood.value)">
                        {{ mood.label }}
                    </button>
                </div>
            </div>

            <div class="count-selector">
                <label>颜色数量</label>
                <input type="range" min="2" max="5" v-model.number="paletteSize" @input="onParamsChange" />
                <span>{{ paletteSize }}</span>
            </div>

            <div class="share-fav">
                <button @click="shareUrl">分享链接</button>
                <input type="text" v-model="favoriteTag" placeholder="收藏标签（可选）" />
                <button @click="saveFavorite">收藏</button>
                <button @click="importFromSampler">从采样导入</button>
            </div>

            <div class="favorites" v-if="favorites.length">
                <h5>我的收藏</h5>
                <div class="fav-list">
                    <button v-for="fav in favorites" :key="fav.id" @click="applyFavorite(fav)">
                        {{ fav.tag || fav.id }}
                    </button>
                </div>
            </div>
            <div class="fav-io">
                <button @click="exportFavorites">导出收藏</button>
                <label class="import-btn">
                    导入收藏
                    <input type="file" accept="application/json" @change="importFavorites" hidden />
                </label>
            </div>
        </div>

        <div class="results-section">
            <h4>推荐配色方案</h4>

            <div class="palette-options">
                <div v-for="(palette, index) in recommendedPalettes" :key="index" class="palette-option"
                    @click="selectPalette(palette)">
                    <div v-for="(color, i) in palette" :key="color" class="color-swatch" :style="{ backgroundColor: color }">
                        <span class="color-code">{{ color }}</span>
                        <button class="lock-btn" :class="{ locked: lockedSlots[i] }" @click.stop="toggleLock(i)">
                            {{ lockedSlots[i] ? '🔒' : '🔓' }}
                        </button>
                    </div>
                    <div class="palette-meta">
                        <span>{{ getPaletteType(palette.length) }}</span>
                        <span>{{ getMoodName(selectedMood) }}</span>
                    </div>
                </div>
            </div>

            <div v-if="selectedPalette" class="selected-palette">
                <h5>已选方案</h5>
                <ColorPalette :colors="selectedPalette" />
                <div class="palette-actions">
                    <button @click="copyPalette">复制颜色代码</button>
                    <button @click="downloadPalette">下载 JSON</button>
                    <button @click="downloadGpl">导出 GPL</button>
                    <button @click="downloadAco">导出 ACO</button>
                    <button @click="downloadAse">导出 ASE</button>
                </div>

                <div class="exporter">
                    <div class="exporter-row">
                        <label>Token 前缀</label>
                        <input type="text" v-model="tokenPrefix" placeholder="如: color" />
                    </div>
                    <TokenExporter :palette="selectedPalette" :prefix="tokenPrefix" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import chroma from 'chroma-js'
import ColorPalette from './ColorPalette.vue'
import TokenExporter from './TokenExporter.vue'

function compress(str) {
  try { return btoa(unescape(encodeURIComponent(str))) } catch { return '' }
}
function decompress(str) {
  try { return decodeURIComponent(escape(atob(str))) } catch { return '' }
}

export default {
    components: { ColorPalette, TokenExporter },
    data() {
        return {
            baseColor: '#3eaf7c',
            selectedStyle: 'analogous',
            selectedMood: 'professional',
            selectedPalette: null,
            recommendedPalettes: [],
            paletteSize: 4,
            lockedSlots: {},
            favorites: [],
            favoriteTag: '',
            tokenPrefix: 'color',
            moods: [
                { value: 'professional', label: '专业' },
                { value: 'energetic', label: '活力' },
                { value: 'calm', label: '平静' },
                { value: 'elegant', label: '优雅' },
                { value: 'playful', label: '活泼' }
            ]
        }
    },
    mounted() {
        this.initFromUrl()
        this.loadFavorites()
        this.generatePalettes()
    },
    methods: {
        validateColor(e) {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                this.onParamsChange()
            }
        },
        selectMood(mood) {
            this.selectedMood = mood
            this.onParamsChange()
        },
        toggleLock(index) {
            this.$set(this.lockedSlots, index, !this.lockedSlots[index])
        },
        getPaletteSize() {
            return Math.max(2, Math.min(5, this.paletteSize || 4))
        },
        onParamsChange() {
            this.generatePalettes()
            this.syncUrl()
        },
        generatePalettes() {
            const base = chroma(this.baseColor)
            const size = this.getPaletteSize()
            this.recommendedPalettes = []

            let palette
            switch (this.selectedStyle) {
                case 'monochromatic':
                    palette = this.generateMonochromatic(base, size)
                    break
                case 'analogous':
                    palette = this.generateAnalogous(base, size)
                    break
                case 'complementary':
                    palette = this.generateComplementary(base, size)
                    break
                case 'triadic':
                    palette = this.generateTriadic(base, size)
                    break
                case 'tetradic':
                    palette = this.generateTetradic(base, size)
                    break
            }

            palette = this.applyLocks(palette)
            this.recommendedPalettes.push(palette)
            this.adjustForMood()
        },
        applyLocks(palette) {
            const result = [...palette]
            Object.keys(this.lockedSlots).forEach(k => {
                const i = Number(k)
                if (this.lockedSlots[i] && this.selectedPalette && this.selectedPalette[i]) {
                    result[i] = this.selectedPalette[i]
                }
            })
            return result
        },
        generateMonochromatic(base, size) {
            const seq = [base.hex(), base.brighten(1).hex(), base.darken(0.5).hex(), base.desaturate(0.6).hex(), base.brighten(1.5).hex()]
            return seq.slice(0, size)
        },
        generateAnalogous(base, size) {
            const hue = base.get('hsl.h')
            const seq = [
                base.hex(),
                chroma.hsl((hue + 30) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue - 30 + 360) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue + 60) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue - 60 + 360) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()
            ]
            return seq.slice(0, size)
        },
        generateComplementary(base, size) {
            const hue = base.get('hsl.h')
            const comp = chroma.hsl((hue + 180) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()
            const seq = [base.hex(), comp, chroma(comp).brighten(0.7).hex(), chroma(base).darken(0.4).hex(), chroma(base).desaturate(0.5).hex()]
            return seq.slice(0, size)
        },
        generateTriadic(base, size) {
            const hue = base.get('hsl.h')
            const seq = [
                base.hex(),
                chroma.hsl((hue + 120) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue + 240) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                base.brighten(0.7).hex(),
                base.darken(0.4).hex()
            ]
            return seq.slice(0, size)
        },
        generateTetradic(base, size) {
            const hue = base.get('hsl.h')
            const seq = [
                base.hex(),
                chroma.hsl((hue + 90) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue + 180) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                chroma.hsl((hue + 270) % 360, base.get('hsl.s'), base.get('hsl.l')).hex(),
                base.desaturate(0.4).hex()
            ]
            return seq.slice(0, size)
        },
        adjustForMood() {
            this.recommendedPalettes = this.recommendedPalettes.map(palette => {
                return palette.map(color => {
                    const c = chroma(color)
                    switch (this.selectedMood) {
                        case 'professional':
                            return c.desaturate(0.3).hex()
                        case 'energetic':
                            return c.saturate(0.5).hex()
                        case 'calm':
                            return c.desaturate(0.2).darken(0.2).hex()
                        case 'elegant':
                            return c.darken(0.3).hex()
                        case 'playful':
                            return c.brighten(0.3).hex()
                        default:
                            return color
                    }
                })
            })
        },
        selectPalette(palette) {
            this.selectedPalette = palette
        },
        copyPalette() {
            const text = this.selectedPalette.join('\n')
            navigator.clipboard.writeText(text)
                .then(() => alert('配色方案已复制!'))
                .catch(err => console.error('复制失败:', err))
        },
        downloadPalette() {
            try {
                const json = JSON.stringify({ colors: this.selectedPalette }, null, 2)
                const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'recommended-palette.json'
                a.click()
                URL.revokeObjectURL(url)
            } catch (e) {
                console.error('下载方案失败:', e)
            }
        },
        downloadGpl() {
            try {
                const header = ['GIMP Palette', 'Name: Recommended', 'Columns: 0', '#']
                const lines = this.selectedPalette.map(hex => {
                    const [r, g, b] = chroma(hex).rgb()
                    return `${Math.round(r)}\t${Math.round(g)}\t${Math.round(b)}\t${hex}`
                })
                const content = header.concat(lines).join('\n')
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'recommended-palette.gpl'
                a.click()
                URL.revokeObjectURL(url)
            } catch (e) {
                console.error('导出 GPL 失败:', e)
            }
        },
        downloadAco() {
            try {
                const buffer = this.createAcoBuffer(this.selectedPalette)
                const blob = new Blob([buffer], { type: 'application/octet-stream' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'recommended-palette.aco'
                a.click()
                URL.revokeObjectURL(url)
            } catch (e) {
                console.error('导出 ACO 失败:', e)
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
        downloadAse() {
            try {
                const buffer = this.createAseBuffer(this.selectedPalette)
                const blob = new Blob([buffer], { type: 'application/octet-stream' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'recommended-palette.ase'
                a.click()
                URL.revokeObjectURL(url)
            } catch (e) {
                console.error('导出 ASE 失败:', e)
            }
        },
        createAseBuffer(hexColors) {
            const encoder = (s) => new TextEncoder().encode(s)
            const blocks = hexColors.map(hex => this._aseColorBlock(hex))
            const header = new ArrayBuffer(12)
            const hv = new DataView(header)
            const sig = encoder('ASEF')
            new Uint8Array(header).set(sig, 0)
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
            for (let i = 0; i < name.length; i++) nv.setUint16(2 + i * 2, name.charCodeAt(i), false)
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
        // URL 同步与收藏
        syncUrl() {
            const params = new URLSearchParams()
            params.set('base', this.baseColor.replace('#',''))
            params.set('style', this.selectedStyle)
            params.set('mood', this.selectedMood)
            params.set('n', String(this.getPaletteSize()))
            const url = `${location.pathname}?${params.toString()}${location.hash}`
            history.replaceState(null, '', url)
        },
        initFromUrl() {
            const hash = new URLSearchParams(location.hash.replace(/^#/,'?'))
            const s = hash.get('s')
            if (s) {
                const state = JSON.parse(decompress(s) || '{}')
                if (state.baseColor) this.baseColor = state.baseColor
                if (state.selectedStyle) this.selectedStyle = state.selectedStyle
                if (state.selectedMood) this.selectedMood = state.selectedMood
                if (state.n) this.paletteSize = Number(state.n)
                return
            }
            const qs = new URLSearchParams(location.search)
            const base = qs.get('base')
            const style = qs.get('style')
            const mood = qs.get('mood')
            const n = qs.get('n')
            if (base && /^([0-9a-fA-F]{6})$/.test(base)) this.baseColor = `#${base}`
            if (style) this.selectedStyle = style
            if (mood) this.selectedMood = mood
            if (n) this.paletteSize = Number(n)
        },
        shareUrl() {
            try {
                const state = JSON.stringify({ baseColor: this.baseColor, selectedStyle: this.selectedStyle, selectedMood: this.selectedMood, n: this.getPaletteSize() })
                const short = compress(state)
                const url = `${location.origin}${location.pathname}#s=${short}`
                navigator.clipboard.writeText(url).then(() => alert('已复制短链接'))
            } catch (e) { console.error('复制链接失败', e) }
        },
        loadFavorites() {
            try {
                const raw = localStorage.getItem('favorites')
                this.favorites = raw ? JSON.parse(raw) : []
            } catch { this.favorites = [] }
        },
        saveFavorite() {
            const id = `${Date.now()}`
            const fav = {
                id,
                tag: this.favoriteTag.trim(),
                baseColor: this.baseColor,
                selectedStyle: this.selectedStyle,
                selectedMood: this.selectedMood,
                paletteSize: this.getPaletteSize(),
                lockedSlots: this.lockedSlots,
                selectedPalette: this.selectedPalette || this.recommendedPalettes[0]
            }
            const list = [fav, ...this.favorites].slice(0, 50)
            this.favorites = list
            localStorage.setItem('favorites', JSON.stringify(list))
            this.favoriteTag = ''
            alert('已收藏')
        },
        applyFavorite(fav) {
            this.baseColor = fav.baseColor
            this.selectedStyle = fav.selectedStyle
            this.selectedMood = fav.selectedMood
            this.paletteSize = fav.paletteSize
            this.lockedSlots = fav.lockedSlots || {}
            this.selectedPalette = fav.selectedPalette
            this.onParamsChange()
        },
        getPaletteType(size) {
            const types = { 2: '双色', 3: '三色', 4: '四色', 5: '五色' }
            return types[size] || '多色'
        },
        getMoodName(value) {
            const mood = this.moods.find(m => m.value === value)
            return mood ? mood.label : ''
        },
        exportFavorites() {
            const json = JSON.stringify(this.favorites, null, 2)
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'favorites.json'
            a.click()
            URL.revokeObjectURL(url)
        },
        importFavorites(e) {
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
                try {
                    const list = JSON.parse(reader.result)
                    if (Array.isArray(list)) {
                        this.favorites = list
                        localStorage.setItem('favorites', JSON.stringify(list))
                        alert('收藏已导入')
                    }
                } catch (err) { alert('导入失败') }
            }
            reader.readAsText(file)
        },
        importFromSampler() {
            try {
                const raw = localStorage.getItem('palette_from_sampler')
                if (!raw) return alert('未检测到采样色板，请先在“渐变”页面采样')
                const arr = JSON.parse(raw)
                if (Array.isArray(arr) && arr.length >= 2) {
                    this.selectedPalette = arr
                    alert('已载入采样色板')
                }
            } catch {}
        }
    }
}
</script>

<style scoped>
.smart-recommender {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.color-input,
.style-selector,
.mood-selector,
.count-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.share-fav { display: flex; gap: .5rem; align-items: center; }
.favorites { margin-top: .5rem; }
.fav-list { display: flex; flex-wrap: wrap; gap: .5rem; }
.fav-io { display: flex; gap: .5rem; align-items: center; }
.import-btn { background: #3eaf7c; color: #fff; border-radius: 4px; padding: 6px 10px; cursor: pointer; }
.import-btn input { display: none; }

.color-input input[type="color"] {
    width: 100%;
    height: 40px;
}

.mood-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.mood-buttons button {
    padding: 0.5rem 1rem;
    border: 1px solid #eaecef;
    border-radius: 20px;
    background: white;
    cursor: pointer;
}

.mood-buttons button.active {
    background: #3eaf7c;
    color: white;
    border-color: #3eaf7c;
}

.palette-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.palette-option {
    border: 1px solid #eaecef;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s;
}

.palette-option:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.color-swatch {
    height: 60px;
    position: relative;
}

.color-code {
    position: absolute;
    bottom: 5px;
    left: 5px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.lock-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255,255,255,0.8);
    border: 1px solid #eaecef;
    border-radius: 12px;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 0.8rem;
}
.lock-btn.locked {
    background: #3eaf7c;
    color: #fff;
    border-color: #3eaf7c;
}

.palette-meta {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #718096;
}

.selected-palette {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eaecef;
}

.palette-actions { display: flex; gap: 1rem; margin-top: 1rem; }

.exporter { margin-top: 1rem; padding: 1rem; border: 1px solid #eaecef; border-radius: 8px; }
.exporter-row { display: flex; gap: .5rem; align-items: center; margin-bottom: .75rem; }

</style>
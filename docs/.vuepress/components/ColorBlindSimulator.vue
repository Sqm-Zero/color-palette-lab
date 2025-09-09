<template>
    <div class="color-blind-simulator">
        <h2>色盲模拟</h2>
        <div class="simulator-controls">
            <select v-model="selectedType">
                <option value="normal">正常视觉</option>
                <option value="protanopia">红色盲 (Protanopia)</option>
                <option value="deuteranopia">绿色盲 (Deuteranopia)</option>
                <option value="tritanopia">蓝色盲 (Tritanopia)</option>
            </select>
        </div>

        <div class="simulator-results">
            <div class="color-grid">
                <div v-for="(color, index) in palette" :key="index" class="color-box"
                    :style="{ backgroundColor: applyColorBlindness(color) }">
                    <span class="color-code">{{ color }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ColorBlind } from '@silvermine/colorblind'

export default {
    data() {
        return {
            selectedType: 'normal',
            palette: [
                '#FF0000', '#00FF00', '#0000FF',
                '#FFFF00', '#FF00FF', '#00FFFF',
                '#FFA500', '#800080', '#008000'
            ]
        }
    },
    methods: {
        applyColorBlindness(color) {
            if (this.selectedType === 'normal') return color

            const converter = new ColorBlind()
            const rgb = this.hexToRgb(color)

            if (!rgb) return color

            let converted
            switch (this.selectedType) {
                case 'protanopia':
                    converted = converter.protanopia(rgb.r, rgb.g, rgb.b)
                    break
                case 'deuteranopia':
                    converted = converter.deuteranopia(rgb.r, rgb.g, rgb.b)
                    break
                case 'tritanopia':
                    converted = converter.tritanopia(rgb.r, rgb.g, rgb.b)
                    break
                default:
                    return color
            }

            return this.rgbToHex(converted.r, converted.g, converted.b)
        },
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null
        },
        rgbToHex(r, g, b) {
            return `#${[r, g, b].map(x => {
                const hex = x.toString(16)
                return hex.length === 1 ? '0' + hex : hex
            }).join('')}`
        }
    }
}
</script>

<style scoped>
.color-blind-simulator {
    padding: 1.5rem;
    border: 1px solid #eaecef;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.simulator-controls select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.color-box {
    height: 80px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 5px;
    border-radius: 4px;
}

.color-code {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
}
</style>
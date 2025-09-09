<template>
    <div class="image-color-extractor">
        <h2>图片色彩提取</h2>
        <div class="upload-area" @click="triggerFileInput">
            <input type="file" ref="fileInput" accept="image/*" @change="handleFileUpload" style="display: none">
            <p v-if="!imageUrl">点击上传图片或拖放到此区域</p>
            <img v-else :src="imageUrl" alt="上传的图片">
        </div>

        <div v-if="colors.length > 0" class="extracted-colors">
            <h3>提取的色彩</h3>
            <div class="color-grid">
                <div v-for="(color, index) in colors" :key="index" class="color-box" :style="{ backgroundColor: color }"
                    @click="copyToClipboard(color)">
                    <span class="color-code">{{ color }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            imageUrl: '',
            colors: []
        }
    },
    methods: {
        triggerFileInput() {
            this.$refs.fileInput.click()
        },
        handleFileUpload(e) {
            const file = e.target.files[0]
            if (!file) return

            this.imageUrl = URL.createObjectURL(file)
            this.extractColors(file)
        },
        extractColors(file) {
            // 这里是简化的实现，实际应用中可以使用类似color-thief的库
            // 这里我们模拟提取5种颜色
            this.colors = [
                '#FF5733', '#33FF57', '#3357FF',
                '#F3FF33', '#FF33F3'
            ]

            // 实际实现示例:
            // const img = new Image()
            // img.onload = () => {
            //   const colorThief = new ColorThief()
            //   this.colors = colorThief.getPalette(img, 5).map(c => 
            //     `#${c.map(n => n.toString(16).padStart(2, '0')).join('')}`
            //   )
            // }
            // img.src = URL.createObjectURL(file)
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    alert(`已复制: ${text}`)
                })
                .catch(err => {
                    console.error('复制失败:', err)
                })
        }
    }
}
</script>

<style scoped>
.image-color-extractor {
    padding: 1.5rem;
    border: 1px solid #eaecef;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.upload-area {
    border: 2px dashed #ddd;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    margin-bottom: 1rem;
    border-radius: 8px;
}

.upload-area:hover {
    border-color: #3eaf7c;
}

.upload-area img {
    max-width: 100%;
    max-height: 300px;
    display: block;
    margin: 0 auto;
}

.extracted-colors {
    margin-top: 1.5rem;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 1rem;
}

.color-box {
    height: 60px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
}

.color-box:hover {
    transform: scale(1.05);
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
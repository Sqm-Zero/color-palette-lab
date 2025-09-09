<template>
    <div class="contrast-checker">
      <h2>对比度检测器</h2>
      <div class="color-inputs">
        <div>
          <label>前景色</label>
          <input type="color" v-model="foreground" @input="calculateContrast">
          <input type="text" v-model="foreground" @input="updateColor">
        </div>
        <div>
          <label>背景色</label>
          <input type="color" v-model="background" @input="calculateContrast">
          <input type="text" v-model="background" @input="updateColor">
        </div>
      </div>
      
      <div class="contrast-result">
        <h3>对比度: {{ contrastRatio }}:1</h3>
        <p>评级: {{ contrastRating }} ({{ ratingDescription }})</p>
      </div>
      
      <div class="example-text" :style="exampleStyle">
        示例文字 - 这段文字展示了当前颜色组合的可读性效果
      </div>
    </div>
  </template>
  
  <script>
  import chroma from 'chroma-js'
  
  export default {
    data() {
      return {
        foreground: '#000000',
        background: '#ffffff',
        contrastRatio: 21,
        contrastRating: 'AAA级',
        ratingDescription: '优秀'
      }
    },
    computed: {
      exampleStyle() {
        return {
          color: this.foreground,
          backgroundColor: this.background,
          padding: '1rem',
          borderRadius: '4px',
          margin: '1rem 0'
        }
      }
    },
    methods: {
      calculateContrast() {
        const contrast = chroma.contrast(this.foreground, this.background)
        this.contrastRatio = contrast.toFixed(2)
        
        if (contrast >= 7) {
          this.contrastRating = 'AAA级'
          this.ratingDescription = '优秀'
        } else if (contrast >= 4.5) {
          this.contrastRating = 'AA级'
          this.ratingDescription = '良好'
        } else {
          this.contrastRating = '不合格'
          this.ratingDescription = '可读性差'
        }
      },
      updateColor(e) {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          if (e.target.previousElementSibling) {
            e.target.previousElementSibling.value = e.target.value
          }
          this.calculateContrast()
        }
      }
    },
    mounted() {
      this.calculateContrast()
    }
  }
  </script>
  
  <style scoped>
  .contrast-checker {
    padding: 1.5rem;
    border: 1px solid #eaecef;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .color-inputs {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .color-inputs > div {
    flex: 1;
  }
  
  .color-inputs input[type="color"] {
    width: 50px;
    height: 30px;
    vertical-align: middle;
    margin-right: 10px;
  }
  
  .color-inputs input[type="text"] {
    width: calc(100% - 70px);
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .contrast-result {
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }
  
  .example-text {
    font-size: 1.2rem;
    font-weight: bold;
  }
  </style>
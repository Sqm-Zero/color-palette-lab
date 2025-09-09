module.exports = {
  title: 'Color Palette Lab',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '知识库', items: [
        { text: '色彩理论', link: '/color-theory' },
        { text: '命名规范', link: '/naming-guidelines' },
        { text: '案例实战', link: '/case-study' }
      ] },
      { text: '配色方案', items: [
        { text: '双色', link: '/color-palettes/two-colors' },
        { text: '三色', link: '/color-palettes/three-colors' },
        { text: '四色', link: '/color-palettes/four-colors' }
      ] },
      { text: '渐变', link: '/gradients' },
      { text: '工具', link: '/advanced-tools' },
      { text: '资源', link: '/resources' }
    ],
    sidebar: false
  }
}
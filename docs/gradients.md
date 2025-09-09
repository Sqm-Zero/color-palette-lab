# 渐变素材库

> 提供常用线性/径向渐变，点击卡片即可复制 CSS。

## 线性渐变（Linear）

<GradientCard css="linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)" />
<GradientCard css="linear-gradient(90deg, #8EC5FC 0%, #E0C3FC 100%)" />
<GradientCard css="linear-gradient(120deg, #F6D365 0%, #FDA085 100%)" />
<GradientCard css="linear-gradient(135deg, #5EFCE8 0%, #736EFE 100%)" />

## 径向渐变（Radial）

<GradientCard css="radial-gradient(circle at 30% 30%, #FFF1EB, #ACE0F9)" />
<GradientCard css="radial-gradient(55% 75% at 50% 50%, #D4FC79 0%, #96E6A1 100%)" />

## 叠加与玻璃态（Glassmorphism）

<GradientCard css="linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.05))" />

> 搭配 backdrop-filter: blur(10px) 使用可实现玻璃拟物效果。

## 使用建议
- 文字上使用渐变时，保证与背景有足够对比；或仅用于背景。
- 移动端注意 GPU 合成开销，避免大面积多重渐变叠加。
- 与品牌主色结合：以主色为起点色，终点色做明度或相邻色偏移。

---

## 从渐变采样生成色板

<GradientSampler />

- 输入任意 CSS 渐变，设置采样数量，快速生成色卡用于 UI。
- 点击“导入推荐器”，再到“高级色彩工具”中点击“从采样导入”载入方案。

---

## 可视化编辑器

<GradientEditor />

- 可拖动调整角度与色标，实时生成 CSS；支持复制与用于导出 SVG。

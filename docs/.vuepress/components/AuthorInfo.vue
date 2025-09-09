<template>
    <div class="author-info">
        <div class="header">
            <img class="avatar" :src="avatarSrc" alt="avatar" />
            <div>
                <h3>作者信息</h3>
                <p><strong>设计开发者</strong>: kkl-sqm</p>
            </div>
        </div>
        <p><strong>身份</strong>:</p>
        <ul>
            <li>色彩搭配爱好者</li>
            <li><span style="text-decoration:line-through">全栈开发工程师</span><span>（我是牛马）</span></li>
            <li>AI应用研究者</li>
        </ul>
        <p><strong>联系方式</strong>:</p>
        <div class="contact">
            <a :href="`mailto:${email}`">📧 {{ email }}</a>
            <button class="copy" @click="copyEmail">复制邮箱</button>
        </div>
        <div class="social">
            <a v-if="links.github" :href="links.github" target="_blank">GitHub</a>
            <a v-if="links.twitter" :href="links.twitter" target="_blank">Twitter</a>
            <a v-if="links.weibo" :href="links.weibo" target="_blank">Weibo</a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AuthorInfo',
    data() {
        return {
            email: '1789714718@qq.com',
            links: {
                github: '',
                twitter: '',
                weibo: ''
            }
        }
    },
    computed: {
        avatarSrc() {
            return 'https://files.catbox.moe/ej1gq0'
        }
    },
    methods: {
        copyEmail() {
            navigator.clipboard.writeText(this.email).then(() => alert('已复制邮箱'))
        }
    }
}
</script>

<style scoped>
.author-info {
    background-color: #f8f8f8;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
    border-left: 4px solid #3eaf7c;
}
.header { display: flex; gap: 1rem; align-items: center; }
.avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #eaecef; }
.author-info h3 { margin: 0; color: #2c3e50; }
.author-info ul { padding-left: 1.5rem; }
.author-info a { color: #3eaf7c; text-decoration: none; }
.author-info a:hover { text-decoration: underline; }
.contact { display: flex; gap: .75rem; align-items: center; margin: .5rem 0; }
.copy { background: #3eaf7c; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
.social { display: flex; gap: .75rem; margin-top: .25rem; }
.cattle-and-horses { text-decoration:line-through }
</style>
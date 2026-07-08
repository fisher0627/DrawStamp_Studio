<template>
  <InfoPageShell
    title="服务条款"
    kicker="Terms File"
    description="DrawStamp Studio 是浏览器本地电子印章工作台。使用前请确认场景合法、内容真实、责任清晰。"
    tone="legal"
  >
    <template #aside>
      <div class="terms-aside">
        <span>最后更新</span>
        <strong>{{ lastUpdated }}</strong>
        <p>禁止用于伪造公文、合同、票据或任何违法用途。</p>
      </div>
    </template>

    <section class="terms-warning">
      <strong>使用边界</strong>
      <p>本工具适合学习、测试、设计预览和合规授权场景。您应自行确认使用行为符合所在地法律法规。</p>
    </section>

    <section class="terms-list">
      <article>
        <h2>1. 接受条款</h2>
        <p>欢迎使用 DrawStamp Studio。通过访问和使用本网站，您同意遵守本服务条款。如果您不同意这些条款，请不要使用本服务。</p>
      </article>

      <article>
        <h2>2. 服务描述</h2>
        <p>DrawStamp Studio 是一个在线电子印章工作台，允许用户在浏览器本地创建、编辑、提取和导出电子印章图片。本服务仅供合法用途使用。</p>
      </article>

      <article>
        <h2>3. 使用限制</h2>
        <ul>
          <li>不得将本服务用于任何非法目的或违反任何适用法律法规。</li>
          <li>不得使用本服务创建用于欺诈、伪造或其他非法活动的印章。</li>
          <li>不得尝试未经授权访问本服务的任何部分或相关系统。</li>
          <li>不得干扰或破坏本服务的正常运行。</li>
        </ul>
      </article>

      <article>
        <h2>4. 免责声明</h2>
        <p>本服务按现状提供，不提供任何明示或暗示的保证。因违法使用本服务造成的任何法律责任和损失，需自行承担，与本服务无关。</p>
      </article>

      <article>
        <h2>5. 知识产权</h2>
        <p>本网站的界面、代码、文本、图形和相关素材受版权和开源许可保护。项目源码以仓库中声明的开源许可证为准。</p>
        <p>您在浏览器本地创建、导入或提取的印章内容由您自行负责。DrawStamp Studio 不会主动上传或保存您的印章图片和模板内容。</p>
      </article>

      <article>
        <h2>6. 用户内容</h2>
        <p>您对使用本服务创建的所有内容负责，并保证您拥有或有权使用相关内容，且不侵犯第三方权利。</p>
      </article>

      <article>
        <h2>7. 服务变更和终止</h2>
        <p>我们保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
      </article>

      <article>
        <h2>8. 责任限制</h2>
        <p>在法律允许的最大范围内，我们不对因使用或无法使用本服务而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。</p>
      </article>

      <article>
        <h2>9. 赔偿</h2>
        <p>您同意赔偿并使我们免受因您违反本服务条款或使用本服务而产生的任何索赔、损失、责任和费用。</p>
      </article>

      <article>
        <h2>10. 适用法律与条款修改</h2>
        <p>本服务条款受适用法律管辖。我们保留修改本服务条款的权利，修改后的条款将在本页面发布。</p>
      </article>

      <article>
        <h2>11. 联系方式</h2>
        <p>如果您对本服务条款有任何疑问，请通过 <RouterLink to="/contact">联系反馈</RouterLink> 页面与我们联系，也可以发送邮件至 fisherztz@gmail.com。</p>
      </article>
    </section>
  </InfoPageShell>
</template>

<script setup lang="ts">
import InfoPageShell from './InfoPageShell.vue'

const lastUpdated = '2026年7月9日'
</script>

<style scoped>
.terms-aside,
.terms-warning,
.terms-list article {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.terms-aside {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.terms-aside span {
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.terms-aside strong {
  color: var(--studio-ink);
  font-size: 22px;
}

.terms-aside p {
  margin: 0;
  color: var(--studio-muted);
  line-height: 1.7;
}

.terms-warning {
  padding: 22px;
  background:
    linear-gradient(135deg, rgba(255, 0, 21, 0.06), rgba(255, 255, 255, 0.82)),
    #fff;
  border-color: rgba(255, 0, 21, 0.18);
}

.terms-warning strong {
  display: block;
  margin-bottom: 8px;
  color: var(--studio-stamp-red);
}

.terms-warning p,
.terms-list p,
.terms-list li {
  color: var(--studio-muted);
  line-height: 1.8;
}

.terms-warning p,
.terms-list p {
  margin: 0;
}

.terms-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.terms-list article {
  padding: 22px;
}

.terms-list h2 {
  margin: 0 0 10px;
  color: var(--studio-ink);
  font-size: 20px;
}

.terms-list ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
}

.terms-list a {
  color: var(--studio-tool-blue);
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 820px) {
  .terms-list {
    grid-template-columns: 1fr;
  }
}
</style>

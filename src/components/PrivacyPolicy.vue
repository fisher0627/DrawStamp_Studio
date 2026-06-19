<template>
  <InfoPageShell
    title="隐私政策"
    kicker="Privacy File"
    description="DrawStamp Studio 的核心编辑、提取和导出流程都在浏览器本地完成。这个页面说明哪些信息会留在本地，哪些服务用于站点运行。"
    tone="legal"
  >
    <template #aside>
      <div class="document-meta">
        <span>最后更新</span>
        <strong>{{ lastUpdated }}</strong>
      </div>
    </template>

    <section class="policy-summary">
      <article>
        <span>本地草稿</span>
        <p>印章模板、草稿和编辑设置保存在您的浏览器设备上。</p>
      </article>
      <article>
        <span>不上传印章</span>
        <p>核心印章图片处理不需要上传到 DrawStamp Studio 服务器。</p>
      </article>
      <article>
        <span>访问统计</span>
        <p>站点可能使用基础访问分析来判断页面是否可用。</p>
      </article>
    </section>

    <section class="document-list">
      <article>
        <h2>1. 信息收集</h2>
        <p>DrawStamp Studio 致力于保护您的隐私。本隐私政策说明了我们如何收集、使用和保护与网站访问相关的信息。</p>
        <ul>
          <li><strong>访问分析数据：</strong>当您访问网站时，站点统计服务可能会记录浏览器类型、访问时间、页面访问路径等基础访问数据，用于了解页面使用情况。</li>
          <li><strong>本地存储：</strong>为了提供更好的用户体验，我们使用浏览器本地存储来保存您的印章模板和设置。这些数据仅存储在您的设备上，我们无法访问。</li>
        </ul>
      </article>

      <article>
        <h2>2. 信息使用</h2>
        <p>我们使用收集的信息用于提供和改进服务、分析网站使用情况、确保网站安全和防止欺诈。</p>
      </article>

      <article>
        <h2>3. 第三方服务</h2>
        <ul>
          <li><strong>Umami Analytics：</strong>用于统计页面访问情况，帮助我们了解功能页面是否正常被访问和使用。</li>
          <li><strong>Cloudflare Pages：</strong>用于托管静态网站，并提供基础 CDN、安全和访问日志能力。</li>
        </ul>
      </article>

      <article>
        <h2>4. Cookies 与本地数据</h2>
        <p>DrawStamp Studio 的核心编辑流程不依赖账号登录。浏览器本地草稿、模板和设置会保存在您的设备上，您可以通过浏览器设置清理这些本地数据。</p>
      </article>

      <article>
        <h2>5. 数据安全</h2>
        <p>我们采取合理的安全措施来保护您的个人信息。所有印章数据处理都在您的浏览器本地完成，我们不会将您的印章数据上传到服务器。</p>
      </article>

      <article>
        <h2>6. 您的权利</h2>
        <p>您可以访问、更正或删除与您相关的信息，也可以选择退出某些数据收集活动。浏览器本地数据可通过浏览器设置自行清理。</p>
      </article>

      <article>
        <h2>7. 儿童隐私</h2>
        <p>我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。</p>
      </article>

      <article>
        <h2>8. 政策变更</h2>
        <p>我们可能会不时更新本隐私政策。任何变更都会在本页面上发布，并更新最后更新日期。</p>
      </article>

      <article>
        <h2>9. 联系方式</h2>
        <p>如果您对本隐私政策有任何疑问，请通过 <RouterLink to="/contact">联系反馈</RouterLink> 页面与我们联系，也可以发送邮件至 fisherztz@gmail.com。</p>
      </article>
    </section>
  </InfoPageShell>
</template>

<script setup lang="ts">
import InfoPageShell from './InfoPageShell.vue'

const lastUpdated = '2026年6月19日'
</script>

<style scoped>
.document-meta,
.policy-summary article,
.document-list article {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.document-meta {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.document-meta span,
.policy-summary span {
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.document-meta strong {
  color: var(--studio-ink);
  font-size: 22px;
}

.policy-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.policy-summary article {
  padding: 18px;
}

.policy-summary p,
.document-list p,
.document-list li {
  color: var(--studio-muted);
  line-height: 1.8;
}

.policy-summary p {
  margin: 10px 0 0;
}

.document-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.document-list article {
  padding: 22px;
}

.document-list h2 {
  margin: 0 0 10px;
  color: var(--studio-ink);
  font-size: 20px;
}

.document-list p {
  margin: 0;
}

.document-list ul {
  display: grid;
  gap: 10px;
  margin: 12px 0 0;
  padding-left: 20px;
}

.document-list a {
  color: var(--studio-tool-blue);
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 800px) {
  .policy-summary {
    grid-template-columns: 1fr;
  }
}
</style>

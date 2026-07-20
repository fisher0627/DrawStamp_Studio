export interface LegalSection {
  title: string
  paragraphs?: string[]
  items?: string[]
  contact?: boolean
}

interface LegalPageContent {
  title: string
  kicker: string
  description: string
  lastUpdatedLabel: string
  lastUpdated: string
  aside: Array<{ label: string; text: string }>
  highlightTitle?: string
  highlightText?: string
  sections: LegalSection[]
  contactPrefix: string
  contactLink: string
  contactSuffix: string
}

export const legalContent: Record<'zh' | 'en', { privacy: LegalPageContent; terms: LegalPageContent }> = {
  zh: {
    privacy: {
      title: '隐私政策',
      kicker: '数据处理说明',
      description: 'DrawStamp Studio 的核心编辑、提取和导出流程都在浏览器本地完成。本页说明哪些信息会留在本地，哪些服务用于站点运行。',
      lastUpdatedLabel: '最后更新',
      lastUpdated: '2026 年 7 月 20 日',
      aside: [
        { label: '本地草稿', text: '印章模板、草稿和编辑设置保存在您的浏览器设备上。' },
        { label: '不上传印章', text: '核心印章图片处理不需要上传到 DrawStamp Studio 服务器。' },
        { label: '访问统计', text: '站点可能使用基础访问分析来判断页面是否可用。' }
      ],
      sections: [
        {
          title: '1. 信息收集',
          paragraphs: ['DrawStamp Studio 致力于保护您的隐私。本隐私政策说明我们如何处理与网站访问相关的信息。'],
          items: [
            '访问分析数据：站点统计服务可能会记录浏览器类型、访问时间和页面路径等基础数据，用于了解页面使用情况。',
            '本地存储：印章模板、草稿、语言选择和编辑设置保存在您的设备上，DrawStamp Studio 无法访问这些本地内容。'
          ]
        },
        { title: '2. 信息使用', paragraphs: ['我们仅将访问数据用于运行和改进站点、分析页面使用情况以及保护站点安全。'] },
        {
          title: '3. 第三方服务',
          items: [
            'Umami Analytics：用于统计页面访问情况，帮助我们了解功能页面是否正常被访问和使用。',
            'Cloudflare Pages：用于托管静态网站，并提供基础 CDN、安全和访问日志能力。'
          ]
        },
        { title: '4. Cookies 与本地数据', paragraphs: ['核心编辑流程不依赖账号登录。您可通过浏览器设置清理本地草稿、模板、语言选择和其他本地数据。'] },
        { title: '5. 数据安全', paragraphs: ['印章绘制、图片提取和导出都在您的浏览器本地完成。我们不会主动上传您的印章图片或模板。'] },
        { title: '6. 您的权利', paragraphs: ['您可以通过浏览器设置查看或删除本地数据，也可使用浏览器或隐私工具限制访问分析。'] },
        { title: '7. 儿童隐私', paragraphs: ['本服务不面向 13 岁以下儿童，我们不会故意收集 13 岁以下儿童的个人信息。'] },
        { title: '8. 政策变更', paragraphs: ['我们可能会随站点功能调整更新本政策。任何变更都会在本页发布，并更新最后修订日期。'] },
        { title: '9. 联系方式', contact: true }
      ],
      contactPrefix: '如果您对本隐私政策有疑问，请通过',
      contactLink: '联系反馈',
      contactSuffix: '页面与我们联系，也可发送邮件至 fisherztz@gmail.com。'
    },
    terms: {
      title: '服务条款',
      kicker: '使用边界与责任',
      description: 'DrawStamp Studio 是浏览器本地电子印章工作台。使用前请确认场景合法、内容真实、责任清晰。',
      lastUpdatedLabel: '最后更新',
      lastUpdated: '2026 年 7 月 20 日',
      aside: [{ label: '重要提示', text: '禁止用于伪造公文、合同、票据或任何违法用途。' }],
      highlightTitle: '使用边界',
      highlightText: '本工具适合学习、测试、设计预览和合规授权场景。您应自行确认使用行为符合所在地法律法规。',
      sections: [
        { title: '1. 接受条款', paragraphs: ['通过访问和使用 DrawStamp Studio，您同意遵守本服务条款。如果您不同意，请停止使用本服务。'] },
        { title: '2. 服务描述', paragraphs: ['DrawStamp Studio 允许用户在浏览器本地创建、编辑、提取和导出电子印章图片。本服务仅供合法用途使用。'] },
        {
          title: '3. 使用限制',
          items: [
            '不得将本服务用于任何非法目的或违反任何适用法律法规。',
            '不得使用本服务创建用于欺诈、伪造或其他非法活动的印章。',
            '不得尝试未经授权访问本服务的任何部分或相关系统。',
            '不得干扰或破坏本服务的正常运行。'
          ]
        },
        { title: '4. 免责声明', paragraphs: ['本服务按现状提供，不提供任何明示或暗示保证。因违法或不当使用造成的责任和损失由使用者承担。'] },
        { title: '5. 知识产权', paragraphs: ['站点界面、代码、文本、图形和相关素材受版权和开源许可保护，项目源码以仓库中声明的开源许可证为准。', '您在浏览器本地创建、导入或提取的印章内容由您自行负责。DrawStamp Studio 不会主动上传或保存您的印章图片和模板内容。'] },
        { title: '6. 用户内容', paragraphs: ['您对使用本服务创建的所有内容负责，并保证您拥有或有权使用相关内容，且不侵犯第三方权利。'] },
        { title: '7. 服务变更和终止', paragraphs: ['我们保留随时修改、暂停或终止服务的权利，恕不另行通知。'] },
        { title: '8. 责任限制', paragraphs: ['在法律允许的最大范围内，我们不对因使用或无法使用本服务而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。'] },
        { title: '9. 赔偿', paragraphs: ['您同意承担因违反本服务条款或不当使用本服务而产生的索赔、损失、责任和费用。'] },
        { title: '10. 适用法律与条款修改', paragraphs: ['本服务条款受适用法律管辖。我们保留修改条款的权利，修改后的条款将在本页发布。'] },
        { title: '11. 联系方式', contact: true }
      ],
      contactPrefix: '如果您对本服务条款有疑问，请通过',
      contactLink: '联系反馈',
      contactSuffix: '页面与我们联系，也可发送邮件至 fisherztz@gmail.com。'
    }
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      kicker: 'Data Processing',
      description: 'DrawStamp Studio performs its core editing, extraction, and export workflows locally in your browser. This page explains what stays on your device and which services support the website.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 20, 2026',
      aside: [
        { label: 'Local drafts', text: 'Stamp templates, drafts, and editor settings are stored on your device.' },
        { label: 'No stamp uploads', text: 'Core stamp image processing does not require uploads to a DrawStamp Studio server.' },
        { label: 'Site analytics', text: 'Basic analytics may be used to understand whether pages and features are working.' }
      ],
      sections: [
        { title: '1. Information we process', paragraphs: ['DrawStamp Studio is designed to protect your privacy. This policy explains how information related to website visits is handled.'], items: ['Analytics data: site analytics may record basic information such as browser type, visit time, and page path to help us understand site usage.', 'Local storage: stamp templates, drafts, language preferences, and editor settings are stored on your device. DrawStamp Studio cannot access this local content.'] },
        { title: '2. How information is used', paragraphs: ['Visit data is used only to operate and improve the site, understand page usage, and protect site security.'] },
        { title: '3. Third-party services', items: ['Umami Analytics: provides basic page-visit analytics so we can understand whether site features are being reached and used.', 'Cloudflare Pages: hosts the static website and provides CDN, security, and basic access-log services.'] },
        { title: '4. Cookies and local data', paragraphs: ['The core editor does not require an account. You can clear local drafts, templates, language preferences, and other local data through your browser settings.'] },
        { title: '5. Data security', paragraphs: ['Stamp drawing, image extraction, and export run locally in your browser. We do not actively upload your stamp images or templates.'] },
        { title: '6. Your choices', paragraphs: ['You can view or delete local data through your browser settings and use browser or privacy tools to limit analytics.'] },
        { title: "7. Children's privacy", paragraphs: ['The service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.'] },
        { title: '8. Policy changes', paragraphs: ['We may update this policy as the site changes. Updates will be published on this page with a revised date.'] },
        { title: '9. Contact', contact: true }
      ],
      contactPrefix: 'If you have questions about this Privacy Policy, use the',
      contactLink: 'Contact page',
      contactSuffix: 'or email fisherztz@gmail.com.'
    },
    terms: {
      title: 'Terms of Service',
      kicker: 'Use Boundaries and Responsibility',
      description: 'DrawStamp Studio is a browser-local electronic stamp workspace. Before using it, make sure your use is lawful, the content is accurate, and responsibility is clear.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 20, 2026',
      aside: [{ label: 'Important notice', text: 'Do not use this tool to forge official documents, contracts, invoices, or for any unlawful purpose.' }],
      highlightTitle: 'Acceptable use',
      highlightText: 'This tool is intended for learning, testing, design previews, and legally authorized use. You are responsible for complying with the laws that apply where you live.',
      sections: [
        { title: '1. Acceptance', paragraphs: ['By accessing or using DrawStamp Studio, you agree to these Terms of Service. If you do not agree, do not use the service.'] },
        { title: '2. Service description', paragraphs: ['DrawStamp Studio lets users create, edit, extract, and export electronic stamp images locally in a browser. The service is provided only for lawful use.'] },
        { title: '3. Restrictions', items: ['Do not use the service for unlawful purposes or in violation of applicable law.', 'Do not create stamps for fraud, forgery, or other illegal activity.', 'Do not attempt unauthorized access to the service or related systems.', 'Do not interfere with or disrupt the service.'] },
        { title: '4. Disclaimer', paragraphs: ['The service is provided as is, without express or implied warranties. You are responsible for liability or loss caused by unlawful or improper use.'] },
        { title: '5. Intellectual property', paragraphs: ['The interface, code, text, graphics, and related materials are protected by copyright and open-source licenses. The repository license governs the source code.', 'You are responsible for stamp content you create, import, or extract locally. DrawStamp Studio does not actively upload or store your stamp images or templates.'] },
        { title: '6. User content', paragraphs: ['You are responsible for content created with the service and confirm that you own or are authorized to use it without infringing third-party rights.'] },
        { title: '7. Changes and termination', paragraphs: ['We may modify, suspend, or discontinue the service at any time without prior notice.'] },
        { title: '8. Limitation of liability', paragraphs: ['To the fullest extent permitted by law, we are not liable for direct, indirect, incidental, special, or consequential damages resulting from use of, or inability to use, the service.'] },
        { title: '9. Indemnification', paragraphs: ['You agree to cover claims, losses, liabilities, and expenses arising from your violation of these terms or improper use of the service.'] },
        { title: '10. Governing law and changes', paragraphs: ['These terms are governed by applicable law. Revised terms will be published on this page.'] },
        { title: '11. Contact', contact: true }
      ],
      contactPrefix: 'If you have questions about these Terms of Service, use the',
      contactLink: 'Contact page',
      contactSuffix: 'or email fisherztz@gmail.com.'
    }
  }
}

export const studioMessages = {
  zh: {
    studio: {
      language: {
        label: '语言',
        switcher: '切换界面语言',
        zh: '中文',
        en: 'English'
      },
      nav: {
        aria: '站点说明页面导航',
        homeAlt: 'DrawStamp Studio 首页',
        dossier: '项目档案',
        about: '关于项目',
        privacy: '隐私政策',
        terms: '服务条款',
        contact: '联系反馈'
      },
      editor: {
        previewAlt: '导出预览',
        fileFormat: '文件格式',
        recommended: '推荐',
        exportScale: '导出倍率',
        pngWhiteBackground: 'PNG 使用白色背景',
        filename: '文件名',
        autoExtension: '自动补充扩展名',
        filenamePlaceholder: '自动使用公司名',
        defaultFilename: '电子印章',
        stampFallback: '印章',
        untitledDraft: '未命名印章',
        moreSizeSettings: '更多尺寸设置',
        downloadFormat: '下载 {format}',
        transparentBackground: '透明背景',
        whiteBackground: '白色背景',
        vectorExport: '矢量导出',
        jpegQuality: 'JPEG 质量 {quality}%',
        formats: {
          pngDesc: '透明背景，适合文档和打印',
          pngTip: '最常用',
          svgDesc: '矢量格式，适合设计软件',
          svgTip: '可放大',
          jpegDesc: '白底图片，适合普通分享',
          jpegTip: '体积小'
        },
        draft: {
          saving: '保存中',
          unsaved: '未保存',
          restored: '已恢复',
          autoSave: '自动保存',
          savedAt: '已保存 {time}',
          todayAt: '今天 {time}'
        },
        selection: {
          selected: '已选中：{name}',
          basic: '基础设置',
          company: '公司文字',
          stampType: '印章类型',
          code: '编码',
          taxNumber: '中间文字',
          star: '中心图形',
          circle: '内圆',
          image: '图片',
          svg: 'SVG 图形',
          aging: '做旧效果',
          roughEdge: '毛边效果',
          security: '防伪纹路',
          line: '线条',
          element: '元素'
        },
        backgrounds: {
          grid: '淡网格背景',
          paper: '纸张白底',
          checker: '透明棋盘格'
        },
        templateCategories: {
          all: '全部',
          general: '通用',
          finance: '财务',
          business: '业务'
        },
        templateCategoryAria: '模板分类',
        templates: {
          contract: { name: '合同专用章', desc: '圆章 · 公司名 · 五角星', badge: '常用' },
          official: { name: '公司公章', desc: '圆章 · 标准公章布局', badge: '标准' },
          finance: { name: '财务专用章', desc: '椭圆章 · 内圈 · 编码', badge: '财务' },
          invoice: { name: '发票专用章', desc: '椭圆章 · 中间文字 · 编码', badge: '税务' },
          receipt: { name: '收讫专用章', desc: '椭圆章 · 收款确认', badge: '收款' },
          business: { name: '业务专用章', desc: '圆章 · 业务办理', badge: '业务' },
          quotation: { name: '报价专用章', desc: '椭圆章 · 报价文件', badge: '报价' },
          clean: { name: '干净空白章', desc: '重置为清爽基础版', badge: '空白' }
        },
        font: {
          label: '字体',
          placeholder: '手动输入字体名',
          preview: '预览',
          previewText: '印章文字 012345'
        },
        empty: {
          text: '暂无文字元素',
          figure: '暂无图形元素',
          effect: '暂无效果元素'
        },
        properties: {
          size: '尺寸',
          shape: '形状',
          elements: '元素',
          color: '印章色',
          categoryAria: '属性设置分类',
          basicTab: '基础设置',
          advancedTab: '高级设置',
          currentObject: '当前对象参数',
          backToBasic: '回到基础',
          custom: '自定义',
          customColor: '自定义色',
          object: '对象'
        }
      },
      seoContent: {
        title: '在线电子印章生成与图片提取工具',
        intro: 'DrawStamp Studio 是一款免费的浏览器本地电子印章工作台，可创建圆章、椭圆章、合同专用章、财务专用章和发票专用章，也可从扫描件或照片中提取红色印章。',
        featuresAria: '核心特性',
        features: {
          local: '本地处理',
          transparent: '透明 PNG',
          formats: 'SVG / JPEG',
          drafts: '模板草稿'
        },
        cards: {
          createTitle: '在线印章生成器',
          createText: '在画布中调整公司名称、印章类型、编码、中间文字、五角星、内圈、字体、尺寸和位置，并可随时预览。',
          extractTitle: '图片提取透明印章',
          extractText: '导入 PNG、JPG 或扫描件，在浏览器中提取红色印章区域，并生成透明 PNG；图片不会上传。',
          exportTitle: 'PNG、SVG 与 JPEG 导出',
          exportText: '可导出透明 PNG、白底 PNG、SVG 和 JPEG，并调整倍率、尺寸与文件名，便于用于文档、演示稿或内部测试素材。'
        },
        faqAria: '常见问题',
        faqTitle: '常见问题',
        faq: {
          uploadQ: 'DrawStamp Studio 会上传我的印章图片吗？',
          uploadA: '不会。印章绘制、图片提取、模板草稿和导出都在浏览器端完成，核心流程没有上传接口。',
          transparentQ: '可以导出透明背景印章吗？',
          transparentA: '可以。选择 PNG 并关闭白底选项，即可导出透明背景图片。',
          safetyQ: '这个工具适合真实盖章或伪造文件吗？',
          safetyA: '不适合。本项目仅用于学习、测试、设计预览和合规授权场景，请勿用于伪造合同、公文、票据或任何违法用途。',
          saveQ: '可以保存和继续编辑模板吗？',
          saveA: '可以。当前配置可导出为 JSON 模板，浏览器也会保存本地草稿，方便刷新后继续编辑。'
        }
      },
      aboutBadges: {
        aria: '主要功能',
        create: '生成',
        template: '模板',
        finish: '质感',
        local: '本地'
      },
      contact: {
        qrAlt: 'Telegram 联系二维码（账号：KEVIN627ZTZ）',
        openTelegram: '打开 Telegram',
        primaryHeading: '首选联系入口',
        emailHeading: '邮件草稿',
        formHeading: '打开邮件草稿',
        mailBodyPlaceholder: '请在此填写您的问题…',
        nameLine: '姓名：{value}',
        emailLine: '联系邮箱：{value}',
        subjectLine: '主题：{value}',
        messageLine: '反馈内容：',
        empty: '未填写',
        mailError: '生成邮件链接失败'
      },
      extractor: {
        aria: '从图片提取印章',
        title: '从图片提取印章',
        close: '关闭',
        drop: '拖拽图片到这里，或点击选择',
        support: '支持 PNG / JPG / 扫描件，本地处理，不上传图片。',
        dropHint: '松手后自动提取红色印章',
        sourcePreview: '原图预览',
        waitingUpload: '等待上传',
        sourcePlaceholder: '图片会显示在这里，方便和右侧结果对照。',
        parameters: '提取参数',
        autoPreviewed: '已自动预览',
        tuneAfterUpload: '上传后可微调',
        retainRange: '保留范围',
        cleanup: '杂点清理',
        outputColor: '输出颜色',
        transparent: '透明背景',
        enhance: '边缘增强',
        preserveTones: '保留深浅',
        resultTitle: '透明 PNG 结果',
        live: '实时生成',
        reupload: '重新上传',
        clear: '清除结果',
        cancel: '取消',
        replaceCanvas: '替换画布',
        resultMeta: '{width} x {height}px · 红色区域 {ratio}%',
        processing: '正在提取…',
        readyHint: '选择图片后自动生成透明 PNG',
        errorHint: '如果漏章，提高保留范围；如果背景杂点多，提高杂点清理。',
        replaceHint: '确认后会清空默认章面，只保留提取结果；右侧仍可继续调整尺寸、位置和旋转。',
        failed: '提取失败，请换一张更清晰的图片',
        noRedArea: '未识别到明显的红色印章区域',
        chooseImage: '请拖入或选择图片文件',
        noImage: '没有检测到图片文件'
      }
    }
  },
  en: {
    studio: {
      language: {
        label: 'Language',
        switcher: 'Switch interface language',
        zh: '中文',
        en: 'English'
      },
      nav: {
        aria: 'Information page navigation',
        homeAlt: 'DrawStamp Studio home',
        dossier: 'Project Dossier',
        about: 'About',
        privacy: 'Privacy',
        terms: 'Terms',
        contact: 'Contact'
      },
      editor: {
        previewAlt: 'Export preview',
        fileFormat: 'File format',
        recommended: 'Recommended',
        exportScale: 'Export scale',
        pngWhiteBackground: 'Use a white PNG background',
        filename: 'Filename',
        autoExtension: 'Extension added automatically',
        filenamePlaceholder: 'Use company name automatically',
        defaultFilename: 'electronic-stamp',
        stampFallback: 'stamp',
        untitledDraft: 'Untitled stamp',
        moreSizeSettings: 'More size settings',
        downloadFormat: 'Download {format}',
        transparentBackground: 'Transparent background',
        whiteBackground: 'White background',
        vectorExport: 'Vector export',
        jpegQuality: 'JPEG quality {quality}%',
        formats: {
          pngDesc: 'Transparent background for documents and print',
          pngTip: 'Most popular',
          svgDesc: 'Scalable vector format for design software',
          svgTip: 'Scalable',
          jpegDesc: 'White-background image for everyday sharing',
          jpegTip: 'Small file'
        },
        draft: {
          saving: 'Saving',
          unsaved: 'Not saved',
          restored: 'Restored',
          autoSave: 'Auto-save',
          savedAt: 'Saved {time}',
          todayAt: 'Today {time}'
        },
        selection: {
          selected: 'Selected: {name}',
          basic: 'Basic settings',
          company: 'Company text',
          stampType: 'Stamp type',
          code: 'Code',
          taxNumber: 'Center text',
          star: 'Center symbol',
          circle: 'Inner circle',
          image: 'Image',
          svg: 'SVG graphic',
          aging: 'Aging effect',
          roughEdge: 'Rough edge',
          security: 'Security pattern',
          line: 'Line',
          element: 'Element'
        },
        backgrounds: {
          grid: 'Subtle grid',
          paper: 'White paper',
          checker: 'Transparency grid'
        },
        templateCategories: {
          all: 'All',
          general: 'General',
          finance: 'Finance',
          business: 'Business'
        },
        templateCategoryAria: 'Template categories',
        templates: {
          contract: { name: 'Contract Stamp', desc: 'Round · Company name · Star', badge: 'Popular' },
          official: { name: 'Company Seal', desc: 'Round · Standard company layout', badge: 'Standard' },
          finance: { name: 'Finance Stamp', desc: 'Oval · Inner ring · Code', badge: 'Finance' },
          invoice: { name: 'Invoice Stamp', desc: 'Oval · Center text · Code', badge: 'Tax' },
          receipt: { name: 'Receipt Stamp', desc: 'Oval · Payment confirmation', badge: 'Receipt' },
          business: { name: 'Business Stamp', desc: 'Round · Business processing', badge: 'Business' },
          quotation: { name: 'Quotation Stamp', desc: 'Oval · Quotation documents', badge: 'Quote' },
          clean: { name: 'Blank Stamp', desc: 'Reset to a clean starting point', badge: 'Blank' }
        },
        font: {
          label: 'Font',
          placeholder: 'Enter a font name',
          preview: 'Preview',
          previewText: 'Stamp Text 012345'
        },
        empty: {
          text: 'No text elements',
          figure: 'No graphic elements',
          effect: 'No effect elements'
        },
        properties: {
          size: 'Size',
          shape: 'Shape',
          elements: 'Elements',
          color: 'Stamp color',
          categoryAria: 'Property setting categories',
          basicTab: 'Basic',
          advancedTab: 'Advanced',
          currentObject: 'Current object settings',
          backToBasic: 'Back to basic',
          custom: 'Custom',
          customColor: 'Custom color',
          object: 'Object'
        }
      },
      seoContent: {
        title: 'Online Stamp Maker and Image Extraction Tool',
        intro: 'DrawStamp Studio is a free, browser-local electronic stamp editor for creating round and oval stamps and extracting red stamp marks from scanned documents or photos.',
        featuresAria: 'Core features',
        features: {
          local: 'Local processing',
          transparent: 'Transparent PNG',
          formats: 'SVG / JPEG',
          drafts: 'Templates & drafts'
        },
        cards: {
          createTitle: 'Online stamp maker',
          createText: 'Edit company names, stamp types, codes, center text, stars, inner rings, fonts, dimensions, and positioning with a live canvas preview.',
          extractTitle: 'Extract transparent stamps from images',
          extractText: 'Import PNG, JPG, or scanned images and isolate red stamp marks into transparent PNG files. Images stay in your browser.',
          exportTitle: 'PNG, SVG, and JPEG export',
          exportText: 'Export transparent PNG, white-background PNG, SVG, or JPEG files with adjustable scale, dimensions, and filenames for documents, presentations, or testing assets.'
        },
        faqAria: 'Frequently asked questions',
        faqTitle: 'Frequently asked questions',
        faq: {
          uploadQ: 'Does DrawStamp Studio upload my stamp images?',
          uploadA: 'No. Stamp drawing, image extraction, draft storage, and export run in your browser. The core workflows do not use an upload API.',
          transparentQ: 'Can I export a stamp with a transparent background?',
          transparentA: 'Yes. Choose PNG and turn off the white-background option to export a transparent image.',
          safetyQ: 'Can I use this tool to forge documents or official seals?',
          safetyA: 'No. This project is intended for learning, testing, design previews, and legally authorized use. Do not use it to forge contracts, official documents, invoices, or other legal records.',
          saveQ: 'Can I save a template and continue editing later?',
          saveA: 'Yes. You can export the current configuration as a JSON template, and the browser also keeps local drafts so you can continue after a refresh.'
        }
      },
      aboutBadges: {
        aria: 'Main features',
        create: 'Create',
        template: 'Templates',
        finish: 'Finish',
        local: 'Local'
      },
      contact: {
        qrAlt: 'Telegram contact QR code (username: KEVIN627ZTZ)',
        openTelegram: 'Open Telegram',
        primaryHeading: 'Primary contact',
        emailHeading: 'Email draft',
        formHeading: 'Open an email draft',
        mailBodyPlaceholder: 'Describe your question here…',
        nameLine: 'Name: {value}',
        emailLine: 'Email: {value}',
        subjectLine: 'Subject: {value}',
        messageLine: 'Feedback:',
        empty: 'Not provided',
        mailError: 'Failed to create email link'
      },
      extractor: {
        aria: 'Extract a stamp from an image',
        title: 'Extract stamp from image',
        close: 'Close',
        drop: 'Drop an image here or click to choose',
        support: 'PNG, JPG, and scans are processed locally. Images are not uploaded.',
        dropHint: 'Release to extract the red stamp automatically',
        sourcePreview: 'Source preview',
        waitingUpload: 'Waiting for upload',
        sourcePlaceholder: 'Your image will appear here for comparison with the extracted result.',
        parameters: 'Extraction settings',
        autoPreviewed: 'Preview generated',
        tuneAfterUpload: 'Fine-tune after upload',
        retainRange: 'Color range',
        cleanup: 'Noise cleanup',
        outputColor: 'Output color',
        transparent: 'Transparent background',
        enhance: 'Edge enhancement',
        preserveTones: 'Preserve tones',
        resultTitle: 'Transparent PNG result',
        live: 'Live result',
        reupload: 'Choose another image',
        clear: 'Clear result',
        cancel: 'Cancel',
        replaceCanvas: 'Replace canvas',
        resultMeta: '{width} x {height}px · Red area {ratio}%',
        processing: 'Extracting…',
        readyHint: 'Choose an image to generate a transparent PNG automatically',
        errorHint: 'Increase color range if the stamp is incomplete; increase noise cleanup if the background is noisy.',
        replaceHint: 'Confirming clears the default stamp and keeps only the extracted result. You can still adjust size, position, and rotation in the right panel.',
        failed: 'Extraction failed. Try a clearer image.',
        noRedArea: 'No clear red stamp area was detected.',
        chooseImage: 'Drop or choose an image file',
        noImage: 'No image file detected'
      }
    }
  }
} as const

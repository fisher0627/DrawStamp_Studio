const fontAliases: Record<string, string> = {
  '华文隶书': 'STLiti',
  '隶书': 'LiSu',
  '隶书 (GB2312)': 'SimLi',
  '隶书 GB2312': 'SimLi',
  '宋体': 'SimSun',
  '黑体': 'SimHei',
  '楷体': 'KaiTi',
  '仿宋': 'FangSong',
  '微软雅黑': 'Microsoft YaHei',
  '苹方': 'PingFang SC',
  '华文宋体': 'STSong',
  '华文楷体': 'STKaiti',
  '华文黑体': 'STHeiti',
  '华文仿宋': 'STFangsong',
  '华文行楷': 'STXingkai',
  '华文新魏': 'STXinwei',
  'ST Liti': 'STLiti'
}

const fontFallbacks: Record<string, string[]> = {
  STLiti: ['DrawStamp-STLiti', 'STLiti', '华文隶书', 'ST Liti', 'LiSu', '隶书', 'Libian SC', 'serif'],
  LiSu: ['DrawStamp-STLiti', 'LiSu', '隶书', 'STLiti', '华文隶书', 'Libian SC', 'serif'],
  SimLi: ['DrawStamp-STLiti', 'SimLi', '隶书', 'LiSu', 'STLiti', '华文隶书', 'serif'],
  SimSun: ['SimSun', '宋体', 'Songti SC', 'serif'],
  SimHei: ['SimHei', '黑体', 'Heiti SC', 'sans-serif'],
  KaiTi: ['KaiTi', '楷体', 'Kaiti SC', 'STKaiti', 'serif'],
  KaiTi_GB2312: ['KaiTi_GB2312', '楷体_GB2312', 'KaiTi', '楷体', 'Kaiti SC', 'serif'],
  FangSong: ['FangSong', '仿宋', 'STFangsong', 'serif'],
  FangSong_GB2312: ['FangSong_GB2312', '仿宋_GB2312', 'FangSong', '仿宋', 'serif'],
  'Songti SC': ['Songti SC', 'STSong', 'SimSun', '宋体', 'serif'],
  'Kaiti SC': ['Kaiti SC', 'STKaiti', 'KaiTi', '楷体', 'serif'],
  'Heiti SC': ['Heiti SC', 'STHeiti', 'SimHei', '黑体', 'sans-serif'],
  'Microsoft YaHei': ['Microsoft YaHei', '微软雅黑', 'PingFang SC', 'sans-serif'],
  'PingFang SC': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif']
}

export function getCanonicalFontName(fontName: string): string {
  const trimmed = fontName.trim()
  return fontAliases[trimmed] || trimmed
}

function quoteFontFamily(fontName: string): string {
  if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(fontName)) {
    return fontName
  }
  const escaped = fontName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

export function getFontCssFamily(fontName: string): string {
  const canonical = getCanonicalFontName(fontName)
  const stack = fontFallbacks[canonical] || [canonical, 'SimSun', 'Songti SC', 'serif']
  return Array.from(new Set(stack.filter(Boolean))).map(quoteFontFamily).join(', ')
}

export function getCanvasFontString(
  fontName: string,
  fontSizePx: number,
  fontWeight: string | number = 'normal',
  fontStyle: string = 'normal'
): string {
  return `${fontStyle} ${fontWeight} ${fontSizePx}px ${getFontCssFamily(fontName)}`
}

export async function ensureStampFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return

  try {
    await Promise.all([
      document.fonts.load('16px "DrawStamp-STLiti"'),
      document.fonts.load('16px "STLiti"'),
      document.fonts.ready
    ])
  } catch (error) {
    console.warn('Stamp fonts failed to preload:', error)
  }
}

// 字体名称映射：英文字体名称 -> 中文显示名称
export function getFontDisplayName(fontName: string): string {
  const canonicalName = getCanonicalFontName(fontName)
  const fontNameMap: Record<string, string> = {
    // GB2312 国标字体
    'SimSun': '宋体 (GB2312)',
    'SimHei': '黑体 (GB2312)',
    'KaiTi': '楷体',
    'KaiTi_GB2312': '楷体 (GB2312)',
    'FangSong': '仿宋',
    'FangSong_GB2312': '仿宋 (GB2312)',
    'SimLi': '隶书 (GB2312)',
    'NSimSun': '新宋体 (GB2312)',
    'Songti SC': '宋体-简',
    'Kaiti SC': '楷体-简',
    'Heiti SC': '黑体-简',
    'PingFang SC': '苹方-简',
    'Hiragino Sans GB': '冬青黑体简体中文',
    
    // 常用中文字体
    'Microsoft YaHei': '微软雅黑',
    'LiSu': '隶书',
    'YouYuan': '幼圆',
    
    // 华文字体系列
    'STHeiti': '华文黑体',
    'STKaiti': '华文楷体',
    'STSong': '华文宋体',
    'STFangsong': '华文仿宋',
    'STZhongsong': '华文中宋',
    'STXihei': '华文细黑',
    'STHupo': '华文琥珀',
    'STLiti': '华文隶书',
    'STXingkai': '华文行楷 (书法)',
    'STXinwei': '华文新魏 (书法)',
    'STCaiyun': '华文彩云',
    // 篆书字体（如果系统已安装）
    'FZZhuan': '方正篆书',
    'HYZhuan': '汉仪篆书',
    'STZhuan': '华文篆书',
    'ZhuanShu': '篆书',
    'FZKai-Z03': '方正楷体',
    'FZLiShu-S01': '方正隶书',
    'FZXiaoZhuanTi-S13T': '方正小篆体',
    'HYLiShuJ': '汉仪隶书',
    'HYZhongLiShuJ': '汉仪中隶书',
    'HYYanKaiW': '汉仪颜楷',
    'HYSongYunLangHeiW': '汉仪松韵朗黑',
    
    // 方正字体系列
    'FZShuTi': '方正舒体',
    'FZYaoti': '方正姚体',
    'FZHei-B01S': '方正黑体',
    'FZKai-Z03S': '方正楷体',
    'FZSong': '方正宋体',
    
    // 其他中文字体
    'PMingLiU': '新细明体',
    'MingLiU': '细明体',
    'DFKai-SB': '标楷体',
    'BiauKai': '标楷体',
    'Microsoft JhengHei': '微软正黑体',
    'Microsoft JhengHei UI': '微软正黑体 UI',
    'Microsoft YaHei UI': '微软雅黑 UI',
    'STSongti-SC-Regular': '华文宋体-简',
    'STHeiti-SC-Regular': '华文黑体-简',
    'STKaiti-SC-Regular': '华文楷体-简',
    'STFangsong-SC-Regular': '华文仿宋-简',
    'STSongti-SC-Light': '华文宋体-简-细',
    'STHeiti-SC-Light': '华文黑体-简-细',
    'STKaiti-SC-Light': '华文楷体-简-细',
    'WenQuanYi Micro Hei': '文泉驿微米黑',
    'WenQuanYi Zen Hei': '文泉驿正黑',
    'Noto Sans CJK SC': '思源黑体-简',
    'Source Han Sans SC': '思源黑体-简',
    'Source Han Sans CN': '思源黑体-简',
    'Source Han Serif SC': '思源宋体-简',
    'Source Han Serif CN': '思源宋体-简',
    'Noto Serif CJK SC': '思源宋体-简',
    'DengXian': '等线',
    'DengXian Light': '等线 Light',
    'Microsoft YaHei Light': '微软雅黑 Light',
    'Microsoft YaHei Bold': '微软雅黑 Bold',
    'SimSun-ExtB': '宋体-扩展B',
    
    // 常用英文字体（保持英文名称）
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Helvetica': 'Helvetica',
    'Courier New': 'Courier New',
    'Verdana': 'Verdana',
    'Georgia': 'Georgia',
    'Tahoma': 'Tahoma',
    'Trebuchet MS': 'Trebuchet MS',
    'Comic Sans MS': 'Comic Sans MS',
    'Impact': 'Impact',
    'Lucida Console': 'Lucida Console',
    'Lucida Sans Unicode': 'Lucida Sans Unicode',
    'Palatino Linotype': 'Palatino Linotype',
    'Garamond': 'Garamond',
    'Bookman Old Style': 'Bookman Old Style',
    'Century Gothic': 'Century Gothic',
    'Franklin Gothic Medium': 'Franklin Gothic Medium'
  };
  
  return fontNameMap[canonicalName] || fontNameMap[fontName] || fontName;
}

export type FontCategory = 'stamp' | 'song' | 'hei' | 'kai' | 'english' | 'system'

export function getRecommendedStampFonts(): string[] {
  return [
    'SimSun',
    'Songti SC',
    'STSong',
    'KaiTi',
    'Kaiti SC',
    'STKaiti',
    'FangSong',
    'LiSu',
    'STLiti',
    'Arial'
  ]
}

export function getFontCategory(fontName: string): FontCategory {
  const canonicalName = getCanonicalFontName(fontName)
  const displayName = getFontDisplayName(canonicalName)
  const lowerName = `${canonicalName} ${displayName}`.toLowerCase()
  if (/lisu|liti|xingkai|xinwei|zhuan|shuti|yaoti|隶书|行楷|新魏|篆|舒体|姚体/i.test(`${canonicalName} ${displayName}`)) return 'stamp'
  if (/song|simsun|serif|ming/i.test(lowerName)) return 'song'
  if (/hei|sans|yahei|pingfang|dengxian|helvetica|arial/i.test(lowerName)) return 'hei'
  if (/kai|fangsong|fang/i.test(lowerName)) return 'kai'
  if (/times|courier|verdana|georgia|tahoma|impact|garamond|bookman|century|franklin/i.test(lowerName)) return 'english'
  return 'system'
}

export function getFontCategoryLabel(category: FontCategory): string {
  const labels: Record<FontCategory, string> = {
    stamp: '印章推荐',
    song: '宋体/明体',
    hei: '黑体/现代',
    kai: '楷体/仿宋',
    english: '英文/数字',
    system: '系统字体'
  }
  return labels[category]
}

export function groupFontsByCategory(fonts: string[]): Array<{ category: FontCategory; label: string; fonts: string[] }> {
  const order: FontCategory[] = ['stamp', 'song', 'hei', 'kai', 'english', 'system']
  const uniqueFonts = Array.from(new Set(fonts.filter(Boolean)))
  const grouped = new Map<FontCategory, string[]>()

  uniqueFonts.forEach(font => {
    const category = getFontCategory(font)
    grouped.set(category, [...(grouped.get(category) || []), font])
  })

  return order
    .map(category => ({
      category,
      label: getFontCategoryLabel(category),
      fonts: (grouped.get(category) || []).sort((a, b) => getFontDisplayName(a).localeCompare(getFontDisplayName(b), 'zh-Hans-CN'))
    }))
    .filter(group => group.fonts.length > 0)
}

// 获取常用中文字体列表（包含GB2312等国标字体）
function getChineseFonts(): string[] {
  return [
    // GB2312 国标字体
    'SimSun', // 宋体 (GB2312)
    'SimHei', // 黑体 (GB2312)
    'KaiTi_GB2312', // 楷体_GB2312
    'FangSong_GB2312', // 仿宋_GB2312
    'SimLi', // 隶书 (GB2312)
    'NSimSun', // 新宋体 (GB2312)
    
    // 常用中文字体
    'Microsoft YaHei', // 微软雅黑
    'KaiTi', // 楷体
    'FangSong', // 仿宋
    'LiSu', // 隶书
    'YouYuan', // 幼圆
    
    // 华文字体系列
    'STHeiti', // 华文黑体
    'STKaiti', // 华文楷体
    'STSong', // 华文宋体
    'STFangsong', // 华文仿宋
    'STZhongsong', // 华文中宋
    'STXihei', // 华文细黑
    'STHupo', // 华文琥珀
    'STLiti', // 华文隶书
    'STXingkai', // 华文行楷
    'STXinwei', // 华文新魏
    'STCaiyun', // 华文彩云
    // 篆书字体（如果系统已安装）
    'FZZhuan', // 方正篆书
    'HYZhuan', // 汉仪篆书
    'STZhuan', // 华文篆书
    'ZhuanShu', // 篆书
    'FZLiShu-S01', // 方正隶书
    'FZXiaoZhuanTi-S13T', // 方正小篆体
    'HYLiShuJ', // 汉仪隶书
    'HYZhongLiShuJ', // 汉仪中隶书
    'HYYanKaiW', // 汉仪颜楷
    
    // 方正字体系列
    'FZShuTi', // 方正舒体
    'FZYaoti', // 方正姚体
    'FZHei-B01S', // 方正黑体
    'FZKai-Z03S', // 方正楷体
    'FZSong', // 方正宋体
    
    // 其他中文字体
    'PMingLiU', // 新细明体
    'MingLiU', // 细明体
    'DFKai-SB', // 标楷体
    'BiauKai', // 标楷体
    'Microsoft JhengHei', // 微软正黑体
    'Microsoft JhengHei UI', // 微软正黑体 UI
    'Microsoft YaHei UI', // 微软雅黑 UI
    'STSongti-SC-Regular', // 华文宋体-简
    'STHeiti-SC-Regular', // 华文黑体-简
    'STKaiti-SC-Regular', // 华文楷体-简
    'STFangsong-SC-Regular', // 华文仿宋-简
    'Songti SC', // 宋体-简
    'Kaiti SC', // 楷体-简
    'Heiti SC', // 黑体-简
    'Songti TC', // 宋体-繁
    'Kaiti TC', // 楷体-繁
    'Heiti TC', // 黑体-繁
    'Yuanti SC', // 圆体-简
    'Xingkai SC', // 行楷-简
    'Baoli SC', // 报隶-简
    'Weibei SC', // 魏碑-简
    'Libian SC', // 隶变-简
    'STSongti-SC-Light', // 华文宋体-简-细
    'STHeiti-SC-Light', // 华文黑体-简-细
    'STKaiti-SC-Light', // 华文楷体-简-细
    'PingFang SC', // 苹方-简
    'Hiragino Sans GB', // 冬青黑体简体中文
    'WenQuanYi Micro Hei', // 文泉驿微米黑
    'WenQuanYi Zen Hei', // 文泉驿正黑
    'Noto Sans CJK SC', // 思源黑体-简
    'Noto Serif CJK SC', // 思源宋体-简
    'Source Han Sans SC', // 思源黑体-简
    'Source Han Sans CN', // 思源黑体-简
    'Source Han Serif SC', // 思源宋体-简
    'Source Han Serif CN', // 思源宋体-简
    'DengXian', // 等线
    'DengXian Light', // 等线 Light
    'Microsoft YaHei Light', // 微软雅黑 Light
    'Microsoft YaHei Bold', // 微软雅黑 Bold
    'SimSun-ExtB' // 宋体-扩展B
  ];
}

export async function getSystemFonts(): Promise<string[]> {
  try {
    // 获取常用中文字体列表
    const chineseFonts = getChineseFonts();
    
    // 使用 FontFace API 获取可用字体
    // @ts-ignore
    if (window.queryLocalFonts) {
      // @ts-ignore
      const availableFonts = await window.queryLocalFonts();
      const systemFonts: string[] = Array.from(new Set(availableFonts.map((font: any) => String(font.family))));
      // 合并系统字体和常用中文字体，确保中文字体可用
      const allFonts: string[] = Array.from(new Set([...chineseFonts, ...systemFonts]));
      return allFonts.sort();
    } else {
      // 降级方案：返回常用中文字体列表 + 常用英文字体
      return [
        ...chineseFonts,
        // 常用英文字体
        'Arial',
        'Times New Roman',
        'Helvetica',
        'Courier New',
        'Verdana',
        'Georgia',
        'Tahoma',
        'Trebuchet MS',
        'Comic Sans MS',
        'Impact',
        'Lucida Console',
        'Lucida Sans Unicode',
        'Palatino Linotype',
        'Garamond',
        'Bookman Old Style',
        'Century Gothic',
        'Franklin Gothic Medium'
      ];
    }
  } catch (error) {
    console.error('获取系统字体失败:', error);
    // 返回最常用的中文字体和英文字体
    return [
      // GB2312 国标字体
      'SimSun', // 宋体 (GB2312)
      'SimHei', // 黑体 (GB2312)
      'KaiTi_GB2312', // 楷体_GB2312
      'FangSong_GB2312', // 仿宋_GB2312
      // 常用中文字体
      'Microsoft YaHei', // 微软雅黑
      'KaiTi', // 楷体
      'FangSong', // 仿宋
      'STHeiti', // 华文黑体
      'STKaiti', // 华文楷体
      'STSong', // 华文宋体
      // 常用英文字体
      'Arial',
      'Times New Roman',
      'Helvetica'
    ];
  }
} 

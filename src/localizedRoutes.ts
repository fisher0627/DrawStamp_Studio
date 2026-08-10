import type { AppLocale } from './i18n'

export const localeFromPath = (path: string): AppLocale => (
  path === '/en' || path.startsWith('/en/') ? 'en' : 'zh'
)

export const stripLocalePrefix = (path: string) => {
  if (path === '/en' || path === '/en/') return '/'
  return path.startsWith('/en/') ? path.slice(3) || '/' : path
}

export const localizedPath = (path: string, locale: AppLocale) => {
  const basePath = stripLocalePrefix(path)
  if (locale === 'zh') return basePath
  return basePath === '/' ? '/en/' : `/en${basePath}`
}

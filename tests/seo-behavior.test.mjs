import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function load(path, globals = {}) {
  const code = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText
  const context = { exports: {}, URL, URLSearchParams, ...globals }
  vm.runInNewContext(code, context)
  return context.exports
}

test('Fonts load only for active document elements, including font aliases', async () => {
  const requests = []
  const api = await load('../src/utils/fontUtils.ts', { document: { fonts: { load: async font => requests.push(font) } } })
  const config = { company: { fontFamily: 'STLiti' }, companyList: [{ fontFamily: 'SimSun' }], stampTypeList: [] }
  await api.ensureStampFontsLoaded(api.getStampFontFamilies(config))
  assert.equal(requests.length, 1)
  assert.ok(!requests[0].includes('DrawStamp-STLiti'))
  config.companyList[0].fontFamily = '华文隶书'
  await api.ensureStampFontsLoaded(api.getStampFontFamilies(config))
  assert.ok(requests[1].includes('DrawStamp-STLiti'))
  assert.ok(api.getStampFontFamilies({ stampCodeList: [], stampCode: { fontFamily: 'STLiti' } }).includes('STLiti'))
})

test('Analytics preserves landing context, strips unknown values and flushes each delayed event once', async () => {
  const sent = []; let onload
  const window = { location: { hostname: 'wosp.cc.cd', pathname: '/extract-transparent-stamp', search: '' } }
  const api = await load('../src/utils/analytics.ts', {
    window, navigator: {}, document: { getElementById: () => ({ addEventListener: (_event, handler) => { onload = handler } }) }
  })
  api.initializeAnalytics()
  api.trackEvent('guide_open_tool', { guide: 'extractTransparentStamp', filename: 'PRIVATE.png' })
  window.location.pathname = '/'
  api.trackEvent('export_success', { format: 'png', mode: 'physical', source: 'dialog', company: 'PRIVATE' })
  window.umami = { track: callback => sent.push(callback({ url: '/?company=PRIVATE', referrer: 'https://google.com/search?q=PRIVATE' })) }
  onload(); onload()
  assert.equal(sent.length, 2)
  assert.equal(sent[1].data.landing, '/extract-transparent-stamp')
  assert.equal(sent[1].data.guide, 'extractTransparentStamp')
  assert.equal(sent[1].url, '/')
  assert.equal(sent[1].referrer, 'https://google.com')
  assert.ok(!JSON.stringify(sent).includes('PRIVATE'))
  api.trackEvent('export_success', { format: 'PRIVATE', guide: 'PRIVATE' })
  assert.equal(sent[2].data.format, undefined)
})

test('Analytics respects DNT and preview hosts; tracker failures never escape', async () => {
  let calls = 0
  const window = { location: { hostname: 'localhost', pathname: '/', search: '' }, umami: { track: () => { calls++; throw Error('offline') } } }
  const navigator = { doNotTrack: '0' }
  const api = await load('../src/utils/analytics.ts', { window, navigator, document: { getElementById: () => null } })
  api.trackEvent('export_success'); assert.equal(calls, 0)
  window.location.hostname = 'wosp.cc.cd'; navigator.doNotTrack = '1'
  api.trackEvent('export_success'); assert.equal(calls, 0)
  navigator.doNotTrack = '0'
  assert.doesNotThrow(() => api.trackEvent('export_success'))
  assert.equal(calls, 1)
})

import type { IDrawStampConfig } from '../DrawStampTypes'

export type LibraryStamp = { id: string; name: string; updatedAt: number; thumbnail: string; config: IDrawStampConfig }
const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('drawstamp-library', 1)
  request.onupgradeneeded = () => request.result.createObjectStore('stamps', { keyPath: 'id' })
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
  request.onblocked = () => reject(new Error('请关闭其他印章库窗口后重试'))
})
async function transaction<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stamps', mode)
    const request = work(tx.objectStore('stamps'))
    tx.oncomplete = () => { db.close(); resolve(request.result) }
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || request.error) }
  })
}
export const listLibraryStamps = () => transaction('readonly', store => store.getAll() as IDBRequest<LibraryStamp[]>)
export const putLibraryStamp = (stamp: LibraryStamp) => transaction('readwrite', store => store.put(JSON.parse(JSON.stringify(stamp))))
export const deleteLibraryStamp = (id: string) => transaction('readwrite', store => store.delete(id))

export function validateStampConfig(value: unknown): asserts value is IDrawStampConfig {
  if (!value || typeof value !== 'object') throw new Error('印章配置格式无效')
  const config = value as Record<string, unknown>
  for (const key of ['width', 'height']) {
    if (typeof config[key] !== 'number' || !Number.isFinite(config[key]) || (config[key] as number) <= 0 || (config[key] as number) > 500) throw new Error('印章尺寸须在 0–500 毫米之间')
  }
  for (const key of ['outBorder', 'ruler', 'company', 'stampType', 'stampCode', 'taxNumber', 'drawStar', 'roughEdge', 'agingEffect', 'securityPattern']) {
    if (!config[key] || typeof config[key] !== 'object' || Array.isArray(config[key])) throw new Error(`缺少配置：${key}`)
  }
  if (!Array.isArray(config.companyList)) throw new Error('缺少公司文字列表')
  for (const [key, val] of Object.entries(config)) {
    if (key.endsWith('List') && (!Array.isArray(val) || val.length > 500 || val.some(item => !item || typeof item !== 'object'))) throw new Error(`元素列表无效：${key}`)
  }
}
export async function restoreLibraryBackup(text: string) {
  const backup = JSON.parse(text)
  if (backup?.version !== 1 || !Array.isArray(backup.stamps) || backup.stamps.length > 500) throw new Error('不支持的印章库备份格式')
  const stamps: LibraryStamp[] = backup.stamps.map((item: LibraryStamp) => {
    validateStampConfig(item.config)
    if (typeof item.name !== 'string' || !item.name.trim()) throw new Error('印章名称无效')
    return { id: crypto.randomUUID(), name: item.name.slice(0, 100), updatedAt: Date.now(), thumbnail: typeof item.thumbnail === 'string' && item.thumbnail.startsWith('data:image/png;base64,') ? item.thumbnail : '', config: item.config }
  })
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('stamps', 'readwrite')
    stamps.forEach(stamp => tx.objectStore('stamps').put(stamp))
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error) }
  })
  return stamps.length
}

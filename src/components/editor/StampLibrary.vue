<template>
  <div class="stamp-library-overlay" @click.self="$emit('close')">
    <section class="stamp-library" role="dialog" aria-modal="true" :aria-label="tr('本地印章库', 'Local stamp library')" @keydown.esc="$emit('close')">
      <header><div><h2>{{ tr('本地印章库', 'Local stamp library') }}</h2><p>{{ tr('保存在此浏览器中，建议定期下载备份。', 'Saved in this browser. Download a backup regularly.') }}</p></div><button @click="$emit('close')" :aria-label="tr('关闭', 'Close')">×</button></header>
      <form class="library-save" @submit.prevent="saveCurrent">
        <input v-model="name" maxlength="100" :aria-label="tr('印章名称', 'Stamp name')" :placeholder="tr('给当前印章起个名字', 'Name the current stamp')" />
        <button :disabled="busy || !name.trim()" class="primary">{{ tr('保存当前印章', 'Save current stamp') }}</button>
      </form>
      <div class="library-tools">
        <input v-model="query" type="search" :aria-label="tr('搜索印章', 'Search stamps')" :placeholder="tr('搜索名称', 'Search by name')" />
        <button @click="backup" :disabled="busy || !items.length">{{ tr('下载备份', 'Download backup') }}</button>
        <button @click="backupInput?.click()" :disabled="busy">{{ tr('导入备份', 'Import backup') }}</button>
        <input ref="backupInput" type="file" accept=".json,application/json" hidden @change="importBackup" />
      </div>
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="error" role="alert" class="library-error">{{ error }}</p>
      <div class="library-grid" :aria-busy="busy">
        <article v-for="item in filtered" :key="item.id">
          <button class="stamp-thumb" @click="openStamp(item)" :disabled="busy" :aria-label="`${tr('打开', 'Open')} ${item.name}`"><img v-if="item.thumbnail" :src="item.thumbnail" alt="" /><span v-else>印</span></button>
          <form class="rename-row" @submit.prevent="rename(item)"><input v-model="names[item.id]" maxlength="100" :aria-label="`${tr('重命名', 'Rename')} ${item.name}`" /><button :disabled="busy || !names[item.id]?.trim()">{{ tr('改名', 'Rename') }}</button></form>
          <small>{{ new Date(item.updatedAt).toLocaleDateString() }}</small>
          <div class="item-actions"><button @click="openStamp(item)" :disabled="busy">{{ tr('打开', 'Open') }}</button><button @click="duplicate(item)" :disabled="busy">{{ tr('复制', 'Duplicate') }}</button><button @click="remove(item)" :disabled="busy">{{ tr('删除', 'Delete') }}</button></div>
        </article>
      </div>
      <p v-if="!busy && !filtered.length" class="library-empty">{{ tr(items.length ? '没有找到匹配的印章' : '还没有保存印章，从上方保存当前作品开始。', items.length ? 'No matching stamps.' : 'Save your current stamp to start your library.') }}</p>
      <button v-if="deleted" @click="undoRemove" :disabled="busy">{{ tr('撤销删除', 'Undo delete') }} · {{ deleted.name }}</button>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { trackEvent } from '../../utils/analytics'
import { useI18n } from 'vue-i18n'
import type { IDrawStampConfig } from '../../DrawStampTypes'
import { deleteLibraryStamp, listLibraryStamps, putLibraryStamp, restoreLibraryBackup, type LibraryStamp } from '../../utils/stampLibrary'
const props = defineProps<{ getConfig: () => IDrawStampConfig | null; getThumbnail: () => Promise<string> }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'open', config: IDrawStampConfig): void }>()
const { locale } = useI18n()
const tr = (zh: string, en: string) => locale.value === 'zh' ? zh : en
const items = ref<LibraryStamp[]>([])
const names = ref<Record<string, string>>({})
const name = ref(props.getConfig()?.companyList?.[0]?.companyName || props.getConfig()?.title || '')
const query = ref('')
const busy = ref(false)
const error = ref('')
const message = ref('')
const deleted = ref<LibraryStamp | null>(null)
const backupInput = ref<HTMLInputElement | null>(null)
const filtered = computed(() => items.value.filter(item => item.name.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase())))
const reload = async () => {
  items.value = (await listLibraryStamps()).sort((a, b) => b.updatedAt - a.updatedAt)
  names.value = Object.fromEntries(items.value.map(item => [item.id, item.name]))
}
const run = async (action: () => Promise<void>) => {
  if (busy.value) return
  busy.value = true; error.value = ''; message.value = ''
  try { await action() } catch (e) { error.value = `${tr('操作失败，请检查存储空间或备份文件。', 'Could not complete operation. Check storage or backup file.')} ${e instanceof Error ? e.message : ''}` } finally { busy.value = false }
}
const saveCurrent = () => run(async () => {
  const current = props.getConfig()
  if (!current || !name.value.trim()) return
  const config = JSON.parse(JSON.stringify(current))
  const thumbnail = await props.getThumbnail()
  await putLibraryStamp({ id: crypto.randomUUID(), name: name.value.trim(), updatedAt: Date.now(), thumbnail, config })
  trackEvent('library_save')
  await reload(); message.value = tr('已保存到本地印章库', 'Saved to your local library')
})
const openStamp = (item: LibraryStamp) => emit('open', JSON.parse(JSON.stringify(item.config)))
const rename = (item: LibraryStamp) => run(async () => { await putLibraryStamp({ ...item, name: names.value[item.id].trim(), updatedAt: Date.now() }); await reload() })
const duplicate = (item: LibraryStamp) => run(async () => { await putLibraryStamp({ ...item, id: crypto.randomUUID(), name: `${item.name} ${tr('副本', 'copy')}`, updatedAt: Date.now() }); await reload() })
const remove = (item: LibraryStamp) => run(async () => { await deleteLibraryStamp(item.id); deleted.value = item; await reload() })
const undoRemove = () => run(async () => { if (deleted.value) { await putLibraryStamp(deleted.value); deleted.value = null; await reload() } })
const backup = () => run(async () => {
  const stamps = await listLibraryStamps()
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, stamps })], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = `stamp-library-${new Date().toISOString().slice(0, 10)}.json`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})
const importBackup = (event: Event) => run(async () => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  try {
    if (!file) return
    if (file.size > 100 * 1024 * 1024) throw new Error(tr('备份文件不能超过 100 MB', 'Backup exceeds 100 MB'))
    const count = await restoreLibraryBackup(await file.text()); await reload()
    message.value = tr(`已新增 ${count} 份印章，原有作品已保留`, `Imported ${count} stamps; existing stamps were kept`)
  } finally { input.value = '' }
})
onMounted(() => run(reload))
</script>
<style scoped>
.stamp-library-overlay { position:fixed; inset:0; z-index:2400; background:#1c243766; display:grid; place-items:center; padding:20px }
.stamp-library { box-sizing:border-box; width:min(840px,100%); max-height:90vh; overflow:auto; background:var(--studio-panel,#faf9f6); color:var(--studio-ink,#253346); border-radius:18px; padding:24px; box-shadow:0 24px 80px #14233c33 }
header,.library-save,.library-tools,.rename-row,.item-actions { display:flex; align-items:center; gap:10px }
header { justify-content:space-between; align-items:flex-start } h2 { margin:0 } p,small { color:var(--studio-muted,#64748b); font-size:13px }
button,input { font:inherit; border:1px solid #d5dbe2; border-radius:8px; padding:9px 11px; background:white; color:inherit; min-width:0 }
button { cursor:pointer } button:disabled { opacity:.45; cursor:default } .primary { background:#284b74; color:white; border-color:#284b74 }
.library-save { margin:18px 0 12px } .library-save input,.library-tools input,.rename-row input { flex:1; min-width:0 } .library-tools { flex-wrap:wrap }
.library-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; margin:20px 0 }
article { border:1px solid #dce1e5; border-radius:12px; padding:12px; background:#fff }
.stamp-thumb { width:100%; height:130px; display:grid; place-items:center; background:#f5f4f0; margin-bottom:12px } .stamp-thumb img { max-width:100%; max-height:110px; object-fit:contain }
.item-actions { margin-top:12px } .item-actions button { flex:1; font-size:12px } .rename-row button { font-size:12px } .library-error { color:#a23434 } .library-empty { padding:28px 0; text-align:center }
@media(max-width:540px) { .stamp-library { padding:16px } .library-save { flex-wrap:wrap } .library-grid { grid-template-columns:1fr } }
</style>

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const code = ts.transpileModule(await readFile(new URL('../src/utils/exportImage.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { withImageDpi } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=', 'base64'))
const chunks = bytes => {
  const found = []
  for (let i=8;i+12<=bytes.length;) { const length=new DataView(bytes.buffer,bytes.byteOffset+i,4).getUint32(0);found.push({type:Buffer.from(bytes.slice(i+4,i+8)).toString(), data:bytes.slice(i+8,i+8+length), crc:bytes.slice(i+8+length,i+12+length)});i+=length+12 }
  return found
}
test('PNG records 300 DPI in pHYs without changing compressed image data', () => {
  const result=chunks(withImageDpi(png,'png',300));const phys=result.find(x=>x.type==='pHYs');
  assert.equal(new DataView(phys.data.buffer).getUint32(0),11811)
  assert.equal(new DataView(phys.data.buffer).getUint32(4),11811)
  assert.equal(phys.data[8],1)
  assert.deepEqual(result.find(x=>x.type==='IDAT').data,chunks(png).find(x=>x.type==='IDAT').data)
  assert.deepEqual([...phys.crc],[120,165,63,118])
})
test('Repeated PNG updates replace rather than duplicate pHYs', () => {
  const result=chunks(withImageDpi(withImageDpi(png,'png',300),'png',600))
  assert.equal(result.filter(x=>x.type==='pHYs').length,1)
  assert.equal(new DataView(result.find(x=>x.type==='pHYs').data.buffer).getUint32(0),23622)
})
test('JPEG adds JFIF resolution metadata and preserves original data', () => {
  const raw=Uint8Array.from([255,216,255,217]);const result=withImageDpi(raw,'jpeg',300)
  assert.equal(Buffer.from(result.slice(6,11)).toString(),'JFIF\0')
  assert.equal(result[13],1);assert.equal((result[14]<<8)|result[15],300);assert.equal((result[16]<<8)|result[17],300)
  assert.deepEqual([...result.slice(-2)],[255,217])
})
test('JPEG updates existing JFIF instead of adding a duplicate', () => {
  const first=withImageDpi(Uint8Array.from([255,216,255,217]),'jpeg',300);const second=withImageDpi(first,'jpeg',600)
  assert.equal(first.length,second.length);assert.equal((second[14]<<8)|second[15],600)
})
test('Resolution rejects invalid and excessive values', () => {
  for(const dpi of [0,-1,NaN,Infinity,1201,300.5]) assert.throws(()=>withImageDpi(png,'png',dpi))
})

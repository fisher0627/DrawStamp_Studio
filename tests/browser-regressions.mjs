// Run in a Vite-served browser using page.evaluate(runBrowserRegressions).
export default async function runBrowserRegressions() {
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const results = []
  const { DrawStampUtils } = await import('/src/DrawStampUtils.ts')
  const { InitDrawStampConfigsUtils } = await import('/src/utils/InitDrawStampConfigsUtils.ts')
  const { extractStampFromFile } = await import('/src/utils/extractStampImage.ts')
  const library = await import('/src/utils/stampLibrary.ts')
  const config = new InitDrawStampConfigsUtils().initDrawStampConfigs()
  config.company.companyName = 'SAMPLE';config.companyList = [config.company]
  config.width = 40; config.height = 40; config.agingEffect.applyAging = false
  const source = document.createElement('canvas'); source.width = 600; source.height = 600
  const renderer = new DrawStampUtils(source, 10);renderer.setDrawConfigs(config)
  const before = JSON.stringify(renderer.getDrawConfigs())
  const readImage = async data => {
    const image = new Image();image.src=data;await image.decode()
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0)
    return { width:canvas.width,height:canvas.height,data:ctx.getImageData(0,0,canvas.width,canvas.height).data }
  }
  const [png,jpeg] = await Promise.all([renderer.getStampImageBase64('png',.92,496,496),renderer.getStampImageBase64('jpeg',.92,992,992)])
  assert(JSON.stringify(renderer.getDrawConfigs())===before,'Export mutated editor config')
  const p=await readImage(png),j=await readImage(jpeg)
  assert(p.width===496 && p.height===496 && p.data[3]===0,'PNG dimensions or transparency')
  assert(j.width===992 && j.data[3]===255 && j.data[0]>245,'JPEG dimensions or white background')
  let xmin=p.width,xmax=0
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){if(p.data[(y*p.width+x)*4+3]>30){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x)}}
  assert(Math.abs((xmax-xmin+1)/300*25.4-40)<.3,'Physical stamp width is inaccurate')
  results.push('parallel exports preserve editor state; PNG transparency; JPEG white; 40 mm geometry')
  const image=document.createElement('canvas');image.width=2400;image.height=1600
  const ctx=image.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,2400,1600);ctx.strokeStyle='#ee1234';ctx.lineWidth=14;ctx.beginPath();ctx.arc(1800,1100,210,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ee1234';ctx.fillRect(50,50,600,30)
  const blob=await new Promise(resolve=>image.toBlob(resolve,'image/png'));const file=new File([blob],'sample-only.png',{type:'image/png'})
  const options={threshold:68,cleanup:2,targetColor:'#ff0015',transparentBackground:true,preserveShading:true,edgeEnhance:true}
  const full=await extractStampFromFile(file,options);const cropped=await extractStampFromFile(file,{...options,crop:{x:1500,y:800,width:600,height:600}})
  assert(full.width>1000 && cropped.width>420 && cropped.width<460,'Crop did not remove distractor / preserve source detail')
  const c=await readImage(cropped.dataUrl);assert(c.data[3]===0,'Crop lost transparency')
  results.push('crop precedes downsampling and excludes red distractor')
  const baseline=new Set((await library.listLibraryStamps()).map(x=>x.id))
  const stamp={id:crypto.randomUUID(),name:'QA_AUTO_ONLY',updatedAt:Date.now(),thumbnail:png,config:JSON.parse(before)}
  try {
    await library.putLibraryStamp(stamp)
    await library.restoreLibraryBackup(JSON.stringify({version:1,stamps:[stamp]}))
    const stored=(await library.listLibraryStamps()).filter(x=>!baseline.has(x.id))
    assert(stored.length===2 && stored.every(x=>x.config.width===40),'Library backup roundtrip')
    let rejected=false
    try {await library.restoreLibraryBackup(JSON.stringify({version:1,stamps:[stamp,{...stamp,config:{width:-1}}]}))}catch{rejected=true}
    assert(rejected && (await library.listLibraryStamps()).length===baseline.size+2,'Invalid backup partially imported')
    results.push('IndexedDB save and backup restore; invalid backup is atomic')
  } finally {
    for(const item of await library.listLibraryStamps())if(!baseline.has(item.id)&&item.name==='QA_AUTO_ONLY')await library.deleteLibraryStamp(item.id)
  }
  return results
}

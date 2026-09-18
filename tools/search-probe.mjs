// Measures the live blog search layout over CDP. node tools/search-probe.mjs [baseUrl] [query] [out.png]
import {launch, sleep, until} from 'file:///C:/trontstack/senddudes/tools/cdp.mjs';
const base = process.argv[2] || 'https://tront.xyz/blog/';
const q = process.argv[3] || 'dynamite';
const out = process.argv[4] || 'tools/out/search.png';
const page = await launch({port: 9500 + Math.floor(Math.random() * 90), width: 1920, height: 1080});
try {
  await page.goto(base);
  await until(() => page.eval(`!!document.getElementById('search-input')`), {timeout: 30000, label: 'page'});
  await sleep(1500);
  await page.eval(`(()=>{const i=document.getElementById('search-input');i.focus();i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true}));})()`);
  await sleep(1500);
  const info = await page.eval(`(()=>{const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
    const arts=[...document.querySelectorAll('#search-results article')];
    return JSON.stringify({rootFont:getComputedStyle(document.documentElement).fontSize,viewport:[innerWidth,innerHeight],
      main:r(document.querySelector('main')),mainClass:document.querySelector('main')?.className,wrapper:r(document.getElementById('search-result-wrapper')),wrapperClass:document.getElementById('search-result-wrapper')?.className,
      content:r(document.querySelector('#search-result-wrapper .content')),results:r(document.getElementById('search-results')),
      panel:r(document.getElementById('panel-wrapper')),panelDisplay:document.getElementById('panel-wrapper')&&getComputedStyle(document.getElementById('panel-wrapper')).display,
      sidebar:r(document.getElementById('sidebar')),n:arts.length,articles:arts.slice(0,4).map(r),h2:arts[0]&&getComputedStyle(arts[0].querySelector('h2')).fontSize,
      artCss:arts[0]&&(s=>[s.width,s.flexBasis,s.paddingLeft,s.paddingRight])(getComputedStyle(arts[0])),
      hints:r(document.getElementById('search-hints'))});})()`);
  console.log(info);
  await page.shot(out); console.log('wrote', out);
} finally { page.kill(); }

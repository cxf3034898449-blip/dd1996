import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const out=path.resolve('out');
const filename=path.join(out,'index.html');
let html=fs.readFileSync(filename,'utf8');
const sources=[...html.matchAll(/<script\b([^>]*?)src="([^"]+)"([^>]*)><\/script>/g)];
const active=sources.filter(m=>!m[0].includes('noModule'));
const resolve=url=>path.join(out,url.replace(/^\/dd1996\//,''));
const initial=active.map(m=>resolve(m[2]));
const runtime=initial.find(p=>path.basename(p).startsWith('webpack-'));
if(!runtime)throw Error('Webpack runtime missing');
const extras=fs.readdirSync(path.join(out,'_next/static/chunks')).filter(n=>/^[a-f0-9].*\.js$/.test(n)).map(n=>path.join(out,'_next/static/chunks',n)).filter(p=>!initial.includes(p));
let js=[...initial.filter(p=>p!==runtime),...extras,runtime].map(p=>fs.readFileSync(p,'utf8')).join(';\n');
// Embed existing assets without changing the geometry, shader, or animation values.
const prefix='/dd1996/sites/pacomepertant-com-b16b412f/root-8a5edab2';
for(let i=1;i<=9;i++){
 const url=`${prefix}/designs/${i}-preview.webp`;
 js=js.split(url).join('data:image/webp;base64,'+fs.readFileSync(resolve(url)).toString('base64'));
}
html=html.replace(/<script\b([^>]*?)src="([^"]+)"([^>]*)><\/script>/g,(tag,a,url)=>tag.includes('noModule')?tag:'');
html=html.replace(/<link\b[^>]*as="script"[^>]*\/>/g,'');
html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*\/>/g,tag=>{
 const url=tag.match(/href="([^"]+)"/)?.[1];
 return url?.startsWith('/dd1996/_next/')?`<style>${fs.readFileSync(resolve(url),'utf8')}</style>`:tag;
});
js = `Object.defineProperty(document.currentScript,'src',{value:new URL('/dd1996/_next/static/chunks/inline-home.js',location.href).href});\n` + js;
html=html.replace('</body>',()=>`<script>${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
fs.writeFileSync(filename,html);
console.log(JSON.stringify({startupExternalScripts:0,inlineScripts:initial.length+extras.length,htmlBytes:Buffer.byteLength(html),gzipBytes:zlib.gzipSync(html).length}));

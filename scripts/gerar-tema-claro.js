const fs = require('fs');
const css = fs.readFileSync(''+__dirname+'/../style.css','utf8');

function stripComments(t){ let o='',i=0,q=null; while(i<t.length){ const c=t[i]; if(q){ o+=c; if(c==='\\'){ o+=t[i+1]||''; i+=2; continue; } if(c===q) q=null; i++; continue; } if(c==='"'||c==="'"){ q=c; o+=c; i++; continue; } if(c==='/'&&t[i+1]==='*'){ const j=t.indexOf('*/',i+2); i=j<0?t.length:j+2; continue; } o+=c; i++; } return o; }
function splitTop(t, sep){ const parts=[]; let cur='',par=0,q=null; for(let i=0;i<t.length;i++){ const c=t[i]; if(q){ cur+=c; if(c==='\\'){ cur+=t[++i]||''; continue; } if(c===q) q=null; continue; } if(c==='"'||c==="'"){ q=c; cur+=c; continue; } if(c==='(') par++; if(c===')') par--; if(c===sep&&par===0){ parts.push(cur); cur=''; continue; } cur+=c; } if(cur.trim()) parts.push(cur); return parts; }
function parseBlock(t){ const nodes=[]; let i=0; const n=t.length;
  while(i<n){ // lê prelúdio até { ou ;
    let j=i,par=0,q=null; while(j<n){ const c=t[j]; if(q){ if(c==='\\'){ j+=2; continue; } if(c===q) q=null; j++; continue; } if(c==='"'||c==="'"){ q=c; j++; continue; } if(c==='(') par++; if(c===')') par--; if((c==='{'||c===';')&&par===0) break; j++; }
    if(j>=n) break; const pre=t.slice(i,j).trim();
    if(t[j]===';'){ i=j+1; continue; }
    // acha o } correspondente
    let d=1,k=j+1; q=null; par=0; while(k<n&&d>0){ const c=t[k]; if(q){ if(c==='\\'){ k+=2; continue; } if(c===q) q=null; k++; continue; } if(c==='"'||c==="'"){ q=c; k++; continue; } if(c==='(') par++; if(c===')') par--; if(par===0){ if(c==='{') d++; else if(c==='}') d--; } k++; }
    const body=t.slice(j+1,k-1);
    if(pre.startsWith('@')){ const m=pre.match(/^@([\w-]+)\s*(.*)$/s); const name=m[1]; if(/^(media|supports|layer)$/.test(name)) nodes.push({type:'atrule',name,params:m[2],children:parseBlock(body)}); else nodes.push({type:'atrule',name,params:m[2],children:[]}); }
    else { const decls=splitTop(body,';').map(s=>{ const x=s.indexOf(':'); if(x<0) return null; return {prop:s.slice(0,x).trim().toLowerCase(), value:s.slice(x+1).trim()}; }).filter(Boolean); nodes.push({type:'rule',selector:pre,decls}); }
    i=k; }
  return nodes; }
const root = {children: parseBlock(stripComments(css))};

function rgb2hsl(r,g,b){ r/=255;g/=255;b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; s=l>.5? d/(2-mx-mn): d/(mx+mn); switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;} h/=6; } return [h,s,l]; }
function hsl2rgb(h,s,l){ const f=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
  if(s===0){ const v=Math.round(l*255); return [v,v,v]; } const q=l<.5? l*(1+s): l+s-l*s, p=2*l-q; return [f(p,q,h+1/3),f(p,q,h),f(p,q,h-1/3)].map(v=>Math.round(v*255)); }
function map(r,g,b,a){
  if(r===0&&g===0&&b===0) return null;                 // sombras / véus pretos ficam
  const [h,s,l]=rgb2hsl(r,g,b);
  if(s>0.42 && l>0.3 && l<0.8) return null;            // cores de destaque (violeta, azul, verde, vermelho...) ficam
  if(s>0.42 && l>=0.8) { /* destaque claro usado como texto: escurece */ const [R,G,B]=hsl2rgb(h,s,Math.min(.45,1-l+.15)); return [R,G,B,a]; }
  let nl = 1-l; if (l<0.2) nl = Math.min(.99, 1.0-l*0.55); if (l>0.9) nl = Math.max(nl, .09); // fundos bem escuros viram quase branco
  const ns = Math.min(s, 0.35); const [R,G,B]=hsl2rgb(h,ns,nl); return [R,G,B,a];
}
function hexTo(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); if(h.length===4) h=h.split('').map(c=>c+c).join(''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); const a=h.length===8? parseInt(h.slice(6,8),16)/255:1; return [r,g,b,a]; }
const fmt=([r,g,b,a])=> a>=1? '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') : `rgba(${r},${g},${b},${+a.toFixed(3)})`;
function convertValue(v){
  let changed=false;
  v = v.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g,(m)=>{ const [r,g,b,a]=hexTo(m); const x=map(r,g,b,a); if(!x) return m; changed=true; return fmt(x); });
  v = v.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g,(m,r,g,b,a)=>{ const x=map(+r,+g,+b,a===undefined?1:+a); if(!x) return m; changed=true; return fmt(x); });
  if(/\b(white)\b/.test(v)){ v=v.replace(/\bwhite\b/g,'#0f1226'); changed=true; }
  return changed? v: null;
}
const PROPS=/^(background|background-color|background-image|color|border|border-top|border-right|border-bottom|border-left|border-color|border-top-color|border-bottom-color|border-left-color|border-right-color|outline|outline-color|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|-webkit-text-fill-color)$/;
const ACCENT_VAR=/var\(--(grad|violet|indigo)\)/;
const out=[]; 
function sel(s){ return s.split(',').map(x=>x.trim()).filter(Boolean).map(x=>{
    if(x===':root'||x==='html') return 'html.claro';
    if(x.startsWith('html')) return x.replace(/^html/,'html.claro');
    return 'html.claro '+x; }).join(',');}
function walk(node, wrap){
  (node.children).forEach(n=>{
    if(n.type==='atrule'){
      if(/keyframes|font-face|property/.test(n.name)) return;
      const inner=[]; const sub=[]; 
      // coleta recursiva
      const res=walkRules(n); if(res.length) out.push(`@${n.name} ${n.params}{${res.join('')}}`);
    } else if(n.type==='rule'){ const r=ruleOut(n); if(r) out.push(r); }
  });
}
function walkRules(parent){ const arr=[]; (parent.children).forEach(n=>{ if(n.type==='rule'){ const r=ruleOut(n); if(r) arr.push(r);} else if(n.type==='atrule' && !/keyframes|font-face/.test(n.name)){ const sub=walkRules(n); if(sub.length) arr.push(`@${n.name} ${n.params}{${sub.join('')}}`);} }); return arr; }
function ruleOut(rule){
  if(rule.selector.includes('claro')||!rule.decls) return null;
  if(/\.(tag|vistas|fav-btn|dest-rank|cv-leg|cv-[\w-]+)\b/.test(rule.selector) && !/::after/.test(rule.selector) ) return null;   // elementos sobre a foto da capa continuam escuros
  const decls=[];
  
  // fundo de destaque (botão violeta): texto claro fica claro
  let hasAccentColor=false; rule.decls.forEach(d=>{ if(/^background/.test(d.prop)){ if(ACCENT_VAR.test(d.value)) hasAccentColor=true; const hexes=d.value.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)||[]; for(const h of hexes){ const [r,g,b]=hexTo(h); const [,s,l]=rgb2hsl(r,g,b); if(s>0.42&&l>0.3&&l<0.8) hasAccentColor=true; } } });
  rule.decls.forEach(d=>{
    if(!PROPS.test(d.prop)) return;
    if(d.prop==='color' && hasAccentColor) return;
    if(/var\(--/.test(d.value) && !/#|rgba?\(/.test(d.value)) return;
    let v=convertValue(d.value);
    if(d.prop==='color' && /#6fd6ff/i.test(d.value)) v=(v||d.value).replace(/#6fd6ff/ig,'#1b8fc2');
    if(v===null) return;
    let prop=d.prop; if(prop==='background' && rule.decls.some(x=>/background-clip/.test(x.prop)) && /gradient\(/.test(d.value)) prop='background-image';
    decls.push(`${prop}:${v.replace(/\s*!important/,'')}!important`);
  });
  if(!decls.length) return null;
  return `${sel(rule.selector)}{${decls.join(';')}}`;
}
walk(root);
const extra = `@media (max-width:899px){html.claro .topbar{background:none!important;border:0!important;box-shadow:none!important}html.claro .tb-busca,html.claro .topbar .nt-btn{background:none!important;border:0!important}}\nhtml.claro .brand-ninja{filter:none!important}\n@media (max-width:899px){html.claro .brand-name{color:#7c6bd6!important}}\nhtml.claro *,html.claro *::before,html.claro *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}\nhtml.claro .ig-fundo,html.claro .pn-aurora{display:none!important}\nhtml.claro .nt-pn,html.claro .nt-bn,html.claro .nm,html.claro .sug{box-shadow:0 8px 24px -12px rgba(20,22,43,.25)!important}\nhtml.claro .nt-pn,html.claro .nt-bn{background:#ffffff!important}\nhtml.claro .bnav{box-shadow:0 4px 14px -8px rgba(20,22,43,.3)!important}\nhtml.claro .ch-tk.lido{color:#1a73e8!important}\nhtml.claro .ch-tk{color:#7a80a3!important}\nhtml.claro .perigo,html.claro .ch-menu .perigo,html.claro .ch-menu .perigo i{color:#d6385a!important}\nhtml.claro .chat-sec{background:#ffffff!important;--ch-bg:#ffffff;--ch-linha:rgba(20,22,43,.09)}\nhtml.claro .ch-m.ele{background:#eceef8!important;color:#14162b!important}\nhtml.claro .ch-m.ele .ch-h{color:#7a80a3!important}\nhtml.claro .ch-busca,html.claro .ch-form input{background:#f0f1f8!important}\nhtml.claro .ch-li.sel .ch-r{background:rgba(123,108,255,.13)!important}\nhtml.claro .ch-li.sel .ch-pv,html.claro .ch-li.sel .ch-hr{color:#5d6385!important}\nhtml.claro .ch-selb{background:#ffffff!important}\nhtml.claro .chp{background:#ffffff!important}\nhtml.claro .vistas,html.claro .cv-leg,html.claro .cv-leg p{color:#d9dcf0}\nhtml.claro .logo-ring img,html.claro .brand img,html.claro img[src^="/logo"]{filter:invert(1)}\n`;
const head = `/* Tema claro — gerado a partir do style.css (scripts/gerar-tema-claro) */
html.claro{color-scheme:light;--bg:#f4f5fb;--panel:#ffffff;--panel-2:#ffffff;--line:#dfe2f0;--text:#14162b;--muted:#5d6385;--ice:#1b8fc2;--amber:#a86a0c}
html.claro body{background:#f4f5fb;color:#14162b}
`;
fs.writeFileSync(''+__dirname+'/../tema-claro.css', head + out.join('\n') + '\n' + extra);
console.log('regras:', out.length, 'bytes:', fs.statSync(''+__dirname+'/../tema-claro.css').size);

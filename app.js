import { money, signedMoney, percent, profitFor, evaluateLatest, compareItems } from './economics.mjs';
'use strict';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const colors = ['#e4bf75','#85baff','#d9a0e8','#a9a1ff','#67cbd0','#f2a56f'];
const dt = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
const shortDate = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit'});
let data, byId, evaluations, selected, hours=0, hidden=new Set(), hoverPoints=[], plot;
const date = t => dt.format(new Date(t*1000));
function node(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;return e;}
function latest(item){return item.history.at(-1);}
function priceAt(id,t){const h=byId.get(id)?.history||[];let lo=0,hi=h.length-1,idx=-1;while(lo<=hi){const m=(lo+hi)>>1;if(h[m].t<=t){idx=m;lo=m+1;}else hi=m-1;}for(let i=idx;i>=0;i--)if(h[i].min!=null)return h[i].min;return null;}
function costAt(item,t){if(!item.recipe)return null;let total=0;for(const p of item.recipe.parts){const v=priceAt(p.id,t);if(v==null)return null;total+=v*p.qty;}return total/item.recipe.outQty;}
function list(){
 const query=$('search').value.trim().toLocaleLowerCase('ko');
 const items=data.items.filter(i=>(!$('craft-only').checked||i.recipe)&&(i.name.toLocaleLowerCase('ko').includes(query)||String(i.id).includes(query)));
 items.sort((a,b)=>compareItems(a,b,$('sort').value,evaluations));
 $('count').textContent=`${items.length}개 품목`;
 $('items').replaceChildren();
 for(const item of items){
  const ev=evaluations.get(item.id), b=document.createElement('button');
  b.className='item';b.type='button';b.setAttribute('aria-pressed',item.id===selected.id);
  const main=document.createElement('span');main.className='item-main';
  const n=document.createElement('span');n.className='item-name';n.textContent=item.name;
  const quote=document.createElement('span');quote.className='item-quote';quote.textContent=`판매 ${money(ev.sale)}${item.recipe?' / 재료 '+money(ev.cost):''}`;
  main.append(n,quote);
  const performance=document.createElement('span');performance.className='item-performance';
  const profit=document.createElement('span');profit.className=outcome(ev.profit);profit.textContent=item.recipe?signedMoney(ev.profit):'—';
  const margin=document.createElement('span');margin.className='item-margin';margin.textContent=item.recipe?(ev.profit==null?'시세 부족':percent(ev.margin)):'재료';
  performance.append(profit,margin);
  b.append(main,performance);b.onclick=()=>{selected=item;hidden.clear();list();render();};$('items').append(b);
 }
 if(!items.length){const p=document.createElement('p');p.className='muted';p.style.padding='16px';p.textContent='일치하는 품목이 없어요.';$('items').append(p);}
}
function outcome(value){return value==null?'neutral':value>0?'gain':value<0?'loss':'neutral';}
function render(){
 const item=selected, to=data.updated, from=hours?to-hours*3600:Math.min(...item.history.map(p=>p.t),to)-3600;
 const points=item.history.filter(p=>p.t>=from&&p.t<=to);
 const priced=points.filter(p=>p.min!=null), last=latest(item);
 $('item-title').textContent=item.name;
 $('category').textContent=`${item.recipe?'제작품':'재료 / 경매 품목'} · 아이템 ${item.id}`;
 $('latest').textContent=money(last?.min);$('average').textContent=money(priced.length?priced.reduce((s,p)=>s+p.min,0)/priced.length:null);
 $('quantity').textContent=last?.qty!=null?`${last.qty.toLocaleString('ko-KR')}개`:'—';$('cost').textContent=money(evaluations.get(item.id).cost);
 const ev=evaluations.get(item.id);
 $('profit-stats').hidden=!item.recipe;
 $('profit').textContent=signedMoney(ev.profit);$('profit').className=outcome(ev.profit);
 $('margin').textContent=percent(ev.margin);$('margin').className=outcome(ev.margin);
 $('valuation-note').textContent=item.recipe?(ev.profit==null?'판매가 또는 재료 시세가 부족해 이득을 계산할 수 없어요.':'이득 = 최근 판매가 × 95% − 최근 재료비. 수익률 = 이득 ÷ 재료비 × 100.'):'';
 $('chart-period').textContent=`${date(from)} ~ ${date(to)} (한국)`;
 document.querySelectorAll('[data-hours]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.hours)===hours));
 const series=[{key:'min',label:'경매 최저가',color:'#73d6ac',value:t=>priceAt(item.id,t),points:points.map(p=>({t:p.t,v:p.min}))}];
 if(item.recipe){series.push({key:'cost',label:'재료비 합계',color:'#ff9e93',value:t=>costAt(item,t),points:points.map(p=>({t:p.t,v:costAt(item,p.t)}))});item.recipe.parts.forEach((p,i)=>series.push({key:p.id,label:byId.get(p.id).name,color:colors[i%colors.length],value:t=>priceAt(p.id,t),points:points.map(r=>({t:r.t,v:priceAt(p.id,r.t)}))}));}
 $('legend').replaceChildren();
 for(const s of series){const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',!hidden.has(s.key));const sw=document.createElement('span');sw.className='swatch';sw.style.setProperty('--series-color',s.color);b.append(sw,document.createTextNode(s.label));b.onclick=()=>{hidden.has(s.key)?hidden.delete(s.key):hidden.add(s.key);render();};$('legend').append(b);}
 const svg=$('chart');svg.replaceChildren(node('title',{id:'chart-title'},`${item.name} 시세 그래프`),node('desc',{id:'chart-description'},'가로축은 한국 시각, 세로축은 개당 가격입니다. 상세 값은 시세 기록 표에 있습니다.'));
 const width=Math.max(280,svg.getBoundingClientRect().width),height=width<500?300:410;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 const x0=64,x1=width-12,y0=18,y1=height-60;
 const vals=series.filter(s=>!hidden.has(s.key)).flatMap(s=>s.points.map(p=>p.v).filter(v=>v!=null));
 const max=Math.max(1,...vals)*1.15, qtyMax=Math.max(1,...points.map(p=>p.qty||0));
 const x=t=>x0+(t-from)/Math.max(1,to-from)*(x1-x0), y=v=>y1-v/max*(y1-y0);
 for(let i=0;i<=4;i++){const yy=y1-(y1-y0)*i/4;svg.append(node('line',{x1:x0,x2:x1,y1:yy,y2:yy,class:'grid'}),node('text',{x:x0-12,y:yy+5,'text-anchor':'end'},money(max*i/4)));}
 const ticks=width<500?2:4;
 for(let i=0;i<=ticks;i++){const t=from+(to-from)*i/ticks;svg.append(node('text',{x:x(t),y:height-25,'text-anchor':i===0?'start':i===ticks?'end':'middle'},hours>24?shortDate.format(new Date(t*1000))+' '+date(t).split(' ').at(-1):date(t).split(' ').at(-1)));}
 const barWidth=Math.min(22,Math.max(2,(x1-x0)/Math.max(1,points.length)*.55));
 for(const p of points){const h=(p.qty||0)/qtyMax*(y1-y0)*.2;svg.append(node('rect',{x:Math.max(x0,x(p.t)-barWidth/2),y:y1-h,width:Math.min(barWidth,x1-Math.max(x0,x(p.t)-barWidth/2)),height:h,fill:'#98a6ba','fill-opacity':'.22'}));}
 for(const s of series){if(hidden.has(s.key))continue;let path='',active=false;for(const p of s.points){if(p.v==null){active=false;continue;}path+=`${active?'L':'M'}${x(p.t)},${y(p.v)} `;active=true;}svg.append(node('path',{d:path,class:'plot-line',stroke:s.color}));for(const p of s.points)if(p.v!=null)svg.append(node('circle',{cx:x(p.t),cy:y(p.v),r:3.5,fill:s.color,class:'dot'}));}
 svg.append(node('line',{id:'crosshair',x1:x0,x2:x0,y1:y0,y2:y1,stroke:'#c7d2e2','stroke-dasharray':'4 4',visibility:'hidden'}));
 $('empty').hidden=points.length>0;
 $('tooltip').hidden=true;
 hoverPoints=points;plot={x,x0,x1,y0,y1,series,width};
 $('recipe').hidden=!item.recipe;
 if(item.recipe){$('recipe').replaceChildren();const strong=document.createElement('strong');strong.textContent=`${item.name} ${item.recipe.outQty}개 제작`;const p=document.createElement('p');p.textContent=item.recipe.parts.map(r=>`${byId.get(r.id).name} × ${r.qty}`).join(' + ');$('recipe').append(strong,p);}
 $('rows').replaceChildren();for(const p of [...points].reverse()){const tr=document.createElement('tr');for(const value of [date(p.t),p.min==null?'매물 없음':money(p.min),(p.qty??0).toLocaleString('ko-KR')+'개',money(costAt(item,p.t)),signedMoney(profitFor(p.min,costAt(item,p.t)).profit),percent(profitFor(p.min,costAt(item,p.t)).margin)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('rows').append(tr);}
 $('record-count').textContent=`${points.length}건`;
}
$('chart').addEventListener('pointermove',e=>{
 if(!plot||!hoverPoints.length)return;
 const rect=$('chart').getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width*plot.width;
 if(px<plot.x0||px>plot.x1){hideTooltip();return;}
 const p=hoverPoints.reduce((a,b)=>Math.abs(plot.x(b.t)-px)<Math.abs(plot.x(a.t)-px)?b:a);
 const tip=$('tooltip');tip.replaceChildren();const title=document.createElement('strong');title.textContent=date(p.t)+' (한국)';tip.append(title);
 for(const s of plot.series){if(hidden.has(s.key))continue;const line=document.createElement('div'),label=document.createElement('span'),v=document.createElement('span');label.textContent=s.label;label.style.color=s.color;v.textContent=money(s.key==='min'?p.min:s.value(p.t));line.append(label,v);tip.append(line);}
 const q=document.createElement('div');q.textContent=`매물 수량 ${(p.qty||0).toLocaleString('ko-KR')}개`;tip.append(q);tip.hidden=false;
 tip.style.left=Math.max(0,Math.min(e.clientX-rect.left+16,rect.width-tip.offsetWidth))+'px';tip.style.top='20px';
 const cross=$('crosshair');cross.setAttribute('x1',plot.x(p.t));cross.setAttribute('x2',plot.x(p.t));cross.setAttribute('visibility','visible');
});
function hideTooltip(){$('tooltip').hidden=true;$('crosshair')?.setAttribute('visibility','hidden');}
$('chart').addEventListener('pointerleave',hideTooltip);
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>data&&render(),120);});
$('sort').addEventListener('change',()=>data&&list());
$('search').addEventListener('input',()=>data&&list());$('craft-only').addEventListener('change',()=>data&&list());
$('ranges').addEventListener('click',e=>{const b=e.target.closest('[data-hours]');if(b&&data){hours=Number(b.dataset.hours);render();}});
fetch('data.json?v='+document.querySelector('meta[name="data-version"]').content,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('data');return r.json();}).then(d=>{data=d;byId=new Map(d.items.map(i=>[i.id,i]));evaluations=new Map(d.items.map(i=>[i.id,evaluateLatest(i,byId)]));selected=[...d.items].filter(i=>i.recipe).sort((a,b)=>compareItems(a,b,'profit',evaluations))[0]||d.items[0];$('updated').textContent=`마지막 수집 ${date(d.updated)} (한국)`;list();render();}).catch(()=>{$('item-title').textContent='시세를 불러오지 못했어요';$('updated').textContent='시세 파일을 확인할 수 없습니다';$('error').hidden=false;$('error').textContent='페이지를 새로고침해 주세요. 계속 실패하면 시세 파일을 확인해 주세요.';});

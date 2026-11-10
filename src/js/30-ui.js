/* ===== interface: ícones, casca, páginas, gráficos ===== */
var DOT = '<circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>';
var ICON = {
  home:'<path d="M4 11.2 12 4l8 7.2V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  wallet:'<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3"/><path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z"/><circle cx="16.3" cy="13.5" r="1.2" fill="currentColor" stroke="none"/>',
  card:'<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 10h18M7 15h3"/>',
  chart:'<path d="M5 20v-8M12 20V4M19 20v-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  gear:'<path d="M4 7h8M17 7h3M4 12h2M11 12h9M4 17h10M19 17h1"/><circle cx="14.5" cy="7" r="2.3"/><circle cx="8.5" cy="12" r="2.3"/><circle cx="16.5" cy="17" r="2.3"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeoff:'<path d="M4 4l16 16"/><path d="M9.5 5.9A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.8 3.6M6 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.6-.8"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>',
  left:'<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  right:'<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  check:'<path d="M5.5 12.5l4.2 4.2L18.5 7.5"/>',
  alert:'<path d="M12 4.5 20.5 19h-17z"/><path d="M12 10.5v4M12 16.8v.2"/>',
  repeat:'<path d="M5 10.5a7 7 0 0 1 12.2-3.2L19 9.3"/><path d="M19 5v4.3h-4.3"/><path d="M19 13.5a7 7 0 0 1-12.2 3.2L5 14.7"/><path d="M5 19v-4.3h4.3"/>',
  cart:'<path d="M3 4.5h2.2l2.3 10h9.6l1.9-7H6.4"/><circle cx="9" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
  food:'<path d="M6 3.5v6a2 2 0 0 0 4 0v-6M8 3.5v17"/><path d="M17.5 20.5v-17c-2.2 1.2-3.5 3.5-3.5 6.5v3h3.5"/>',
  car:'<path d="M5 12l1.5-4.3a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 12"/><rect x="3.5" y="12" width="17" height="5.5" rx="1.5"/><path d="M6.5 17.5V19M17.5 17.5V19"/>',
  house:'<path d="M4 11.2 12 4l8 7.2V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M10 20v-5h4v5"/>',
  phone:'<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M11 17.5h2"/>',
  health:'<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  spark:'<path d="M11 4.5l1.8 4.7 4.7 1.8-4.7 1.8L11 17.5l-1.8-4.7L4.5 11l4.7-1.8z"/><path d="M18.5 15.5v4M16.5 17.5h4"/>',
  play:'<circle cx="12" cy="12" r="8.5"/><path d="M10.3 8.8v6.4l5-3.2z"/>',
  bag:'<path d="M6 8.5h12l1 11.5H5z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  book:'<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z"/><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3"/>',
  swap:'<path d="M4 8.5h15M16 5.5l3 3-3 3"/><path d="M20 15.5H5M8 12.5l-3 3 3 3"/>',
  percent:'<path d="M6 18 18 6"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  dots:DOT,
  brief:'<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12.5h17"/>',
  zap:'<path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12z"/>',
  trend:'<path d="M4 16.5l5.5-5.5 3.5 3.5L20 7.5"/><path d="M15 7.5h5v5"/>',
  undo:'<path d="M8 5 4 9l4 4"/><path d="M4 9h10a5.5 5.5 0 0 1 0 11H9"/>',
  tag:'<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12l8 8-7.6 7.6a1 1 0 0 1-1.4 0L4 12.5z"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/>',
  bank:'<path d="M4 10 12 4.5 20 10M5.5 10v7M10 10v7M14 10v7M18.5 10v7M4 19.5h16"/>',
  save:'<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  sheet:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.7v.2"/>',
  trash:'<path d="M5 7h14M10 4.5h4M7 7l.8 12a1 1 0 0 0 1 1h6.4a1 1 0 0 0 1-1L17 7M10.5 11v5.5M13.5 11v5.5"/>'
};
function ic(n,cls){ return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICON[n]||DOT)+'</svg>'; }
function money(n){ return S.set.hide ? 'R$ •••' : brl(n); }
function money0(n){ return S.set.hide ? '•••' : ((Math.round(n)<0?'−':'')+nf0.format(Math.abs(Math.round(n)))); }
function compact(v){
  if(S.set.hide) return '•••';
  var a=Math.abs(v), s=v<0?'−':'';
  return s+(a>=1000 ? (a/1000).toFixed(1).replace('.',',')+' mil' : String(Math.round(a)));
}
/* números grandes encolhem um pouco quando o valor é comprido, para nunca estourar a tela */
function figCls(txt){ return txt.length>13?' xs':(txt.length>11?' s':''); }
function avatar(cat,k){ return '<span class="av">'+ic(catInfo(cat,k).i)+'</span>'; }
function meter(pct,state){ return '<span class="meter'+(state?' '+state:'')+'"><i style="width:'+Math.max(0,Math.min(100,pct)).toFixed(1)+'%"></i></span>'; }

/* estado de navegação (não é salvo) */
var G = {tab:'home',month:curK(),cid:null,inv:null,wf:'all',wq:'',cseg:'list',cf:'all',cs:'date',cq:'',ccat:'',aseg:'spend',psel:null};
var scrollPos = {}, VIEWS = {}, AFTER = {}, ACT = {}, INP = {};

function applyTheme(){
  var t=S.set.theme, r=document.documentElement;
  if(t==='light'||t==='dark') r.setAttribute('data-theme',t); else r.removeAttribute('data-theme');
}
function renderBar(){
  var h;
  if(G.tab==='cards'){ h='<div class="bar-title">Cartões</div>'; }
  else {
    var cur=(G.month===curK());
    h='<div class="mnav">'+
      '<button type="button" class="ib" data-act="month" data-d="-1" aria-label="Mês anterior">'+ic('left')+'</button>'+
      '<button type="button" class="mlabel" data-act="monthNow" aria-label="'+esc(cap(mlong(G.month)))+(cur?'':'. Toque para voltar ao mês atual')+'">'+esc(mname(G.month))+' '+G.month.slice(0,4)+'</button>'+
      '<button type="button" class="ib" data-act="month" data-d="1" aria-label="Próximo mês">'+ic('right')+'</button>'+
      (cur?'':'<button type="button" class="nowchip" data-act="monthNow">Hoje</button>')+'</div>';
  }
  h+='<div class="bar-r">'+
    '<button type="button" class="ib" data-act="hide" aria-pressed="'+S.set.hide+'" aria-label="'+(S.set.hide?'Mostrar valores':'Ocultar valores')+'">'+ic(S.set.hide?'eyeoff':'eye')+'</button>'+
    '<button type="button" class="ib" data-act="settings" aria-label="Ajustes">'+ic('gear')+'</button></div>';
  $('bar').innerHTML='<div class="bar-in">'+h+'</div>';
}
var TABS = [['home','Início','home'],['wallet','Carteira','wallet'],null,['cards','Cartões','card'],['stats','Análise','chart']];
function renderTabs(){
  var h='';
  TABS.forEach(function(t){
    if(!t){ h+='<button type="button" class="plus" data-act="new" aria-label="Novo lançamento">'+ic('plus')+'</button>'; return; }
    h+='<button type="button" class="tab" data-act="tab" data-tab="'+t[0]+'"'+(G.tab===t[0]?' aria-current="page"':'')+'>'+ic(t[2])+'<span>'+t[1]+'</span></button>';
  });
  $('tabs').innerHTML='<div class="tabs-in">'+h+'</div>';
}
function render(){
  document.body.className='t-'+G.tab;
  renderBar(); renderTabs();
  $('view').innerHTML=VIEWS[G.tab]();
  if(AFTER[G.tab]) AFTER[G.tab]();
}
function go(tab){
  scrollPos[G.tab]=window.pageYOffset||0;
  var same=(tab===G.tab);
  G.tab=tab; render();
  window.scrollTo(0,same?0:(scrollPos[tab]||0));
}

/* aviso curto no rodapé */
var toastT=null;
function toast(msg){
  if(!msg) return;
  var t=$('toast'); t.textContent=msg; t.classList.remove('hide');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.add('hide'); },2800);
}
/* grava, redesenha e avisa */
function commit(msg){
  var ok=persist();
  render();
  if(stack.length && !stack[stack.length-1].form) refreshPage();
  toast(ok ? msg : (storageOk ? 'Não consegui salvar neste aparelho. Faça um backup em Ajustes.' : msg));
}

/* páginas em tela cheia (formulários e ajustes), empilháveis; o gesto de voltar fecha a de cima */
var stack = [], skipPop = 0, savedY = 0;
function shellHidden(on){ ['bar','view','tabs'].forEach(function(id){ $(id).classList.toggle('hide',on); }); $('page').classList.toggle('hide',!on); }
function showPage(){
  var p=stack[stack.length-1];
  $('page').innerHTML='<header class="pbar"><div class="bar-in"><button type="button" class="ib" data-act="back" aria-label="Voltar">'+ic('left')+'</button><h2>'+esc(p.title)+'</h2></div></header><div class="pbody" id="pbody"></div>';
  p.build($('pbody'));
  window.scrollTo(0,0);
  var hd=$('page').querySelector('h2');
  if(hd){ hd.setAttribute('tabindex','-1'); try{ hd.focus({preventScroll:true}); }catch(e){} }
}
function refreshPage(){
  if(!stack.length) return;
  var y=window.pageYOffset||0; stack[stack.length-1].build($('pbody')); window.scrollTo(0,y);
}
function openPage(p){
  if(!stack.length){ savedY=window.pageYOffset||0; shellHidden(true); }
  stack.push(p);
  try{ history.pushState({pg:stack.length},''); }catch(e){}
  showPage();
}
function doPop(){
  stack.pop();
  if(stack.length) showPage();
  else { $('page').innerHTML=''; shellHidden(false); window.scrollTo(0,savedY); }
}
function closePage(){
  if(!stack.length) return;
  var had=!!(history.state && history.state.pg);
  doPop();
  if(had){ skipPop++; try{ history.back(); }catch(e){ skipPop--; } }
}
function closeAllPages(){
  var n=stack.length; if(!n) return;
  var had=!!(history.state && history.state.pg);
  stack.length=1; doPop();
  if(had){ skipPop++; try{ history.go(-n); }catch(e){ skipPop--; } }
}
window.addEventListener('popstate',function(){
  if(skipPop>0){ skipPop--; return; }
  if(stack.length) doPop();
});

/* um único ouvinte de toque: cada botão diz o que faz em data-act */
document.addEventListener('click',function(e){
  var el=e.target.closest ? e.target.closest('[data-act]') : null; if(!el) return;
  var fn=ACT[el.getAttribute('data-act')]; if(fn) fn(el,e);
});
document.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ') && e.target.getAttribute && e.target.getAttribute('role')==='button' && e.target.tagName!=='BUTTON'){
    var fn=ACT[e.target.getAttribute('data-act')]; if(fn){ e.preventDefault(); fn(e.target,e); }
  }
});
document.addEventListener('input',function(e){
  var k=e.target.getAttribute ? e.target.getAttribute('data-inp') : null;
  if(k && INP[k]) INP[k](e.target);
});
function attr(el,n){ return el.getAttribute('data-'+n); }

ACT.tab=function(el){ go(attr(el,'tab')); };
ACT.month=function(el){ G.month=mk(mi(G.month)+(+attr(el,'d'))); G.psel=null; render(); };
ACT.monthNow=function(){ if(G.month!==curK()){ G.month=curK(); G.psel=null; render(); } };
ACT.hide=function(){ S.set.hide=!S.set.hide; persist(); render(); };
ACT.back=function(){ closePage(); };

/* ===== gráficos (SVG) =====
   Colunas finas com ponta arredondada e base reta, uma cor por série, rótulo só no que importa;
   os valores completos estão sempre na lista ou tabela ao lado. */
function fx(n){ return (Math.round(n*10)/10).toString(); }
function colUp(x,y,w,h,r){
  r=Math.min(r,w/2,h);
  return 'M'+fx(x)+','+fx(y+h)+'V'+fx(y+r)+'Q'+fx(x)+','+fx(y)+' '+fx(x+r)+','+fx(y)+'H'+fx(x+w-r)+'Q'+fx(x+w)+','+fx(y)+' '+fx(x+w)+','+fx(y+r)+'V'+fx(y+h)+'Z';
}
function colDown(x,y,w,h,r){
  r=Math.min(r,w/2,h);
  return 'M'+fx(x)+','+fx(y)+'H'+fx(x+w)+'V'+fx(y+h-r)+'Q'+fx(x+w)+','+fx(y+h)+' '+fx(x+w-r)+','+fx(y+h)+'H'+fx(x+r)+'Q'+fx(x)+','+fx(y+h)+' '+fx(x)+','+fx(y+h-r)+'Z';
}
function monthTick(k,i,n){ return (n>14 && i%2) ? '' : MESES[mi(k)%12]; }
/* colunas por mês com um mês em destaque */
function chartMonths(ms,vals,sel,act,label){
  var n=ms.length, W=358, H=132, padX=2, top=10, base=H-20, mx=Math.max.apply(null,vals.concat([1]));
  var slot=(W-padX*2)/n, bw=Math.max(3,Math.min(24,slot-2)), s='<line class="base" x1="'+padX+'" x2="'+(W-padX)+'" y1="'+base+'" y2="'+base+'"/>';
  ms.forEach(function(k,i){
    var bh=vals[i]>0?Math.max(2,vals[i]/mx*(base-top)):0, x=padX+i*slot+(slot-bw)/2;
    s+='<g role="button" tabindex="0" data-act="'+act+'" data-m="'+k+'" aria-label="'+esc(mlab(k)+': '+money(vals[i]))+'">'+
      (bh?'<path class="b'+(k===sel?' on':'')+'" d="'+colUp(x,base-bh,bw,bh,4)+'"/>':'')+
      '<rect class="hit" x="'+fx(padX+i*slot)+'" y="0" width="'+fx(slot)+'" height="'+H+'"/>'+
      '<text x="'+fx(padX+i*slot+slot/2)+'" y="'+(H-6)+'" text-anchor="middle"'+(k===sel?' class="v"':'')+'>'+monthTick(k,i,n)+'</text></g>';
  });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="'+esc(label)+'">'+s+'</svg>';
}
/* sobra (para cima, azul) ou falta (para baixo, vermelho) de cada mês */
function chartResult(P,sel){
  var n=P.length, W=358, H=170, padX=2, top=20, bottom=H-36;
  var vals=P.map(function(p){ return p.res; }), mx=Math.max.apply(null,vals.concat([0])), mn=Math.min.apply(null,vals.concat([0]));
  var range=(mx-mn)||1, zero=top+(mx/range)*(bottom-top), slot=(W-padX*2)/n, bw=Math.max(3,Math.min(24,slot-2)), s='';
  var iMax=vals.indexOf(mx), iMin=vals.indexOf(mn);
  P.forEach(function(p,i){
    var h=Math.abs(p.res)/range*(bottom-top), x=padX+i*slot+(slot-bw)/2, cx=padX+i*slot+slot/2, on=(p.k===sel);
    if(p.res!==0) h=Math.max(2,h);
    s+='<g role="button" tabindex="0" data-act="psel" data-m="'+p.k+'" aria-label="'+esc(mlab(p.k)+': '+(p.res<0?'falta ':'sobra ')+money(Math.abs(p.res)))+'">';
    if(p.res>0) s+='<path class="pos'+(sel&&!on?' dim':'')+'" d="'+colUp(x,zero-h,bw,h,4)+'"/>';
    if(p.res<0) s+='<path class="neg'+(sel&&!on?' dim':'')+'" d="'+colDown(x,zero,bw,h,4)+'"/>';
    if((i===iMax && mx>0) || (i===iMin && mn<0) || on){
      var ty=p.res>=0?(zero-h-5):(zero+h+13);
      s+='<text class="v" x="'+fx(Math.min(W-22,Math.max(22,cx)))+'" y="'+fx(ty)+'" text-anchor="middle">'+compact(p.res)+'</text>';
    }
    s+='<rect class="hit" x="'+fx(padX+i*slot)+'" y="0" width="'+fx(slot)+'" height="'+H+'"/>'+
      '<text x="'+fx(cx)+'" y="'+(H-6)+'" text-anchor="middle"'+(on?' class="v"':'')+'>'+monthTick(p.k,i,n)+'</text></g>';
  });
  s='<line class="base" x1="'+padX+'" x2="'+(W-padX)+'" y1="'+fx(zero)+'" y2="'+fx(zero)+'"/>'+s;
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Sobra ou falta de cada mês">'+s+'</svg>';
}
/* saldo acumulado ao fim de cada mês */
function chartBalance(P,sel){
  var n=P.length, W=358, H=150, padX=2, top=22, bottom=H-34;
  var vals=P.map(function(p){ return p.end; }), mx=Math.max.apply(null,vals.concat([0])), mn=Math.min.apply(null,vals.concat([0]));
  var range=(mx-mn)||1, slot=(W-padX*2)/n, zero=top+(mx/range)*(bottom-top);
  function X(i){ return padX+i*slot+slot/2; }
  function Y(v){ return top+((mx-v)/range)*(bottom-top); }
  var line='', s='';
  P.forEach(function(p,i){ line+=(i?'L':'M')+fx(X(i))+','+fx(Y(p.end)); });
  s+='<path class="ar" d="'+line+'L'+fx(X(n-1))+','+fx(zero)+'L'+fx(X(0))+','+fx(zero)+'Z"/>';
  s+='<line class="base" x1="'+padX+'" x2="'+(W-padX)+'" y1="'+fx(zero)+'" y2="'+fx(zero)+'"/>';
  s+='<path class="ln" d="'+line+'"/>';
  var iMin=vals.indexOf(Math.min.apply(null,vals)), iSel=-1;
  P.forEach(function(p,i){ if(p.k===sel) iSel=i; });
  var marks={}; marks[n-1]=1; marks[iMin]=1; if(iSel>-1) marks[iSel]=1;
  P.forEach(function(p,i){
    if(marks[i]){
      var y=Y(p.end), above=(y-9>12);
      s+='<circle class="dot" cx="'+fx(X(i))+'" cy="'+fx(y)+'" r="4"/>'+
        '<text class="v" x="'+fx(Math.min(W-26,Math.max(26,X(i))))+'" y="'+fx(above?y-9:y+18)+'" text-anchor="middle">'+compact(p.end)+'</text>';
    }
    s+='<g role="button" tabindex="0" data-act="psel" data-m="'+p.k+'" aria-label="'+esc(mlab(p.k)+': '+money(p.end))+'">'+
      '<rect class="hit" x="'+fx(padX+i*slot)+'" y="0" width="'+fx(slot)+'" height="'+H+'"/>'+
      '<text x="'+fx(X(i))+'" y="'+(H-6)+'" text-anchor="middle"'+(i===iSel?' class="v"':'')+'>'+monthTick(p.k,i,n)+'</text></g>';
  });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Saldo acumulado ao fim de cada mês">'+s+'</svg>';
}

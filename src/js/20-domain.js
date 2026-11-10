/* ===== cartões: faturas, parcelas e limite ===== */
function card(id){ for(var i=0;i<S.cards.length;i++){ if(S.cards[i].id===id) return S.cards[i]; } return null; }
function occ(it,k){ var n=mi(k)-mi(it.f)+1; return (n>=1&&n<=it.t)?n:0; }
function iv(it,n){ return (n===1 && it.v1!=null) ? it.v1 : it.v; }
function itTotal(it){ return r2((it.v1!=null?it.v1:it.v)+it.v*(it.t-1)); }
/* faturas só existem a partir do mês em que o cartão começou a ser acompanhado (S.start) */
function invRows(k,cid){
  var out=[]; if(mi(k)<mi(S.start)) return out;
  S.items.forEach(function(it){ if(it.c!==cid) return; var n=occ(it,k); if(n) out.push({it:it,n:n,v:iv(it,n)}); });
  return out;
}
function invTotal(k,cid){
  if(mi(k)<mi(S.start)) return 0;
  var s=0; S.items.forEach(function(it){ if(it.c!==cid) return; var n=occ(it,k); if(n) s+=ct(iv(it,n)); });
  return s/100;
}
/* mês da fatura (o do vencimento) em que cai uma compra feita na data dada.
   Compra feita no dia do fechamento já entra na fatura seguinte, como na maioria dos bancos. */
function invoiceFor(dateIso,cd){
  var p=dateIso.split('-').map(Number), i=p[0]*12+p[1]-1;
  if(p[2]>=cd.closing) i+=1;
  if(cd.due<=cd.closing) i+=1;
  return mk(Math.max(i,mi(S.start)));
}
function lastIdx(cid){
  var m=Math.max(mi(S.start),mi(curK()));
  S.items.forEach(function(it){ if(it.c!==cid) return; var e=mi(it.f)+it.t-1; if(e>m) m=e; });
  return m;
}
function months(cid){
  var a=[], last=lastIdx(cid);
  for(var i=Math.min(mi(S.start),mi(curK())); i<=last; i++) a.push(mk(i));
  return a;
}
function firstOpen(cid){
  var ms=months(cid);
  for(var i=0;i<ms.length;i++){ if(!S.paid[cid+':'+ms[i]] && invTotal(ms[i],cid)>0) return ms[i]; }
  return curK();
}
function usedNoAdj(cid){
  var t=0; months(cid).forEach(function(k){ if(!S.paid[cid+':'+k]) t+=ct(invTotal(k,cid)); });
  return t/100;
}
function limitInfo(cd){
  var u=r2(usedNoAdj(cd.id)+cd.adj);
  return {limit:cd.limit,used:u,avail:r2(cd.limit-u),pct:cd.limit>0?Math.min(100,Math.max(0,u/cd.limit*100)):0};
}
function meterState(pct,over){ return over?'over':(pct>=85?'warn':''); }

/* ===== carteira: receitas e despesas fora do cartão ===== */
function recById(id){ for(var i=0;i<S.rec.length;i++){ if(S.rec[i].id===id) return S.rec[i]; } return null; }
function txById(id){ for(var i=0;i<S.tx.length;i++){ if(S.tx[i].id===id) return S.tx[i]; } return null; }
function itemById(id){ for(var i=0;i<S.items.length;i++){ if(S.items[i].id===id) return S.items[i]; } return null; }
function recOcc(r,k){
  var i=mi(k); if(i<mi(r.from) || (r.to && i>mi(r.to))) return null;
  var o=S.ov[r.id+':'+k]||{}; if(o.skip) return null;
  var dt=isoDate(k,o.day||r.day);
  var done=o.done===1 ? true : (o.done===0 ? false : (!!r.auto && dt<=todayIso()));
  return {key:r.id+':'+k,rid:r.id,m:k,k:r.k,d:o.d||r.d,v:o.v!=null?o.v:r.v,cat:o.cat||r.cat,dt:dt,done:done,
    n:i-mi(r.from)+1,t:r.to?mi(r.to)-mi(r.from)+1:0};
}
function walletRows(k){
  var a=[];
  S.tx.forEach(function(x){ if(x.dt.slice(0,7)===k) a.push({key:x.id,id:x.id,k:x.k,d:x.d,v:x.v,cat:x.cat,dt:x.dt,done:x.done}); });
  S.rec.forEach(function(r){ var o=recOcc(r,k); if(o) a.push(o); });
  return a;
}
function invoiceRows(k){
  var a=[];
  S.cards.forEach(function(c){
    var t=invTotal(k,c.id);
    if(t>0) a.push({key:'inv:'+c.id+':'+k,inv:c.id,m:k,k:'out',d:'Fatura '+c.name,v:t,cat:'fatura',dt:isoDate(k,c.due),done:!!S.paid[c.id+':'+k]});
  });
  return a;
}
function byDate(a,b){ return a.dt<b.dt?-1:a.dt>b.dt?1:(a.k!==b.k?(a.k==='in'?-1:1):a.d.localeCompare(b.d)); }
function monthRows(k){ return walletRows(k).concat(invoiceRows(k)).sort(byDate); }
function monthSum(k){
  var s={inc:0,incD:0,exp:0,expD:0,inv:0,invD:0};
  walletRows(k).forEach(function(r){ var c=ct(r.v); if(r.k==='in'){ s.inc+=c; if(r.done) s.incD+=c; } else { s.exp+=c; if(r.done) s.expD+=c; } });
  invoiceRows(k).forEach(function(r){ var c=ct(r.v); s.inv+=c; if(r.done) s.invD+=c; });
  Object.keys(s).forEach(function(x){ s[x]/=100; });
  s.res=r2(s.inc-s.exp-s.inv); s.toPay=r2(s.exp-s.expD+s.inv-s.invD); s.toRecv=r2(s.inc-s.incD);
  return s;
}
function firstMonth(){
  var m=mi(curK());
  S.tx.forEach(function(x){ var i=mi(x.dt.slice(0,7)); if(i<m) m=i; });
  S.rec.forEach(function(r){ var i=mi(r.from); if(i<m) m=i; });
  if(S.items.length){ var s=mi(S.start); if(s<m) m=s; }
  return m;
}
/* o que ficou sem pagar ou receber em meses anteriores a k */
function pendingBefore(k){
  var out=[], a=Math.max(firstMonth(),mi(k)-36);
  for(var i=a;i<mi(k);i++){ monthRows(mk(i)).forEach(function(r){ if(!r.done) out.push(r); }); }
  return out;
}
function setDone(key,val){
  var p=key.split(':');
  if(p.length===3 && p[0]==='inv'){ var pk=p[1]+':'+p[2]; if(val) S.paid[pk]=true; else delete S.paid[pk]; return; }
  if(p.length===2){ var o=S.ov[key]||(S.ov[key]={}); o.done=val?1:0; return; }
  var x=txById(key); if(x) x.done=!!val;
}
function rowByKey(key){
  var p=key.split(':');
  if(p.length===3 && p[0]==='inv') return {key:key,inv:p[1],m:p[2]};
  if(p.length===2){ var r=recById(p[0]); return r?recOcc(r,p[1]):null; }
  var x=txById(key); return x?{key:x.id,id:x.id,k:x.k,d:x.d,v:x.v,cat:x.cat,dt:x.dt,done:x.done}:null;
}

/* saldo em conta = saldo de abertura + tudo que já foi marcado como recebido − pago − faturas pagas */
function netDone(){
  var s=0, cur=mi(curK());
  S.tx.forEach(function(x){ if(x.done) s+=(x.k==='in'?1:-1)*ct(x.v); });
  S.rec.forEach(function(r){
    var a=mi(r.from), b=Math.min(r.to?mi(r.to):cur+24,cur+24);
    for(var i=a;i<=b;i++){ var o=recOcc(r,mk(i)); if(o && o.done) s+=(o.k==='in'?1:-1)*ct(o.v); }
  });
  Object.keys(S.paid).forEach(function(key){ var m=/^([\w-]+):(\d{4}-\d{2})$/.exec(key); if(m && card(m[1])) s-=ct(invTotal(m[2],m[1])); });
  return s/100;
}
function balance(){ return S.open==null ? null : r2(S.open+netDone()); }
/* projeção a partir do mês atual: resultado planejado de cada mês (res) e acumulado (end).
   Com saldo em conta informado, o acumulado parte do saldo de hoje e soma só o que ainda falta acontecer
   (inclusive pendências de meses anteriores). Sem saldo, é a soma simples das sobras e faltas. */
function projection(n){
  var cur=mi(curK()), bal=balance(), acc=(bal==null?0:bal), out=[], lateIn=0, lateOut=0;
  if(bal!=null) pendingBefore(curK()).forEach(function(r){ if(r.k==='in') lateIn+=ct(r.v); else lateOut+=ct(r.v); });
  for(var j=0;j<n;j++){
    var k=mk(cur+j), s=monthSum(k);
    if(bal==null) acc=r2(acc+s.res);
    else acc=r2(acc+s.toRecv-s.toPay+(j===0?(lateIn-lateOut)/100:0));
    out.push({k:k,inc:s.inc,exp:s.exp,inv:s.inv,res:s.res,end:acc});
  }
  return out;
}

/* gastos por categoria no mês: despesas da carteira + o que cai nas faturas que vencem no mês */
function spendByCat(k){
  var o={};
  function add(cat,v){ var id=catInfo(cat,'out').id; o[id]=(o[id]||0)+ct(v); }
  walletRows(k).forEach(function(r){ if(r.k==='out') add(r.cat,r.v); });
  S.cards.forEach(function(c){ invRows(k,c.id).forEach(function(r){ add(r.it.cat,r.v); }); });
  Object.keys(o).forEach(function(id){ o[id]/=100; });
  return o;
}
function spendTotal(k){ var s=monthSum(k); return r2(s.exp+s.inv); }
function catEntries(k,cat){
  var a=[];
  walletRows(k).forEach(function(r){ if(r.k==='out' && catInfo(r.cat,'out').id===cat) a.push({d:r.d,v:r.v,dt:r.dt,src:'Carteira',key:r.key}); });
  S.cards.forEach(function(c){ invRows(k,c.id).forEach(function(r){
    if(catInfo(r.it.cat,'out').id===cat) a.push({d:r.it.d,v:r.v,dt:r.it.dt,src:c.name,item:r.it.id,n:r.n,t:r.it.t});
  }); });
  return a.sort(function(x,y){ return y.v-x.v; });
}
function invCats(k,cid){
  var o={}; invRows(k,cid).forEach(function(r){ var id=catInfo(r.it.cat,'out').id; o[id]=(o[id]||0)+ct(r.v); });
  Object.keys(o).forEach(function(id){ o[id]/=100; });
  return o;
}

/* lembrete de backup: os dados vivem só neste aparelho */
function needBackup(){
  if(recordCount()<5) return false;
  var t=todayIso();
  if(S.set.snooze && S.set.snooze>t) return false;
  if(!validIso(S.set.bk)) return true;
  return dayDiff(t,S.set.bk)>=15;
}

/* ===== utilidades ===== */
var APP_VERSION = '__VERSION__';
var MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
var MESES_L = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var DIAS = ['dom','seg','ter','qua','qui','sex','sáb'];
var nf = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
var nf0 = new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});

function $(id){ return document.getElementById(id); }
function pad(n){ return String(n).padStart(2,'0'); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function r2(v){ return Math.round(v*100)/100; }
function ct(v){ return Math.round(v*100); }
function brl(n){ n = r2(n)||0; return (n<0?'−':'')+'R$ '+nf.format(Math.abs(n)); }
function plural(n,one,many){ return n+' '+(n===1?one:many); }

/* meses e datas: mês como 'AAAA-MM', dia como 'AAAA-MM-DD' */
function mi(k){ var p=k.split('-'); return (+p[0])*12+(+p[1])-1; }
function mk(i){ return Math.floor(i/12)+'-'+pad(i%12+1); }
function mlab(k){ var i=mi(k); return MESES[i%12]+'/'+String(Math.floor(i/12)).slice(2); }
function mname(k){ return MESES_L[mi(k)%12]; }
function mlong(k){ return mname(k)+' de '+k.slice(0,4); }
function todayIso(){ var d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function curK(){ return todayIso().slice(0,7); }
function daysIn(k){ var p=k.split('-'); return new Date(+p[0],+p[1],0).getDate(); }
function isoDate(k,day){ return k+'-'+pad(Math.min(Math.max(1,day),daysIn(k))); }
function toDate(iso){ var p=iso.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
function dayDiff(a,b){ return Math.round((toDate(a)-toDate(b))/864e5); }
function dshort(iso){ var p=iso.split('-'); return p[2]+'/'+p[1]; }
function dfull(iso){ var p=iso.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function wday(iso){ return DIAS[toDate(iso).getDay()]; }
function validK(s){ return typeof s==='string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s); }
function validIso(s){
  if(typeof s!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var p=s.split('-'), d=toDate(s);
  return d.getFullYear()===+p[0] && d.getMonth()===+p[1]-1 && d.getDate()===+p[2];
}
function uid(p){ return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function cleanId(s){ return String(s==null?'':s).replace(/[^\w-]/g,'').slice(0,40); }
function plain(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase(); }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

/* campo de dinheiro: digita só números e os centavos entram sozinhos (1299 vira 12,99) */
function fmtInput(v){ return v>0 ? nf.format(v) : ''; }
function maskMoney(el){
  var d=el.value.replace(/\D/g,'').replace(/^0+/,'').slice(0,11);
  el.value = d ? nf.format((+d)/100) : '';
}
function moneyVal(el){ var d=el.value.replace(/\D/g,''); return d ? (+d)/100 : NaN; }
function bindMoney(el,cb){ el.addEventListener('input',function(){ maskMoney(el); if(cb) cb(); }); }

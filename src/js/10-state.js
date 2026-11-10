/* ===== categorias ===== */
var CATS = [
  {id:'mercado',n:'Mercado',s:'Mercado',i:'cart',k:'out'},
  {id:'alim',n:'Alimentação',s:'Alimentação',i:'food',k:'out'},
  {id:'transp',n:'Transporte',s:'Transporte',i:'car',k:'out'},
  {id:'casa',n:'Casa e contas',s:'Casa',i:'house',k:'out'},
  {id:'serv',n:'Assinaturas e serviços',s:'Assinaturas',i:'phone',k:'out'},
  {id:'saude',n:'Saúde',s:'Saúde',i:'health',k:'out'},
  {id:'beleza',n:'Beleza e cuidados',s:'Beleza',i:'spark',k:'out'},
  {id:'lazer',n:'Lazer',s:'Lazer',i:'play',k:'out'},
  {id:'compras',n:'Compras',s:'Compras',i:'bag',k:'out'},
  {id:'educ',n:'Educação',s:'Educação',i:'book',k:'out'},
  {id:'pix',n:'Pix e transferências',s:'Pix',i:'swap',k:'out'},
  {id:'fin',n:'Taxas e juros',s:'Taxas',i:'percent',k:'out'},
  {id:'reserva',n:'Reservas e objetivos',s:'Reservas',i:'target',k:'out'},
  {id:'outros',n:'Outros',s:'Outros',i:'dots',k:'out'},
  {id:'sal',n:'Salário',s:'Salário',i:'brief',k:'in'},
  {id:'extra',n:'Renda extra',s:'Renda extra',i:'zap',k:'in'},
  {id:'rend',n:'Rendimentos',s:'Rendimentos',i:'trend',k:'in'},
  {id:'reemb',n:'Reembolsos',s:'Reembolsos',i:'undo',k:'in'},
  {id:'outin',n:'Outras receitas',s:'Outras',i:'dots',k:'in'}
];
var BASE = {}; CATS.forEach(function(c){ BASE[c.id]=c; });
var FATURA = {id:'fatura',n:'Fatura do cartão',s:'Fatura',i:'card',k:'out'};

/* palpite de categoria pela descrição; a ordem importa (a primeira regra que casar vence) */
var RULES_OUT = [
  ['serv',/ANTHROPIC|CLAUDE|NETFLIX|SPOTIFY|DISNEY|\bHBO\b|YOUTUBE|GOOGLE|APPLE|ICLOUD|CLARO|\bVIVO\b|\bTIM\b|INTERNET|PRIME VIDEO|GLOBOPLAY|DEEZER|MICROSOFT|OPENAI|CHATGPT|CANVA|CELULAR|TELEFONE/],
  ['fin',/ANUIDADE|\bIOF\b|TARIFA|JUROS|ENCARGO|MULTA|SEGURO/],
  ['transp',/UBER|99\*|\b99\b|BUSER|PASSDEONIBUS|RECARGA TRANS|POSTO |COMBUST|GASOLINA|ETANOL|ESTACIONA|SEM ?PARAR|PEDAGIO|CABIFY|ONIBUS|METRO\b|PASSAGEM/],
  ['saude',/DROG|FARMA|RAIA|NISSEI|PAGUE MENOS|HOSPITAL|CLINIC|LABORAT|WELLHUB|GYMPASS|ACADEMIA|SMART ?FIT|ODONTO|DENTISTA|MEDIC|EXAME|UNIMED|PLANO DE SAUDE/],
  ['beleza',/BARBEARIA|BARBEIRO|BOTICARIO|SALAO|BELEZA|PERFUM|COSMET|NATURA|MANICURE|CABELEIREIR/],
  ['alim',/IFD\*|IFOOD|BURGER|HAMBURG|ACAI|PIZZ|RESTAUR|LANCH|\bBAR\b|CAFE|PADARIA|GOURMET|SORVET|PASTEL|RAPPI|MC ?DONALD|SUBWAY|CHURRAS|ESPETO|DOCERIA|CONFEITARIA|ALMOCO|JANTAR/],
  ['mercado',/SUPERMERC|MERCADO(?! ?LIVRE| ?PAGO)|ATACAD|ASSAI|CARREFOUR|SAMS CLUB|HORTIFRUTI|ACOUGUE|SACOLAO|PAO DE ACUCAR|MERCEARIA|EMPORIO|FEIRA/],
  ['casa',/ALUGUEL|CONDOMINIO|ENERGIA|CPFL|ENEL|SABESP|\bAGUA\b|\bLUZ\b|\bGAS\b|IPTU|LEROY|TELHANORTE|MOVEIS|FAXINA|DIARISTA/],
  ['educ',/ESCOLA|FACULDADE|CURSO|UDEMY|ALURA|LIVRARIA|MENSALIDADE|COLEGIO|UNIVERSIDADE|MATERIAL ESCOLAR/],
  ['lazer',/AIRBNB|CINEMA|INGRESSO|SYMPLA|HOTEL|BOOKING|DECATHLON|CENTAURO|PARQUE|STEAM|PLAYSTATION|XBOX|VIAGEM|\bCVC\b|LATAM|\bSHOW\b/],
  ['compras',/AMAZON|MERCADO ?LIVRE|SHOPEE|MAGALU|CASAS BAHIA|POLO WEAR|INDITEX|\bZARA\b|RENNER|RIACHUELO|FASHION|OUTLET|\bODP\b|\bTNG\b|LOJA|SHEIN|ALIEXPRESS|AMERICANAS/],
  ['reserva',/RESERVA|POUPANCA|INVESTIMENTO|TESOURO|\bCDB\b/],
  ['pix',/PICPAY|\bPIX\b|TRANSFER|MERCADO ?PAGO|PAGSEGURO|PAGBANK|RECARGAPAY|\bTED\b/]
];
var RULES_IN = [
  ['sal',/SALARIO|HOLERITE|ADIANTAMENTO|PAGAMENTO|DECIMO|\bVALE\b|FERIAS/],
  ['extra',/FREELA|EXTRA|BICO|VENDA|COMISSAO|BONUS/],
  ['rend',/RENDIMENTO|DIVIDENDO|JUROS|\bCDB\b|POUPANCA|ALUGUEL/],
  ['reemb',/REEMBOLSO|ESTORNO|DEVOLU|RESTITUI/]
];
function guessCat(d,k){
  var u=plain(d), rules=(k==='in')?RULES_IN:RULES_OUT;
  for(var i=0;i<rules.length;i++){ if(rules[i][1].test(u)) return rules[i][0]; }
  return k==='in'?'outin':'outros';
}
function catValid(id,k,custom){
  if(typeof id!=='string') return false;
  if(BASE[id]) return BASE[id].k===k;
  for(var i=0;i<custom.length;i++){ if(custom[i].id===id && custom[i].k===k) return true; }
  return false;
}
function catInfo(id,k){
  if(id==='fatura') return FATURA;
  if(BASE[id]) return BASE[id];
  for(var i=0;i<S.cats.length;i++){ if(S.cats[i].id===id) return {id:id,n:S.cats[i].n,s:S.cats[i].n,i:'tag',k:S.cats[i].k}; }
  return BASE[k==='in'?'outin':'outros'];
}
function catsOf(k){
  var base=CATS.filter(function(c){ return c.k===k; }), last=base.pop();
  var mine=S.cats.filter(function(c){ return c.k===k; }).map(function(c){ return {id:c.id,n:c.n,s:c.n,i:'tag',k:k}; });
  return base.concat(mine,[last]);
}

/* ===== estado =====
   cards:  [{id,name,last4,limit,adj,closing,due,goal}]
   items:  compras no cartão [{id,c,d,v,v1?,t,f,dt,cat}]  v = parcela, v1 = 1ª parcela quando difere, f = mês da 1ª fatura
   paid:   {'cartao:AAAA-MM': true}  faturas pagas
   tx:     lançamentos avulsos da carteira [{id,k:'in'|'out',d,v,dt,cat,done}]
   rec:    lançamentos que repetem [{id,k,d,v,day,cat,from,to|null,auto}]
   ov:     ajustes de um mês de um recorrente {'rec:AAAA-MM': {done,v,d,cat,day,skip}}
   bud:    orçamento por categoria {cat: valor}; budTot: teto do mês
   goals:  objetivos [{id,n,target,saved,due}]
   cats:   categorias criadas pelo usuário [{id,n,k}]
   open:   saldo de abertura (null = não acompanha saldo); saldo = open + tudo que já foi pago/recebido */
var LS_KEY = 'faturas_casasbahia_v1', LS_PRE = 'faturas_copia_antes_v6', VER = 6;
var S = null, storageOk = true;

function defSet(){ return {theme:'auto',hide:false,pay:'w',bk:'',snooze:'',news:false}; }
function fresh(){
  return {v:VER,start:curK(),paid:{},cards:[],items:[],tx:[],rec:[],ov:{},bud:{},budTot:0,goals:[],cats:[],open:null,set:defSet()};
}

/* Aceita qualquer versão antiga (v1 a v5) e devolve o estado no formato atual, sem perder lançamentos. */
function normalize(d){
  if(!d || typeof d!=='object' || !Array.isArray(d.items)) return null;
  var v0=+d.v||1, n=fresh(), seen={};
  function take(id,p){ var s=cleanId(id); if(!s || seen[s]) s=uid(p); seen[s]=1; return s; }
  function pos(x){ x=+x; return (isFinite(x) && x>0) ? r2(x) : 0; }
  n.start = validK(d.start) ? d.start : curK();

  if(Array.isArray(d.cats)) d.cats.forEach(function(c){
    if(!c || typeof c.n!=='string' || !c.n.trim()) return;
    var id=cleanId(c.id); if(!id || BASE[id] || id==='fatura' || seen[id]) id=uid('u'); seen[id]=1;
    n.cats.push({id:id,n:c.n.trim().slice(0,30),k:c.k==='in'?'in':'out'});
  });

  var legacy=!Array.isArray(d.cards), cardIds={}, cardMap={}, oldCg={};
  function addCard(c){
    var cl=Math.round(+c.closing), du=Math.round(+c.due), adj=+c.adj, id=take(c.id,'c');
    n.cards.push({id:id,name:String(c.name||'Cartão').slice(0,40),last4:String(c.last4||'').replace(/\D/g,'').slice(0,4),
      limit:pos(c.limit),adj:isFinite(adj)?r2(adj):0,closing:(cl>=1&&cl<=28)?cl:6,due:(du>=1&&du<=28)?du:20,goal:pos(c.goal)});
    cardIds[id]=1; cardMap[cleanId(c.id)]=id;
    if(c.cg && typeof c.cg==='object') Object.keys(c.cg).forEach(function(k){ var v=pos(c.cg[k]); if(v) oldCg[k]=r2((oldCg[k]||0)+v); });
    return id;
  }
  if(!legacy) d.cards.forEach(function(c){ if(c && typeof c.name==='string') addCard(c); });
  if(!n.cards.length && (legacy || d.items.length)) addCard({id:'c1',name:'Meu cartão',closing:d.closing,due:d.due});
  var firstCard=n.cards.length?n.cards[0].id:null;

  d.items.forEach(function(x){
    if(!x || typeof x.d!=='string' || typeof x.v!=='number' || !isFinite(x.v) || !firstCard) return;
    var t=Math.round(+x.t); if(!(t>=1&&t<=120)) return;
    if(!validK(x.f)) return;
    var c=cardMap[cleanId(x.c)], cat=catValid(x.cat,'out',n.cats)?x.cat:guessCat(x.d,'out');
    if(v0<6){ var g=guessCat(x.d,'out'); if(cat==='outros') cat=g; else if(cat==='serv' && g==='fin') cat='fin'; }
    var it={id:take(x.id,'i'),c:c||firstCard,d:x.d.slice(0,120),v:r2(x.v),t:t,f:x.f,dt:validIso(x.dt)?x.dt:(x.f+'-01'),cat:cat};
    var v1=pos(x.v1); if(v1 && t>1 && v1!==it.v) it.v1=v1;
    n.items.push(it);
  });

  if(d.paid && typeof d.paid==='object') Object.keys(d.paid).forEach(function(key){
    if(!d.paid[key]) return;
    var m=/^([\w-]+):(\d{4}-\d{2})$/.exec(key);
    if(/^\d{4}-\d{2}$/.test(key)){ if(firstCard) n.paid[firstCard+':'+key]=true; }
    else if(m && cardMap[m[1]]) n.paid[cardMap[m[1]]+':'+m[2]]=true;
  });

  if(Array.isArray(d.tx)) d.tx.forEach(function(x){
    if(!x || typeof x.d!=='string' || !pos(x.v) || !validIso(x.dt)) return;
    var k=x.k==='in'?'in':'out';
    n.tx.push({id:take(x.id,'t'),k:k,d:x.d.slice(0,120),v:pos(x.v),dt:x.dt,cat:catValid(x.cat,k,n.cats)?x.cat:guessCat(x.d,k),done:!!x.done});
  });

  var recIds={}, idMap={};
  if(Array.isArray(d.rec)) d.rec.forEach(function(x){
    if(!x || typeof x.d!=='string' || !pos(x.v) || !validK(x.from)) return;
    var k=x.k==='in'?'in':'out', day=Math.round(+x.day), id=take(x.id,'r');
    recIds[id]=1; idMap[cleanId(x.id)]=id;
    n.rec.push({id:id,k:k,d:x.d.slice(0,120),v:pos(x.v),day:(day>=1&&day<=31)?day:1,cat:catValid(x.cat,k,n.cats)?x.cat:guessCat(x.d,k),
      from:x.from,to:(validK(x.to)&&mi(x.to)>=mi(x.from))?x.to:null,auto:!!x.auto});
  });
  if(d.ov && typeof d.ov==='object') Object.keys(d.ov).forEach(function(key){
    var m=/^([\w-]+):(\d{4}-\d{2})$/.exec(key), o=d.ov[key];
    if(!m || !o || typeof o!=='object') return;
    var rid=idMap[m[1]]; if(!rid || !recIds[rid]) return;
    var c={}, dd=Math.round(+o.day);
    if(o.done===1||o.done===true) c.done=1; else if(o.done===0||o.done===false) c.done=0;
    if(pos(o.v)) c.v=pos(o.v);
    if(typeof o.d==='string' && o.d.trim()) c.d=o.d.slice(0,120);
    if(typeof o.cat==='string' && o.cat) c.cat=cleanId(o.cat);
    if(dd>=1&&dd<=31) c.day=dd;
    if(o.skip) c.skip=1;
    if(Object.keys(c).length) n.ov[rid+':'+m[2]]=c;
  });

  var bud=(d.bud && typeof d.bud==='object')?d.bud:oldCg;
  Object.keys(bud).forEach(function(k){ var v=pos(bud[k]); if(v && catValid(k,'out',n.cats)) n.bud[k]=v; });
  n.budTot=pos(d.budTot);

  if(Array.isArray(d.goals)) d.goals.forEach(function(g){
    if(!g || typeof g.n!=='string' || !g.n.trim() || !pos(g.target)) return;
    var sv=+g.saved; n.goals.push({id:take(g.id,'g'),n:g.n.trim().slice(0,40),target:pos(g.target),saved:(isFinite(sv)&&sv>0)?r2(sv):0,due:validK(g.due)?g.due:''});
  });

  n.open=(typeof d.open==='number' && isFinite(d.open))?r2(d.open):null;
  var st=(d.set && typeof d.set==='object')?d.set:{};
  n.set.theme=(st.theme==='light'||st.theme==='dark')?st.theme:'auto';
  n.set.hide=!!st.hide;
  n.set.pay=typeof st.pay==='string'?cleanId(st.pay)||'w':'w';
  n.set.bk=typeof st.bk==='string'?st.bk.slice(0,30):'';
  n.set.snooze=validIso(st.snooze)?st.snooze:'';
  n.set.news=!!st.news;
  return n;
}

function loadState(){
  var raw=null;
  try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); raw=localStorage.getItem(LS_KEY); }catch(e){ storageOk=false; }
  if(raw){
    var d=null; try{ d=JSON.parse(raw); }catch(e){}
    var n=d?normalize(d):null;
    if(n){
      S=n;
      if((+d.v||1)<VER){
        /* guarda uma cópia do que havia antes de converter, para o caso de precisar voltar */
        try{ if(!localStorage.getItem(LS_PRE)) localStorage.setItem(LS_PRE,raw); }catch(e){}
        S.set.news=true;
        persist();
      }
      return;
    }
    try{ localStorage.setItem('faturas_ilegivel_'+Date.now(),raw); }catch(e){}
  }
  S=fresh();
}
function persist(){
  if(!storageOk) return false;
  try{ localStorage.setItem(LS_KEY,JSON.stringify(S)); return true; }catch(e){ return false; }
}
function recordCount(){ return S.items.length+S.tx.length+S.rec.length; }

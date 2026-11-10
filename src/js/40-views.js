/* ===== telas ===== */
function kv(label,value,cls){ return '<div class="kv"><span>'+label+'</span><b'+(cls?' class="'+cls+'"':'')+'>'+value+'</b></div>'; }
function chipBtn(act,val,cur,label){ return '<button type="button" class="chip" data-act="'+act+'" data-v="'+val+'" aria-pressed="'+(val===cur)+'">'+label+'</button>'; }
function segBtn(act,val,cur,label){ return '<button type="button" data-act="'+act+'" data-v="'+val+'" aria-pressed="'+(val===cur)+'">'+label+'</button>'; }

function dueLabel(r){
  if(r.done) return '';
  var dd=dayDiff(r.dt,todayIso());
  if(r.k==='in') return dd<0 ? '<span>esperada em '+dshort(r.dt)+'</span>' : '';
  if(dd<0) return '<span class="st late">'+ic('alert','sm')+'venceu há '+plural(-dd,'dia','dias')+'</span>';
  if(dd===0) return '<span class="hl">vence hoje</span>';
  if(dd===1) return '<span class="hl">vence amanhã</span>';
  if(dd<=5) return '<span class="hl">vence em '+dd+' dias</span>';
  return '';
}
/* linha de um lançamento da carteira ou de uma fatura: círculo marca pago/recebido, o resto abre */
function rowHtml(r,withDate){
  var sub='';
  if(withDate) sub+='<span>'+dshort(r.dt)+'</span>';
  sub+='<span>'+esc(r.inv?'Cartão de crédito':catInfo(r.cat,r.k).n)+'</span>';
  if(r.rid) sub+='<span>'+ic('repeat','sm')+' '+(r.t?(r.n+' de '+r.t):'todo mês')+'</span>';
  sub+=dueLabel(r);
  var lab=r.k==='in'?(r.done?'Recebido':'Marcar como recebido'):(r.done?'Pago':'Marcar como pago');
  return '<div class="row">'+
    '<button type="button" class="tick" data-act="tick" data-key="'+esc(r.key)+'" aria-pressed="'+r.done+'" aria-label="'+lab+': '+esc(r.d)+'"><i>'+(r.done?ic('check'):'')+'</i></button>'+
    '<button type="button" class="row-main" data-act="open" data-key="'+esc(r.key)+'">'+
      '<span class="row-l"><span class="row-t">'+esc(r.d)+'</span><span class="row-s">'+sub+'</span></span>'+
      '<span class="row-v'+(r.k==='in'?' in':'')+'">'+(r.k==='in'?'+ ':'')+money(r.v)+'</span></button></div>';
}
function sumRows(a){ var s=0; a.forEach(function(r){ s+=ct(r.v); }); return s/100; }

/* ---------- Início ---------- */
function contaRow(sign,label,v,to){
  return '<button type="button" class="conta-row" data-act="conta" data-v="'+to+'"><span class="sg">'+sign+'</span><span>'+label+'</span><b>'+money(v)+'</b></button>';
}
function homeWelcome(){
  return '<section class="hero"><h1>Suas contas do mês, do salário à fatura</h1>'+
    '<p class="hero-note">Lance o que entra e o que sai. O app soma tudo e mostra se o mês fecha no azul ou no vermelho.</p></section>'+
    '<div class="sheet"><section class="sec"><div class="sec-h"><h2>Por onde começar</h2></div><div class="steps">'+
    '<button type="button" class="step" data-act="new" data-kind="in"><span class="av">'+ic('brief')+'</span><span class="set-l"><b>Lançar uma receita</b><small>Salário e outras entradas, uma vez ou todo mês</small></span></button>'+
    '<button type="button" class="step" data-act="new" data-kind="out" data-pay="w"><span class="av">'+ic('house')+'</span><span class="set-l"><b>Lançar uma despesa</b><small>Aluguel, luz, mercado: contas fixas ou avulsas</small></span></button>'+
    '<button type="button" class="step" data-act="cardNew"><span class="av">'+ic('card')+'</span><span class="set-l"><b>Cadastrar um cartão</b><small>Faturas, parcelas e limite disponível</small></span></button>'+
    '</div></section><section class="sec"><p class="note">Já usava o app em outro aparelho?</p><button type="button" class="link" data-act="pg" data-p="data">Restaurar um backup</button></section></div>';
}
function viewHome(){
  if(!recordCount() && !S.cards.length && !S.goals.length) return homeWelcome();
  var k=G.month, cur=curK(), isCur=(k===cur), past=mi(k)<mi(cur), s=monthSum(k), h='';
  var neg=s.res<0, fig=money(Math.abs(s.res));
  var lbl=past?(neg?'Faltou':'Sobrou'):(neg?'Falta':'Sobra');
  h+='<section class="hero"><div class="conta">'+
    contaRow('+','Receitas',s.inc,'in')+contaRow('−','Despesas',s.exp,'out')+contaRow('−','Faturas do cartão',s.inv,'cards')+
    '<div class="conta-rule"></div>'+
    '<div class="conta-top"><span class="eq"><span class="sg">=</span><span>'+lbl+' em '+mname(k)+'</span></span>'+
    '<span class="tagp '+(neg?'verm':'azul')+'">'+(neg?'no vermelho':'no azul')+'</span></div>'+
    '<p class="fig'+figCls(fig)+'">'+fig+'</p></div>';
  if(!s.inc && (s.exp||s.inv) && !past) h+='<p class="hero-note">Lance suas receitas para ver quanto sobra de verdade.</p>';
  h+='</section><div class="sheet">';
  if(!storageOk) h+='<div class="banner">'+ic('alert')+'<p>Este navegador não está guardando os dados. Salve um backup em Ajustes antes de fechar.</p></div>';
  if(S.set.news){
    h+='<div class="banner">'+ic('info')+'<div style="flex:1"><p>O app mudou. Suas compras continuam em <b>Cartões</b>. Em <b>Carteira</b> entram receitas e despesas fora do cartão, e <b>Análise</b> mostra gastos por categoria e os próximos 12 meses. O botão azul lança qualquer coisa.</p>'+
      '<div class="btnrow"><button type="button" class="btn sm" data-act="newsOk">Entendi</button></div></div></div>';
  }

  h+='<div class="quick">'+
    '<button type="button" data-act="new" data-kind="out" data-pay="w">'+ic('wallet')+'Despesa</button>'+
    '<button type="button" data-act="new" data-kind="in">'+ic('brief')+'Receita</button>'+
    '<button type="button" data-act="new" data-kind="out" data-pay="card">'+ic('card')+'No cartão</button></div>';

  var rows=monthRows(k), late=isCur?pendingBefore(k):[];
  var pay=late.filter(function(r){ return r.k==='out'; }).concat(rows.filter(function(r){ return r.k==='out' && !r.done; }));
  var recv=late.filter(function(r){ return r.k==='in'; }).concat(rows.filter(function(r){ return r.k==='in' && !r.done; }));
  var anyOut=rows.some(function(r){ return r.k==='out'; });
  if(pay.length || anyOut){
    h+='<section class="sec"><div class="sec-h"><h2>'+(past?'Ficou sem pagar em ':'Falta pagar em ')+mname(k)+'</h2><span class="amt">'+money(sumRows(pay))+'</span></div>';
    if(pay.length){
      h+='<div class="rows">'+pay.slice(0,5).map(function(r){ return rowHtml(r,true); }).join('')+'</div>';
      if(pay.length>5) h+='<button type="button" class="link" data-act="wf" data-v="pend">Ver as '+pay.length+' pendências na Carteira</button>';
    } else h+='<p class="note">Tudo pago em '+mname(k)+'.</p>';
    h+='</section>';
  }
  if(recv.length){
    h+='<section class="sec"><div class="sec-h"><h2>Falta receber</h2><span class="amt">'+money(sumRows(recv))+'</span></div>'+
      '<div class="rows">'+recv.slice(0,3).map(function(r){ return rowHtml(r,true); }).join('')+'</div>'+
      (recv.length>3?'<button type="button" class="link" data-act="wf" data-v="in">Ver todas as receitas</button>':'')+'</section>';
  }

  var bal=balance();
  h+='<section class="sec"><div class="sec-h"><h2>Saldo em conta</h2>'+(bal!=null?'<button type="button" class="link" data-act="pg" data-p="balance">Ajustar</button>':'')+'</div>';
  if(bal==null){
    h+='<p class="note">Informe quanto você tem em conta hoje e o app passa a prever o saldo no fim de cada mês.</p>'+
      '<button type="button" class="btn sm" style="margin-top:10px" data-act="pg" data-p="balance">Informar saldo</button>';
  } else {
    h+='<div>'+kv('Hoje',money(bal),bal<0?'neg':'');
    if(!past){
      var n=mi(k)-mi(cur)+1;
      if(n<=36){ var end=projection(n)[n-1].end; h+=kv('Previsto para o fim de '+mname(k),money(end),end<0?'neg':'pos'); }
    }
    h+='</div>';
  }
  h+='</section>';

  if(S.cards.length){
    h+='<section class="sec"><div class="sec-h"><h2>Cartões</h2></div><div class="rows">';
    S.cards.forEach(function(c){
      var t=invTotal(k,c.id), paid=!!S.paid[c.id+':'+k], li=limitInfo(c);
      h+='<div class="row"><span class="av">'+ic('card')+'</span><button type="button" class="row-main" data-act="cardGo" data-id="'+esc(c.id)+'" data-m="'+k+'">'+
        '<span class="row-l"><span class="row-t">'+esc(c.name)+'</span><span class="row-s">'+
        '<span>'+(t>0?('Fatura de '+MESES[mi(k)%12]+(paid?' paga':', vence dia '+c.due)):'Sem fatura em '+MESES[mi(k)%12])+'</span>'+
        (c.limit>0?'<span>Disponível '+money(li.avail)+'</span>':'')+'</span></span>'+
        '<span class="row-v">'+money(t)+'</span></button></div>';
    });
    h+='</div></section>';
  }

  var by=spendByCat(k), ids=Object.keys(by).sort(function(a,b){ return by[b]-by[a]; }).slice(0,3);
  if(ids.length){
    var top=by[ids[0]]||1;
    h+='<section class="sec"><div class="sec-h"><h2>Para onde foi o dinheiro</h2><button type="button" class="link" data-act="tab" data-tab="stats">Ver análise</button></div><div class="ranked">';
    ids.forEach(function(id){
      var c=catInfo(id,'out');
      h+='<div class="rk"><span class="rk-t">'+avatar(id,'out')+'<b>'+esc(c.n)+'</b><span>'+money(by[id])+'</span></span>'+meter(by[id]/top*100)+'</div>';
    });
    h+='</div></section>';
  }
  if(needBackup()){
    h+='<div class="banner">'+ic('save')+'<div style="flex:1"><p>Seus lançamentos ficam só neste aparelho. '+(validIso(S.set.bk)?('O último backup foi em '+dfull(S.set.bk)+'.'):'Você ainda não salvou um backup.')+'</p>'+
      '<div class="btnrow"><button type="button" class="btn sm primary" data-act="backupNow">Salvar backup</button><button type="button" class="btn sm" data-act="backupLater">Depois</button></div></div></div>';
  }
  return h+'</div>';
}

/* ---------- Carteira ---------- */
function walletList(){
  var k=G.month, all=monthRows(k), rows=all, q=plain(G.wq.trim()), t=todayIso(), h='';
  if(G.wf==='pend') rows=rows.filter(function(r){ return !r.done; });
  if(G.wf==='in') rows=rows.filter(function(r){ return r.k==='in'; });
  if(G.wf==='out') rows=rows.filter(function(r){ return r.k==='out'; });
  if(q) rows=rows.filter(function(r){ return plain(r.d).indexOf(q)>-1; });
  if(!rows.length){
    if(all.length) return '<div class="empty">'+(G.wf==='pend'&&!q?'Nenhuma pendência em '+mname(k)+'.':'Nada encontrado com esse filtro.')+'</div>';
    return '<div class="empty">Nada lançado em '+mname(k)+'.<div class="btnrow">'+
      '<button type="button" class="btn sm" data-act="new" data-kind="out" data-pay="w">Lançar despesa</button>'+
      '<button type="button" class="btn sm" data-act="new" data-kind="in">Lançar receita</button></div></div>';
  }
  var last='';
  rows.forEach(function(r){
    if(r.dt!==last){
      if(last) h+='</div>';
      h+='<h3 class="day"><b>'+r.dt.slice(8)+'</b>'+wday(r.dt)+(r.dt===t?' <span class="hl">hoje</span>':'')+'</h3><div class="rows">';
      last=r.dt;
    }
    h+=rowHtml(r,false);
  });
  return h+'</div>';
}
function viewWallet(){
  var k=G.month, s=monthSum(k), out=r2(s.exp+s.inv), outD=r2(s.expD+s.invD), h='';
  h+='<div class="tiles">'+
    '<div class="tile"><span class="k">Entradas</span><span class="v in'+figCls(money(s.inc))+'">'+money(s.inc)+'</span>'+meter(s.inc?s.incD/s.inc*100:0)+'<span class="s">'+(s.inc?'Recebido '+money(s.incD):'Nada lançado')+'</span></div>'+
    '<div class="tile"><span class="k">Saídas</span><span class="v'+figCls(money(out))+'">'+money(out)+'</span>'+meter(out?outD/out*100:0)+'<span class="s">'+(out?'Pago '+money(outD):'Nada lançado')+'</span></div></div>';
  h+='<div class="tools"><div class="chips" role="group" aria-label="Filtrar lançamentos">'+
    chipBtn('wf','all',G.wf,'Tudo')+chipBtn('wf','pend',G.wf,'Pendentes')+chipBtn('wf','in',G.wf,'Receitas')+chipBtn('wf','out',G.wf,'Despesas')+'</div>';
  if(monthRows(k).length>6 || G.wq) h+='<input class="search" type="search" data-inp="wq" placeholder="Buscar na carteira" aria-label="Buscar na carteira" autocomplete="off" value="'+esc(G.wq)+'">';
  h+='</div><section class="sec" style="padding-top:4px" id="wlist">'+walletList()+'</section>';
  return h;
}
INP.wq=function(el){ G.wq=el.value; $('wlist').innerHTML=walletList(); };

/* ---------- Cartões ---------- */
function sepInfo(k,cd){
  if(S.paid[cd.id+':'+k]) return '';
  var tot=invTotal(k,cd.id); if(!(tot>0)) return '';
  var due=isoDate(k,cd.due), t=todayIso(), days=dayDiff(due,t);
  if(days>90) return '';
  if(days<0) return '<p class="hint"><span class="st late">'+ic('alert','sm')+'Venceu há '+plural(-days,'dia','dias')+'.</span> Pague '+money(tot)+' o quanto antes.</p>';
  if(days===0) return '<p class="hint"><span class="hl">Vence hoje.</span></p>';
  var weeks=Math.ceil(days/7), txt='Faltam '+plural(days,'dia','dias')+' para vencer. Para pagar tudo, separe ';
  txt+=(weeks<=1)?('<b>'+money(tot/days)+'</b> por dia'):('<b>'+money(tot/weeks)+'</b> por semana');
  txt+='.';
  /* a fatura do mês k fecha no dia de fechamento do mesmo mês, ou do mês anterior quando o vencimento vem antes */
  var closeK=(cd.due<=cd.closing)?mk(mi(k)-1):k, close=isoDate(closeK,cd.closing);
  if(t<close) txt+=' Ela fecha em '+dshort(close)+', então o valor ainda pode subir.';
  return '<p class="hint">'+txt+'</p>';
}
function cardList(){
  var cd=card(G.cid), k=G.inv, rows=invRows(k,cd.id), q=plain(G.cq.trim()), h='';
  if(G.cf==='parc') rows=rows.filter(function(r){ return r.it.t>1; });
  if(G.cf==='avista') rows=rows.filter(function(r){ return r.it.t===1; });
  if(G.ccat) rows=rows.filter(function(r){ return catInfo(r.it.cat,'out').id===G.ccat; });
  if(q) rows=rows.filter(function(r){ return plain(r.it.d).indexOf(q)>-1; });
  rows.sort(function(a,b){ return G.cs==='value' ? (b.v-a.v) : (a.it.dt<b.it.dt?1:a.it.dt>b.it.dt?-1:0); });
  var sum=0; rows.forEach(function(r){ sum+=ct(r.v); });
  h+='<p class="note pad">'+plural(rows.length,'lançamento','lançamentos')+', '+money(sum/100)+'</p>';
  if(!rows.length) return h+'<div class="empty">'+(invRows(k,cd.id).length?'Nada encontrado com esse filtro.':'Nenhuma compra nesta fatura.')+'</div>';
  h+='<div class="rows">';
  rows.forEach(function(r){
    var it=r.it, left=it.t-r.n+1;
    h+='<div class="row">'+avatar(it.cat,'out')+'<button type="button" class="row-main" data-act="item" data-id="'+esc(it.id)+'">'+
      '<span class="row-l"><span class="row-t">'+esc(it.d)+'</span><span class="row-s"><span>'+dshort(it.dt)+'/'+it.dt.slice(2,4)+'</span>'+
      (it.t>1?'<span class="tagi">'+r.n+'/'+it.t+'</span><span>'+(left===1?'última':left+' restantes')+'</span>':'<span class="tagi flat">à vista</span>')+
      '</span></span><span class="row-v">'+money(r.v)+'</span></button></div>';
  });
  return h+'</div>';
}
function cardPanel(){
  var cd=card(G.cid), k=G.inv, h='';
  if(G.cseg==='list'){
    h+='<div class="tools" style="padding:0 0 4px">'+
      '<input class="search" type="search" data-inp="cq" placeholder="Buscar nesta fatura" aria-label="Buscar nesta fatura" autocomplete="off" value="'+esc(G.cq)+'">'+
      '<div class="chips" role="group" aria-label="Filtrar e ordenar">'+chipBtn('cf','all',G.cf,'Todos')+chipBtn('cf','parc',G.cf,'Parcelados')+chipBtn('cf','avista',G.cf,'À vista')+
      '<button type="button" class="chip" data-act="cs">Ordem: '+(G.cs==='value'?'maior valor':'mais recente')+'</button>'+
      (G.ccat?'<button type="button" class="chip" data-act="ccat" data-v="" aria-pressed="true">'+esc(catInfo(G.ccat,'out').n)+' ✕</button>':'')+'</div></div>'+
      '<div id="clist">'+cardList()+'</div>';
  } else if(G.cseg==='cats'){
    var by=invCats(k,cd.id), ids=Object.keys(by).sort(function(a,b){ return by[b]-by[a]; }), tot=invTotal(k,cd.id)||1;
    if(!ids.length) return '<div class="empty">Nenhuma compra nesta fatura.</div>';
    h+='<p class="note pad">Toque numa categoria para ver só os lançamentos dela.</p><div class="ranked">';
    ids.forEach(function(id){
      h+='<button type="button" class="rk" data-act="ccat" data-v="'+esc(id)+'"><span class="rk-t">'+avatar(id,'out')+'<b>'+esc(catInfo(id,'out').n)+'</b><span>'+money(by[id])+'</span></span>'+
        meter(by[id]/by[ids[0]]*100)+'<span class="rk-s">'+Math.round(by[id]/tot*100)+'% da fatura</span></button>';
    });
    h+='</div>';
  } else {
    var ms=months(cd.id), vals=ms.map(function(m){ return invTotal(m,cd.id); }), future=0, zero=null;
    ms.forEach(function(m,i){ if(mi(m)>mi(k)) future+=ct(vals[i]); if(vals[i]>0) zero=m; });
    h+='<div class="readout"><span>'+esc(mlab(k))+'</span><b>'+money(invTotal(k,cd.id))+'</b></div>'+
      chartMonths(ms,vals,k,'inv','Total de cada fatura')+
      '<p class="note pad">Só as parcelas já lançadas. Toque numa coluna para abrir a fatura.</p><div>'+
      kv('Parcelas nas faturas seguintes',money(future/100))+
      kv('Sem novas compras, zera depois de',zero?esc(mlab(zero)):'—')+'</div>';
  }
  return h;
}
function viewCards(){
  if(!S.cards.length){
    return '<div class="empty" style="padding-top:60px">Nenhum cartão cadastrado.<br>Cadastre para acompanhar faturas, parcelas e limite.<div><button type="button" class="btn primary" data-act="cardNew">Cadastrar cartão</button></div></div>';
  }
  var cd=card(G.cid)||S.cards[0]; G.cid=cd.id;
  if(!G.inv) G.inv=firstOpen(cd.id);
  var k=G.inv, li=limitInfo(cd), tot=invTotal(k,cd.id), paid=!!S.paid[cd.id+':'+k], h='';
  h+='<div class="ctiles" id="ctiles">';
  S.cards.forEach(function(c){
    var l=limitInfo(c);
    h+='<button type="button" class="ctile" data-act="card" data-id="'+esc(c.id)+'" aria-pressed="'+(c.id===cd.id)+'">'+
      '<span class="cn"><span>'+esc(c.name)+'</span>'+(c.last4?'<small>•••• '+esc(c.last4)+'</small>':'')+'</span>'+
      '<span><span class="cl">'+(c.limit>0?'Disponível':'Fatura atual')+'</span><br><span class="cv">'+money(c.limit>0?l.avail:invTotal(firstOpen(c.id),c.id))+'</span>'+
      (c.limit>0?meter(l.pct):'')+'</span></button>';
  });
  h+='<button type="button" class="ctile add" data-act="cardNew">'+ic('plus')+'Cartão</button></div>';

  h+='<section class="sec" style="padding-top:12px">';
  if(cd.limit>0){
    h+='<div>'+kv('Limite total',money(cd.limit))+kv('Já usado ('+Math.round(li.pct)+'%)',money(li.used),li.avail<0?'neg':'')+'</div>'+
      '<p class="note pad">Conta as faturas não pagas e as parcelas futuras'+(cd.adj?(cd.adj>0?', mais ':', menos ')+'um ajuste de '+money(Math.abs(cd.adj))+' para bater com o banco':'')+'. Ao marcar uma fatura como paga, o limite dela volta.</p>';
  } else {
    h+='<p class="note pad">Informe o limite do cartão para ver quanto ainda pode gastar.</p>';
  }
  h+='<button type="button" class="link" data-act="cardEdit">'+(cd.limit>0?'Editar cartão':'Definir limite')+'</button></section>';

  h+='<section class="sec"><div class="sec-h"><h2>Faturas</h2></div><div class="chips" id="mchips">';
  months(cd.id).forEach(function(m){
    h+='<button type="button" class="mchip" data-act="inv" data-m="'+m+'" aria-pressed="'+(m===k)+'"><b>'+mlab(m)+(S.paid[cd.id+':'+m]?' ✓':'')+'</b><span>'+money(invTotal(m,cd.id))+'</span></button>';
  });
  h+='</div></section>';

  h+='<section class="sec"><div class="invtop"><div><p class="note">Fatura de '+mlong(k)+'</p><p class="invfig'+figCls(money(tot))+'">'+money(tot)+'</p></div>'+
    (tot>0?'<button type="button" class="pill" data-act="paid" aria-pressed="'+paid+'">'+(paid?ic('check','sm')+'Paga':'Marcar paga')+'</button>':'')+'</div>'+
    '<p class="note" style="margin-top:4px">Vence em '+dfull(isoDate(k,cd.due))+'</p>'+sepInfo(k,cd);
  if(cd.goal>0){
    var rest=r2(cd.goal-tot), gp=tot/cd.goal*100;
    h+='<div style="margin-top:12px">'+meter(gp,meterState(gp,rest<0))+'<p class="note" style="margin-top:6px">Meta da fatura '+money(cd.goal)+': '+(rest>=0?'ainda cabem '+money(rest):'passou '+money(-rest))+'</p></div>';
  }
  h+='</section>';

  h+='<div class="tools"><div class="seg" role="group" aria-label="O que mostrar da fatura">'+
    segBtn('cseg','list',G.cseg,'Lançamentos')+segBtn('cseg','cats',G.cseg,'Categorias')+segBtn('cseg','next',G.cseg,'Próximas')+'</div></div>'+
    '<section class="sec" style="padding-top:8px" id="cpanel">'+cardPanel()+'</section>';
  return h;
}
INP.cq=function(el){ G.cq=el.value; $('clist').innerHTML=cardList(); };
function centerIn(box,sel){
  var on=box?box.querySelector(sel):null;
  if(on) box.scrollLeft=Math.max(0,on.offsetLeft-(box.clientWidth-on.offsetWidth)/2);
}
AFTER.cards=function(){ centerIn($('mchips'),'[aria-pressed="true"]'); centerIn($('ctiles'),'[aria-pressed="true"]'); };

/* ---------- Análise ---------- */
function statsSpend(){
  var k=G.month, tot=spendTotal(k), prevK=mk(mi(k)-1), prev=spendTotal(prevK), by=spendByCat(k), h='';
  h+='<section class="sec"><p class="note">Gastos de '+mlong(k)+'</p><p class="invfig'+figCls(money(tot))+'">'+money(tot)+'</p>';
  if(prev>0 && tot>0){
    var d=r2(tot-prev);
    h+='<p class="note" style="margin-top:4px">'+(d>0?money(d)+' a mais que em '+mname(prevK):(d<0?money(-d)+' a menos que em '+mname(prevK):'Igual a '+mname(prevK)))+'</p>';
  }
  if(S.budTot>0){
    var rest=r2(S.budTot-tot), bp=tot/S.budTot*100;
    h+='<div style="margin-top:12px">'+meter(bp,meterState(bp,rest<0))+'<p class="note" style="margin-top:6px">Teto do mês '+money(S.budTot)+': '+(rest>=0?'ainda cabem '+money(rest):'passou '+money(-rest))+'</p></div>';
  }
  h+='</section><section class="sec">';
  var ids=Object.keys(by);
  Object.keys(S.bud).forEach(function(id){ if(ids.indexOf(id)<0) ids.push(id); });
  ids.sort(function(a,b){ return (by[b]||0)-(by[a]||0); });
  if(!ids.length) h+='<div class="empty">Nenhum gasto em '+mname(k)+'.</div>';
  else {
    var top=by[ids[0]]||1;
    h+='<div class="ranked">';
    ids.forEach(function(id){
      var v=by[id]||0, b=S.bud[id]||0, pct, st='', sub;
      if(b>0){ pct=v/b*100; st=meterState(pct,v>b); sub='Orçamento '+money(b)+': '+(v>b?'passou '+money(v-b):'ainda cabem '+money(b-v)); }
      else { pct=v/top*100; sub=tot>0?Math.round(v/tot*100)+'% dos gastos':''; }
      h+='<button type="button" class="rk" data-act="catd" data-v="'+esc(id)+'"><span class="rk-t">'+avatar(id,'out')+'<b>'+esc(catInfo(id,'out').n)+'</b><span>'+money(v)+'</span></span>'+
        meter(pct,st)+'<span class="rk-s">'+sub+'</span></button>';
    });
    h+='</div>';
  }
  h+='<div class="btnrow" style="margin-top:16px"><button type="button" class="btn sm" data-act="pg" data-p="budget">'+((S.budTot>0||Object.keys(S.bud).length)?'Editar orçamento':'Definir orçamento')+'</button></div>'+
    '<p class="note pad">Soma as despesas da carteira com as compras que caem nas faturas que vencem no mês.</p></section>';
  return h;
}
function statsProj(){
  var P=projection(12), bal=balance(), sel=G.psel, h='', worst=P[0], firstNeg=null, picked=null;
  P.forEach(function(p){ if(p.res<worst.res) worst=p; if(firstNeg===null && p.end<0) firstNeg=p; if(p.k===sel) picked=p; });
  h+='<section class="sec"><div class="sec-h"><h2>Sobra ou falta de cada mês</h2></div>';
  if(!recordCount()) return h+'<div class="empty">Lance receitas, despesas ou compras no cartão para ver os próximos 12 meses.</div></section>';
  h+='<p class="note">'+(worst.res<0?'O mês mais apertado é '+mlab(worst.k)+': faltam '+money(-worst.res)+'.':'Com o que está lançado, nenhum dos próximos 12 meses fecha no vermelho.')+'</p>'+
    '<div class="readout" style="margin-top:10px">'+(picked?'<span>'+cap(mlong(picked.k))+'</span><b>'+(picked.res<0?'falta ':'sobra ')+money(Math.abs(picked.res))+'</b>':'<span>Toque em um mês para ver o valor.</span>')+'</div>'+
    chartResult(P,sel)+
    '<p class="note" style="margin-top:6px"><svg width="10" height="10" aria-hidden="true"><rect width="10" height="10" rx="2" style="fill:var(--blue)"/></svg> sobra &nbsp; <svg width="10" height="10" aria-hidden="true"><rect width="10" height="10" rx="2" style="fill:var(--red)"/></svg> falta</p></section>';
  h+='<section class="sec"><div class="sec-h"><h2>'+(bal!=null?'Saldo previsto em conta':'Sobra acumulada')+'</h2></div>';
  if(bal==null) h+='<p class="note">Soma das sobras e faltas mês a mês, a partir de '+mname(P[0].k)+', sem contar o que você já tem em conta.</p><button type="button" class="link" data-act="pg" data-p="balance">Informar saldo em conta</button>';
  else if(firstNeg) h+='<p class="note"><span class="st late">'+ic('alert','sm')+'O saldo fica negativo em '+mlab(firstNeg.k)+'.</span></p>';
  else h+='<p class="note">O saldo não fica negativo nos próximos 12 meses.</p>';
  h+='<div class="readout" style="margin-top:10px">'+(picked?'<span>Fim de '+mlab(picked.k)+'</span><b>'+money(picked.end)+'</b>':'')+'</div>'+chartBalance(P,sel)+'</section>';
  h+='<section class="sec"><div class="sec-h"><h2>Mês a mês</h2></div><div class="tblw"><table class="tbl"><thead><tr><th>Mês</th><th>Entra</th><th>Sai</th><th>Cartão</th><th>Sobra</th><th>'+(bal!=null?'Saldo':'Acum.')+'</th></tr></thead><tbody>';
  P.forEach(function(p){
    h+='<tr'+(p.k===sel?' class="on"':'')+'><td>'+mlab(p.k)+'</td><td>'+money0(p.inc)+'</td><td>'+money0(p.exp)+'</td><td>'+money0(p.inv)+'</td>'+
      '<td class="'+(p.res<0?'neg':'pos')+'">'+money0(p.res)+'</td><td class="'+(p.end<0?'neg':'')+'">'+money0(p.end)+'</td></tr>';
  });
  h+='</tbody></table></div><p class="note pad">Valores em reais, sem centavos. Conta receitas e despesas que repetem, lançamentos futuros e parcelas já lançadas no cartão.</p></section>';
  return h;
}
function goalLine(g){
  var left=r2(g.target-g.saved), cur=curK();
  if(left<=0) return 'Objetivo alcançado';
  if(g.due && mi(g.due)>=mi(cur)){ var n=mi(g.due)-mi(cur)+1; return 'Faltam '+money(left)+': '+money(left/n)+' por mês até '+mlab(g.due); }
  if(g.due) return 'Faltam '+money(left)+'. O prazo era '+mlab(g.due);
  return 'Faltam '+money(left);
}
function statsGoals(){
  var h='<section class="sec">';
  if(!S.goals.length){
    return h+'<div class="empty">Crie um objetivo, como reserva de emergência ou uma viagem, e acompanhe quanto já guardou.<div><button type="button" class="btn primary" data-act="goal" data-id="">Novo objetivo</button></div></div></section>';
  }
  h+='<div class="ranked">';
  S.goals.forEach(function(g){
    var pct=g.target>0?g.saved/g.target*100:0;
    h+='<button type="button" class="rk" data-act="goal" data-id="'+esc(g.id)+'"><span class="rk-t">'+'<span class="av">'+ic('target')+'</span><b>'+esc(g.n)+'</b><span>'+money(g.saved)+'</span></span>'+
      meter(pct)+'<span class="rk-s">de '+money(g.target)+'. '+goalLine(g)+'</span></button>';
  });
  h+='</div><div class="btnrow" style="margin-top:16px"><button type="button" class="btn sm" data-act="goal" data-id="">Novo objetivo</button></div></section>';
  return h;
}
function viewStats(){
  var h='<div class="tools"><div class="seg" role="group" aria-label="Tipo de análise">'+
    segBtn('aseg','spend',G.aseg,'Gastos')+segBtn('aseg','proj',G.aseg,'Projeção')+segBtn('aseg','goals',G.aseg,'Objetivos')+'</div></div>';
  return h+(G.aseg==='spend'?statsSpend():(G.aseg==='proj'?statsProj():statsGoals()));
}

VIEWS.home=viewHome; VIEWS.wallet=viewWallet; VIEWS.cards=viewCards; VIEWS.stats=viewStats;

/* ---------- ações das telas ---------- */
ACT.conta=function(el){
  var v=attr(el,'v');
  if(v==='cards'){ G.inv=S.cards.length?G.month:null; G.cseg='list'; G.ccat=''; go('cards'); return; }
  G.wf=v; G.wq=''; go('wallet');
};
ACT.wf=function(el){ G.wf=attr(el,'v'); if(G.tab!=='wallet') go('wallet'); else render(); };
ACT.tick=function(el){
  var key=attr(el,'key'), on=el.getAttribute('aria-pressed')==='true';
  setDone(key,!on); commit();
};
ACT.open=function(el){
  var key=attr(el,'key'), r=rowByKey(key); if(!r) return;
  if(r.inv){ closeAllPages(); G.cid=r.inv; G.inv=r.m; G.cseg='list'; G.ccat=''; go('cards'); return; }
  openEntry({key:key});
};
ACT.cardGo=function(el){ G.cid=attr(el,'id'); G.inv=attr(el,'m'); G.cseg='list'; G.ccat=''; G.cq=''; go('cards'); };
ACT.card=function(el){ G.cid=attr(el,'id'); G.inv=null; G.ccat=''; G.cq=''; render(); };
ACT.inv=function(el){ G.inv=attr(el,'m'); render(); };
ACT.paid=function(){ var pk=G.cid+':'+G.inv; if(S.paid[pk]) delete S.paid[pk]; else S.paid[pk]=true; commit(S.paid[pk]?'Fatura marcada como paga.':'Fatura reaberta.'); };
ACT.cseg=function(el){ G.cseg=attr(el,'v'); render(); };
ACT.cf=function(el){ G.cf=attr(el,'v'); render(); };
ACT.cs=function(){ G.cs=(G.cs==='value')?'date':'value'; render(); };
ACT.ccat=function(el){ G.ccat=attr(el,'v'); G.cseg='list'; render(); };
ACT.item=function(el){ openEntry({item:attr(el,'id')}); };
ACT.aseg=function(el){ G.aseg=attr(el,'v'); render(); };
ACT.psel=function(el){ var m=attr(el,'m'); G.psel=(G.psel===m)?null:m; render(); };
ACT.newsOk=function(){ S.set.news=false; commit(); };
ACT.backupLater=function(){ var d=new Date(); d.setDate(d.getDate()+7); S.set.snooze=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); commit(); };

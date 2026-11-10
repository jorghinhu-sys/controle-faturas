/* ===== formulários e páginas de ajustes ===== */
function swHtml(id,label,on){ return '<button type="button" class="sw" id="'+id+'" role="switch" aria-checked="'+(!!on)+'"><span>'+label+'</span><i></i></button>'; }
function mnyHtml(id,label,v,ph){ return '<div class="f"><label for="'+id+'">'+label+'</label><div class="mny"><input class="inp" id="'+id+'" type="text" inputmode="numeric" autocomplete="off" placeholder="'+(ph||'0,00')+'" value="'+fmtInput(v)+'"></div></div>'; }
function showErr(id,msg){ var e=$(id); e.textContent=msg; e.classList.toggle('hide',!msg); if(msg && e.scrollIntoView) e.scrollIntoView({block:'center'}); }
/* botão que pede um segundo toque antes de apagar */
function armed(btn,text,fn){
  var on=false, base=btn.textContent, tm=null;
  btn.addEventListener('click',function(){
    if(!on){
      var t=(typeof text==='function')?text():text;
      if(!t) return;
      on=true; btn.textContent=t; tm=setTimeout(function(){ on=false; btn.textContent=base; },3500); return;
    }
    clearTimeout(tm); on=false; btn.textContent=base; fn();
  });
}

/* divide o total em t parcelas iguais em centavos; o que sobra da divisão entra na 1ª */
function split(total,t){ var c=ct(total), p=Math.floor(c/t); return {v:p/100,v1:(c-p*(t-1))/100}; }

/* ---------- lançamento: despesa, receita ou compra no cartão ---------- */
function openEntry(o){
  o=o||{};
  var today=todayIso(), F, src=null, rec=null;
  if(o.item){
    src=itemById(o.item); if(!src) return;
    F={mode:'item',kind:'out',pay:src.c,v:itTotal(src),d:src.d,cat:src.cat,dt:src.dt,t:src.t,f:src.f,fTouched:true,catTouched:true};
  } else if(o.key){
    var row=rowByKey(o.key); if(!row || row.inv) return;
    if(row.rid){
      rec=recById(row.rid);
      F={mode:'rec',kind:row.k,pay:'w',v:row.v,d:row.d,cat:row.cat,dt:row.dt,done:row.done,auto:rec.auto,scope:o.scope||'one',m:row.m,catTouched:true,doneTouched:true};
    } else {
      src=txById(row.id);
      F={mode:'tx',kind:src.k,pay:'w',v:src.v,d:src.d,cat:src.cat,dt:src.dt,done:src.done,catTouched:true,doneTouched:true};
    }
  } else {
    var kind=o.kind==='in'?'in':'out', pay='w';
    if(kind==='out'){
      if(o.pay==='card'){
        var c0=card(G.cid)||S.cards[0];
        if(!c0){ toast('Cadastre um cartão primeiro.'); openCardForm(null); return; }
        pay=c0.id;
      } else if(o.pay!=='w'){
        if(G.tab==='cards' && card(G.cid)) pay=G.cid; else if(card(S.set.pay)) pay=S.set.pay;
      }
    }
    var dt0=(G.tab!=='cards' && G.month!==curK()) ? isoDate(G.month,+today.slice(8)) : today;
    F={mode:'new',kind:kind,pay:pay,v:NaN,d:'',cat:kind==='in'?'sal':'outros',dt:dt0,rep:'no',nrep:2,done:dt0<=today,auto:false,t:1,f:null,scope:'one'};
  }
  var isNew=(F.mode==='new');
  function isCard(){ return F.kind==='out' && F.pay!=='w'; }
  function tval(){ return Math.round(+F.t)||0; }
  function nval(){ return Math.round(+F.nrep)||0; }
  function defCat(){ return F.kind==='in'?'sal':'outros'; }
  function autoF(){ var cd=card(F.pay); if(cd && !F.fTouched && validIso(F.dt)) F.f=invoiceFor(F.dt,cd); }
  autoF();

  var title=isNew?'Novo lançamento':(F.mode==='item'?'Compra no cartão':(F.kind==='in'?'Receita':'Despesa'));
  openPage({title:title,form:true,build:function(body){
    var h='';
    if(isNew) h+='<div class="seg" id="eKind" role="group" aria-label="Tipo de lançamento"><button type="button" data-k="out">Despesa</button><button type="button" data-k="in">Receita</button></div>';
    h+='<div class="f"><label for="eV" id="eVL">Valor</label><div class="moneyf"><span>R$</span><input id="eV" type="text" inputmode="numeric" autocomplete="off" placeholder="0,00" value="'+fmtInput(F.v)+'"></div></div>'+
      '<div class="f"><label for="eD">Descrição</label><input class="inp" id="eD" type="text" maxlength="120" autocomplete="off" placeholder="Ex.: mercado, aluguel, salário" value="'+esc(F.d)+'"></div>'+
      '<div class="f" id="ePayF"><span class="lab">Paguei com</span><div class="chips wrap" id="ePay"></div></div>'+
      '<div class="f"><span class="lab">Categoria</span><div class="catgrid" id="eCat"></div></div>'+
      '<div class="two" id="eRow"><div class="f"><label for="eDt" id="eDtL">Data</label><input class="inp" id="eDt" type="date" value="'+esc(F.dt)+'"></div>'+
      '<div class="f" id="eTF"><label for="eT">Parcelas</label><input class="inp" id="eT" type="number" inputmode="numeric" min="1" max="120" value="'+(F.t||1)+'"></div></div>'+
      '<div class="f" id="eFF"><label for="eF">1ª parcela na fatura de</label><select class="inp" id="eF"></select></div>'+
      '<div class="f" id="eRepF"><span class="lab">Repetir</span><div class="seg" id="eRep"><button type="button" data-r="no">Não repete</button><button type="button" data-r="mo">Todo mês</button><button type="button" data-r="n">Por uns meses</button></div></div>'+
      '<div class="f" id="eNF"><label for="eN">Por quantos meses</label><input class="inp" id="eN" type="number" inputmode="numeric" min="2" max="120" value="'+(F.nrep||2)+'"></div>'+
      '<div id="eSw">'+swHtml('eDone','<span id="eDoneL"></span>',F.done)+swHtml('eAuto','<span id="eAutoL"></span>',F.auto)+'</div>'+
      '<div class="f" id="eScopeF"><span class="lab">Aplicar</span><div class="seg" id="eScope"><button type="button" data-s="one">Só neste mês</button><button type="button" data-s="next">Deste mês em diante</button></div></div>'+
      '<p class="hint" id="eHint"></p><p class="err hide" id="eErr" role="alert"></p>'+
      '<button type="button" class="btn primary block" id="eSave">Salvar</button>';
    if(!isNew) h+='<button type="button" class="btn danger block" id="eDel">Excluir</button>';
    body.innerHTML=h;

    function press(box,at,val){ Array.prototype.forEach.call($(box).querySelectorAll('['+at+']'),function(b){ b.setAttribute('aria-pressed',String(b.getAttribute(at)===val)); }); }
    function catGrid(){
      $('eCat').innerHTML=catsOf(F.kind).map(function(c){
        return '<button type="button" class="cat" data-c="'+esc(c.id)+'" aria-pressed="'+(c.id===F.cat)+'"><span class="av">'+ic(c.i)+'</span>'+esc(c.s)+'</button>';
      }).join('');
    }
    function payChips(){
      var h2=isNew?'<button type="button" class="chip" data-p="w" aria-pressed="'+(F.pay==='w')+'">Conta ou dinheiro</button>':'';
      S.cards.forEach(function(c){ h2+='<button type="button" class="chip" data-p="'+esc(c.id)+'" aria-pressed="'+(F.pay===c.id)+'">'+esc(c.name)+(c.last4?' •• '+esc(c.last4):'')+'</button>'; });
      $('ePay').innerHTML=h2;
    }
    function fOptions(){
      var from=mi(S.start)-24, to=Math.max(mi(curK())+48,F.f?mi(F.f):0), h2='';
      if(F.f && mi(F.f)<from) from=mi(F.f);
      for(var i=from;i<=to;i++){ var k=mk(i); h2+='<option value="'+k+'"'+(k===F.f?' selected':'')+'>'+esc(mlong(k))+'</option>'; }
      $('eF').innerHTML=h2;
    }
    function hint(){
      var txt='', v=F.v;
      if(isCard()){
        var cd=card(F.pay), t=tval();
        if(v>0 && t>1){ var sp=split(v,t); txt+=(sp.v1!==sp.v?('1ª parcela de '+brl(sp.v1)+' e '+(t-1)+' de '+brl(sp.v)):(t+'x de '+brl(sp.v)))+'. '; }
        if(F.f && t>=1) txt+=(t>1?('Entra nas faturas de '+mlab(F.f)+' a '+mlab(mk(mi(F.f)+t-1))):('Entra na fatura de '+mlab(F.f)))+'. ';
        if(isNew && cd && cd.limit>0 && v>0){ var after=r2(limitInfo(cd).avail-v); txt+=after<0?('Passa do limite em '+brl(-after)+'.'):('Depois dela sobram '+brl(after)+' de limite.'); }
      } else if(isNew && F.rep!=='no' && validIso(F.dt)){
        var k0=F.dt.slice(0,7), n=nval();
        if(F.rep==='mo') txt='Repete todo dia '+(+F.dt.slice(8))+' a partir de '+mlab(k0)+', até você encerrar.';
        else if(n>=2) txt='De '+mlab(k0)+' a '+mlab(mk(mi(k0)+n-1))+(v>0?', total de '+brl(v*n):'')+'.';
      } else if(F.mode==='rec'){
        txt=rec.to?('Parcela '+(mi(F.m)-mi(rec.from)+1)+' de '+(mi(rec.to)-mi(rec.from)+1)+'.'):('Repete todo mês desde '+mlab(rec.from)+'.');
      }
      $('eHint').textContent=txt;
    }
    function sync(){
      var cardMode=isCard(), recMode=(F.mode==='rec'), repeats=recMode||(isNew && !cardMode && F.rep!=='no');
      if(isNew) press('eKind','data-k',F.kind);
      $('ePayF').classList.toggle('hide',!(F.kind==='out' && (isNew ? S.cards.length>0 : (F.mode==='item' && S.cards.length>1))));
      payChips(); catGrid();
      $('eVL').textContent=cardMode?(tval()>1?'Valor total da compra':'Valor da compra'):(repeats?'Valor por mês':'Valor');
      $('eDtL').textContent=cardMode?'Data da compra':(recMode?'Data neste mês':(repeats?'Primeira data':'Data'));
      $('eTF').classList.toggle('hide',!cardMode);
      $('eRow').style.gridTemplateColumns=cardMode?'':'1fr';
      $('eFF').classList.toggle('hide',!cardMode);
      if(cardMode) fOptions();
      $('eRepF').classList.toggle('hide',!(isNew && !cardMode));
      if(isNew) press('eRep','data-r',F.rep);
      $('eNF').classList.toggle('hide',!(isNew && !cardMode && F.rep==='n'));
      $('eDone').classList.toggle('hide',cardMode);
      $('eDone').setAttribute('aria-checked',String(!!F.done));
      $('eDoneL').textContent=(F.kind==='in'?'Já recebi':'Já paguei')+(repeats?' a de '+mname((recMode?F.m:(validIso(F.dt)?F.dt.slice(0,7):curK()))):'');
      $('eAuto').classList.toggle('hide',!repeats);
      $('eAuto').setAttribute('aria-checked',String(!!F.auto));
      $('eAutoL').textContent=(F.kind==='in'?'Marcar como recebida':'Marcar como paga')+' sozinha no dia, todo mês';
      $('eScopeF').classList.toggle('hide',!recMode);
      if(recMode){ press('eScope','data-s',F.scope); $('eDt').min=F.m+'-01'; $('eDt').max=isoDate(F.m,31); }
      hint();
    }
    sync();

    if(isNew) $('eKind').addEventListener('click',function(e){
      var b=e.target.closest('[data-k]'); if(!b || b.getAttribute('data-k')===F.kind) return;
      F.kind=b.getAttribute('data-k'); if(F.kind==='in') F.pay='w';
      F.catTouched=false; var g=guessCat(F.d,F.kind); F.cat=(g==='outros'||g==='outin')?defCat():g;
      sync();
    });
    $('ePay').addEventListener('click',function(e){
      var b=e.target.closest('[data-p]'); if(!b) return;
      F.pay=b.getAttribute('data-p'); if(isNew) F.fTouched=false; autoF(); sync();
    });
    $('eCat').addEventListener('click',function(e){
      var b=e.target.closest('[data-c]'); if(!b) return;
      F.cat=b.getAttribute('data-c'); F.catTouched=true; catGrid();
    });
    bindMoney($('eV'),function(){ F.v=moneyVal($('eV')); hint(); });
    $('eD').addEventListener('input',function(){
      F.d=$('eD').value;
      if(!F.catTouched){ var g=guessCat(F.d,F.kind), c=(g==='outros'||g==='outin')?defCat():g; if(c!==F.cat){ F.cat=c; catGrid(); } }
    });
    $('eDt').addEventListener('change',function(){
      F.dt=$('eDt').value;
      if(isNew && !F.doneTouched && validIso(F.dt)) F.done=(F.dt<=today);
      autoF(); sync();
    });
    $('eT').addEventListener('input',function(){ F.t=$('eT').value; $('eVL').textContent=tval()>1?'Valor total da compra':'Valor da compra'; hint(); });
    $('eF').addEventListener('change',function(){ F.f=$('eF').value; F.fTouched=true; hint(); });
    $('eRep').addEventListener('click',function(e){ var b=e.target.closest('[data-r]'); if(!b) return; F.rep=b.getAttribute('data-r'); sync(); });
    $('eN').addEventListener('input',function(){ F.nrep=$('eN').value; hint(); });
    $('eDone').addEventListener('click',function(){ F.done=!F.done; F.doneTouched=true; $('eDone').setAttribute('aria-checked',String(F.done)); });
    $('eAuto').addEventListener('click',function(){ F.auto=!F.auto; $('eAuto').setAttribute('aria-checked',String(F.auto)); });
    $('eScope').addEventListener('click',function(e){ var b=e.target.closest('[data-s]'); if(!b) return; F.scope=b.getAttribute('data-s'); press('eScope','data-s',F.scope); });

    $('eSave').addEventListener('click',function(){
      var v=F.v, d=$('eD').value.trim(), dt=$('eDt').value, err='', msg='', cd=null, t=0, pv=0, n=0;
      if(!(v>0)) err='Informe o valor.';
      else if(!validIso(dt)) err='Escolha a data.';
      else if(isCard()){
        cd=card(F.pay); t=tval(); pv=(t>=1)?split(v,t).v:0;
        if(!cd) err='Escolha o cartão.';
        else if(!(t>=1&&t<=120)) err='O número de parcelas deve ficar entre 1 e 120.';
        else if(!(pv>0)) err='O valor é baixo demais para '+t+' parcelas.';
      } else if(isNew && F.rep==='n'){ n=nval(); if(!(n>=2&&n<=120)) err='Informe de 2 a 120 meses.'; }
      if(err){ showErr('eErr',err); return; }
      if(!d) d=catInfo(F.cat,F.kind).n;
      v=r2(v);
      if(isCard()){
        if(!validK(F.f)) F.f=invoiceFor(dt,cd);
        var v1=split(v,t).v1, it=(F.mode==='item')?src:{id:uid('i')};
        it.c=cd.id; it.d=d; it.v=pv; it.t=t; it.f=F.f; it.dt=dt; it.cat=F.cat;
        if(t>1 && v1!==pv) it.v1=v1; else delete it.v1;
        if(F.mode!=='item'){ S.items.push(it); S.set.pay=cd.id; }
        G.cid=cd.id; G.inv=F.f;
        msg=(F.mode==='item')?'Compra atualizada.':'Compra lançada na fatura de '+mlab(F.f)+'.';
      } else if(isNew){
        var k0=dt.slice(0,7);
        if(F.rep==='no') S.tx.push({id:uid('t'),k:F.kind,d:d,v:v,dt:dt,cat:F.cat,done:!!F.done});
        else {
          var id=uid('r');
          S.rec.push({id:id,k:F.kind,d:d,v:v,day:+dt.slice(8),cat:F.cat,from:k0,to:F.rep==='n'?mk(mi(k0)+n-1):null,auto:!!F.auto});
          if(F.done) S.ov[id+':'+k0]={done:1}; else if(F.auto && dt<=today) S.ov[id+':'+k0]={done:0};
        }
        if(F.kind==='out') S.set.pay='w';
        msg=(F.kind==='in'?'Receita lançada':'Despesa lançada')+(k0!==G.month?' em '+mlab(k0):'')+'.';
      } else if(F.mode==='tx'){
        src.d=d; src.v=v; src.dt=dt; src.cat=F.cat; src.done=!!F.done; msg='Lançamento atualizado.';
      } else {
        var m=F.m, key=rec.id+':'+m, day=Math.min(+dt.slice(8),daysIn(m)), o;
        if(F.scope==='next'){
          var tg=rec;
          if(m!==rec.from){
            tg={id:uid('r'),k:rec.k,d:rec.d,v:rec.v,day:rec.day,cat:rec.cat,from:m,to:rec.to,auto:rec.auto};
            Object.keys(S.ov).forEach(function(kk){ var p=kk.split(':'); if(p[0]===rec.id && mi(p[1])>=mi(m)){ S.ov[tg.id+':'+p[1]]=S.ov[kk]; delete S.ov[kk]; } });
            rec.to=mk(mi(m)-1); S.rec.push(tg); key=tg.id+':'+m;
          }
          tg.d=d; tg.v=v; tg.day=day; tg.cat=F.cat; tg.auto=!!F.auto;
          o=S.ov[key]||{}; delete o.v; delete o.d; delete o.cat; delete o.day; o.done=F.done?1:0; S.ov[key]=o;
        } else {
          o=S.ov[key]||{};
          if(v!==rec.v) o.v=v; else delete o.v;
          if(d!==rec.d) o.d=d; else delete o.d;
          if(F.cat!==rec.cat) o.cat=F.cat; else delete o.cat;
          if(day!==Math.min(rec.day,daysIn(m))) o.day=day; else delete o.day;
          o.done=F.done?1:0; S.ov[key]=o; rec.auto=!!F.auto;
        }
        msg='Lançamento atualizado.';
      }
      closePage(); commit(msg);
    });

    if(!isNew) armed($('eDel'),function(){
      if(F.mode!=='rec') return 'Toque de novo para excluir';
      return F.scope==='next'?('Toque de novo: exclui de '+mname(F.m)+' em diante'):('Toque de novo: exclui só '+mname(F.m));
    },function(){
      if(F.mode==='tx') S.tx=S.tx.filter(function(x){ return x!==src; });
      else if(F.mode==='item') S.items=S.items.filter(function(x){ return x!==src; });
      else {
        var m=F.m, all=(F.scope==='next' && m===rec.from);
        if(F.scope==='next'){
          Object.keys(S.ov).forEach(function(kk){ var p=kk.split(':'); if(p[0]===rec.id && (all || mi(p[1])>=mi(m))) delete S.ov[kk]; });
          if(all) S.rec=S.rec.filter(function(x){ return x!==rec; }); else rec.to=mk(mi(m)-1);
        } else S.ov[rec.id+':'+m]={skip:1};
      }
      closePage(); commit('Lançamento excluído.');
    });
  }});
}

/* ---------- cartão ---------- */
function openCardForm(id){
  var cd=id?card(id):null, isNew=!cd;
  openPage({title:isNew?'Novo cartão':'Editar cartão',form:true,build:function(body){
    var h='<div class="f"><label for="cN">Nome do cartão</label><input class="inp" id="cN" type="text" maxlength="40" autocomplete="off" placeholder="Ex.: Nubank, Itaú Platinum" value="'+esc(cd?cd.name:'')+'"></div>'+
      '<div class="two"><div class="f"><label for="cL4">Final do cartão</label><input class="inp" id="cL4" type="text" inputmode="numeric" maxlength="4" placeholder="0000" value="'+esc(cd?cd.last4:'')+'"></div>'+
      mnyHtml('cLim','Limite total',cd?cd.limit:0)+'</div>'+
      '<div class="two"><div class="f"><label for="cCl">Dia do fechamento</label><input class="inp" id="cCl" type="number" min="1" max="28" inputmode="numeric" value="'+(cd?cd.closing:6)+'"></div>'+
      '<div class="f"><label for="cDu">Dia do vencimento</label><input class="inp" id="cDu" type="number" min="1" max="28" inputmode="numeric" value="'+(cd?cd.due:20)+'"></div></div>'+
      '<p class="hint">Compras feitas a partir do dia do fechamento entram na fatura seguinte.</p>'+
      mnyHtml('cBank','Disponível segundo o banco hoje (opcional)',0,'Em branco para não ajustar')+
      '<p class="hint">Se o disponível do app não bater com o do banco, digite aqui o valor do banco e o app guarda a diferença como ajuste.'+(cd&&cd.adj?' Ajuste atual: '+brl(cd.adj)+'.':'')+'</p>'+
      mnyHtml('cGoal','Meta para a fatura (opcional)',cd?cd.goal:0,'Sem meta')+
      '<p class="err hide" id="cErr" role="alert"></p>'+
      '<button type="button" class="btn primary block" id="cSave">Salvar</button>';
    if(!isNew) h+='<button type="button" class="btn danger block" id="cDel">Excluir cartão</button>';
    body.innerHTML=h;
    ['cLim','cBank','cGoal'].forEach(function(i){ bindMoney($(i)); });
    $('cSave').addEventListener('click',function(){
      var name=$('cN').value.trim(), l4=$('cL4').value.replace(/\D/g,'').slice(0,4), lim=moneyVal($('cLim')), cl=Math.round(+$('cCl').value), du=Math.round(+$('cDu').value), bank=moneyVal($('cBank')), goal=moneyVal($('cGoal')), err='';
      if(!name) err='Escreva o nome do cartão.';
      else if(!(cl>=1&&cl<=28) || !(du>=1&&du<=28)) err='Fechamento e vencimento devem ficar entre os dias 1 e 28.';
      else if(bank>=0 && !(lim>0)) err='Para usar o disponível do banco, informe também o limite total.';
      if(err){ showErr('cErr',err); return; }
      var tg=cd;
      if(isNew){
        if(!S.cards.length && !S.items.length) S.start=curK();
        tg={id:uid('c'),name:name,last4:l4,limit:0,adj:0,closing:cl,due:du,goal:0}; S.cards.push(tg);
      }
      tg.name=name.slice(0,40); tg.last4=l4; tg.limit=lim>0?r2(lim):0; tg.closing=cl; tg.due=du; tg.goal=goal>0?r2(goal):0;
      if(bank>=0 && tg.limit>0) tg.adj=r2(tg.limit-bank-usedNoAdj(tg.id));
      G.cid=tg.id; G.inv=null;
      closePage(); commit(isNew?'Cartão cadastrado.':'Cartão atualizado.');
    });
    if(!isNew) armed($('cDel'),'Toque de novo: apaga o cartão e as compras dele',function(){
      var gone=cd.id;
      S.cards=S.cards.filter(function(x){ return x.id!==gone; });
      S.items=S.items.filter(function(x){ return x.c!==gone; });
      Object.keys(S.paid).forEach(function(k){ if(k.indexOf(gone+':')===0) delete S.paid[k]; });
      if(S.set.pay===gone) S.set.pay='w';
      G.cid=null; G.inv=null;
      closePage(); commit('Cartão excluído.');
    });
  }});
}

/* ---------- orçamento ---------- */
function pageBudget(){
  openPage({title:'Orçamento do mês',form:true,build:function(body){
    var cats=catsOf('out'), h='<p class="hint">Um teto de gastos por mês. Vale para as despesas da carteira e para o que cai nas faturas. Deixe em branco o que não quiser controlar.</p>'+
      mnyHtml('bTot','Teto total do mês',S.budTot,'Sem teto')+'<div class="grp"><h3>Por categoria</h3>';
    cats.forEach(function(c){ h+=mnyHtml('b_'+c.id,esc(c.n),S.bud[c.id]||0,'Sem teto'); });
    h+='</div><button type="button" class="btn primary block" id="bSave">Salvar</button>';
    body.innerHTML=h;
    bindMoney($('bTot')); cats.forEach(function(c){ bindMoney($('b_'+c.id)); });
    $('bSave').addEventListener('click',function(){
      var t=moneyVal($('bTot')), b={};
      cats.forEach(function(c){ var v=moneyVal($('b_'+c.id)); if(v>0) b[c.id]=r2(v); });
      S.budTot=t>0?r2(t):0; S.bud=b;
      closePage(); commit('Orçamento salvo.');
    });
  }});
}

/* ---------- saldo em conta ---------- */
function pageBalance(){
  var neg=false;
  openPage({title:'Saldo em conta',form:true,build:function(body){
    var bal=balance(); if(bal!=null && bal<0) neg=true;
    var h='<p class="hint">Digite quanto você tem em conta hoje. A partir daí o app soma o que você marcar como recebido e desconta o que marcar como pago, faturas inclusive.</p>'+
      '<div class="f"><label for="sV">Saldo hoje</label><div class="moneyf"><span>R$</span><input id="sV" type="text" inputmode="numeric" autocomplete="off" placeholder="0,00" value="'+(bal!=null?fmtInput(Math.abs(bal)):'')+'"></div></div>'+
      swHtml('sNeg','Estou no negativo',neg)+
      '<button type="button" class="btn primary block" id="sSave">Salvar</button>';
    if(bal!=null) h+='<button type="button" class="btn block" id="sOff">Parar de acompanhar o saldo</button>';
    body.innerHTML=h;
    bindMoney($('sV'));
    $('sNeg').addEventListener('click',function(){ neg=!neg; $('sNeg').setAttribute('aria-checked',String(neg)); });
    $('sSave').addEventListener('click',function(){
      var v=moneyVal($('sV')); if(!(v>=0)) v=0;
      S.open=r2((neg?-v:v)-netDone());
      closePage(); commit('Saldo atualizado.');
    });
    if(bal!=null) $('sOff').addEventListener('click',function(){ S.open=null; closePage(); commit('O saldo deixou de ser acompanhado.'); });
  }});
}

/* ---------- objetivos ---------- */
function openGoal(id){
  var g=null, withTx=true;
  S.goals.forEach(function(x){ if(x.id===id) g=x; });
  openPage({title:g?'Objetivo':'Novo objetivo',form:true,build:function(body){
    var cur=mi(curK()), opts='<option value="">Sem prazo</option>', h='';
    if(g && g.due && mi(g.due)<cur) opts+='<option value="'+g.due+'" selected>'+esc(mlong(g.due))+'</option>';
    for(var i=cur;i<=cur+120;i++){ var k=mk(i); opts+='<option value="'+k+'"'+(g&&g.due===k?' selected':'')+'>'+esc(mlong(k))+'</option>'; }
    if(g){
      var left=r2(g.target-g.saved);
      h+='<div><p class="note">Guardado até agora</p><p class="invfig'+figCls(money(g.saved))+'">'+money(g.saved)+'</p><div style="margin:10px 0 6px">'+meter(g.target>0?g.saved/g.target*100:0)+'</div><p class="note">de '+money(g.target)+'. '+goalLine(g)+'</p></div>'+
        '<div class="grp"><h3>Guardar ou retirar</h3>'+mnyHtml('gAmt','Valor',0)+
        swHtml('gTx','Lançar como despesa na carteira',withTx)+
        '<div class="btnrow"><button type="button" class="btn primary" id="gAdd">Guardar</button><button type="button" class="btn" id="gSub">Retirar</button></div><p class="err hide" id="gErr2" role="alert"></p></div>'+
        '<div class="grp"><h3>Editar objetivo</h3>';
    }
    h+='<div class="f"><label for="gN">Nome</label><input class="inp" id="gN" type="text" maxlength="40" autocomplete="off" placeholder="Ex.: reserva de emergência" value="'+esc(g?g.n:'')+'"></div>'+
      mnyHtml('gT','Quanto quer juntar',g?g.target:0)+
      (g?'':mnyHtml('gS','Quanto já tem guardado (opcional)',0))+
      '<div class="f"><label for="gD">Até quando</label><select class="inp" id="gD">'+opts+'</select></div>'+
      '<p class="err hide" id="gErr" role="alert"></p><button type="button" class="btn primary block" id="gSave">'+(g?'Salvar alterações':'Criar objetivo')+'</button>';
    if(g) h+='<button type="button" class="btn danger block" id="gDel">Excluir objetivo</button></div>';
    body.innerHTML=h;
    bindMoney($('gT')); if($('gS')) bindMoney($('gS'));
    $('gSave').addEventListener('click',function(){
      var n=$('gN').value.trim(), t=moneyVal($('gT')), due=$('gD').value;
      if(!n){ showErr('gErr','Dê um nome ao objetivo.'); return; }
      if(!(t>0)){ showErr('gErr','Informe quanto quer juntar.'); return; }
      if(g){ g.n=n.slice(0,40); g.target=r2(t); g.due=validK(due)?due:''; }
      else { var sv=moneyVal($('gS')); S.goals.push({id:uid('g'),n:n.slice(0,40),target:r2(t),saved:sv>0?r2(sv):0,due:validK(due)?due:''}); }
      closePage(); commit(g?'Objetivo atualizado.':'Objetivo criado.');
    });
    if(g){
      bindMoney($('gAmt'));
      $('gTx').addEventListener('click',function(){ withTx=!withTx; $('gTx').setAttribute('aria-checked',String(withTx)); });
      var move=function(sign){
        var a=moneyVal($('gAmt'));
        if(!(a>0)){ showErr('gErr2','Informe o valor.'); return; }
        if(sign<0 && a>g.saved){ showErr('gErr2','Só há '+brl(g.saved)+' guardados.'); return; }
        g.saved=r2(g.saved+sign*a);
        if(withTx) S.tx.push({id:uid('t'),k:sign>0?'out':'in',d:(sign>0?'Reserva: ':'Retirada: ')+g.n,v:r2(a),dt:todayIso(),cat:sign>0?'reserva':'outin',done:true});
        closePage(); commit(sign>0?(brl(a)+' guardados em '+g.n+'.'):(brl(a)+' retirados de '+g.n+'.'));
      };
      $('gAdd').addEventListener('click',function(){ move(1); });
      $('gSub').addEventListener('click',function(){ move(-1); });
      armed($('gDel'),'Toque de novo para excluir',function(){ S.goals=S.goals.filter(function(x){ return x!==g; }); closePage(); commit('Objetivo excluído.'); });
    }
  }});
}

/* ---------- gastos de uma categoria no mês ---------- */
function pageCat(id){
  var c=catInfo(id,'out'), k=G.month;
  openPage({title:c.n,build:function(body){
    var a=catEntries(k,c.id), tot=0, b=S.bud[c.id]||0;
    a.forEach(function(e){ tot+=ct(e.v); }); tot/=100;
    var h='<div><p class="note">'+cap(mlong(k))+'</p><p class="invfig'+figCls(money(tot))+'">'+money(tot)+'</p>';
    if(b>0){ var p=tot/b*100; h+='<div style="margin:10px 0 6px">'+meter(p,meterState(p,tot>b))+'</div><p class="note">Orçamento '+money(b)+': '+(tot>b?'passou '+money(tot-b):'ainda cabem '+money(b-tot))+'</p>'; }
    h+='</div>';
    if(!a.length) h+='<div class="empty">Nenhum gasto nesta categoria em '+mname(k)+'.</div>';
    else {
      h+='<div class="rows">';
      a.forEach(function(e){
        h+='<div class="row"><button type="button" class="row-main" '+(e.item?'data-act="item" data-id="'+esc(e.item)+'"':'data-act="open" data-key="'+esc(e.key)+'"')+'>'+
          '<span class="row-l"><span class="row-t">'+esc(e.d)+'</span><span class="row-s"><span>'+dshort(e.dt)+'</span><span>'+esc(e.src)+'</span>'+(e.t>1?'<span class="tagi">'+e.n+'/'+e.t+'</span>':'')+'</span></span>'+
          '<span class="row-v">'+money(e.v)+'</span></button></div>';
      });
      h+='</div>';
    }
    body.innerHTML=h;
  }});
}

/* ---------- ajustes ---------- */
function setRow(p,icon,label,sub){
  return '<button type="button" class="set-row" data-act="pg" data-p="'+p+'"><span class="av">'+ic(icon)+'</span><span class="set-l"><b>'+label+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span>'+ic('right')+'</button>';
}
function pageSettings(){
  openPage({title:'Ajustes',build:function(body){
    var bal=balance(), nb=Object.keys(S.bud).length+(S.budTot>0?1:0), act=0, cur=mi(curK());
    S.rec.forEach(function(r){ if(!r.to || mi(r.to)>=cur) act++; });
    body.innerHTML='<div class="set">'+
      setRow('balance','bank','Saldo em conta',bal==null?'Não acompanhado':money(bal))+
      setRow('cards','card','Cartões',S.cards.length?plural(S.cards.length,'cartão','cartões'):'Nenhum cadastrado')+
      setRow('recur','repeat','Contas e receitas que repetem',act?plural(act,'ativa','ativas'):'Nenhuma')+
      setRow('budget','target','Orçamento do mês',nb?plural(nb,'teto definido','tetos definidos'):'Sem tetos')+
      setRow('cats','tag','Categorias',S.cats.length?plural(S.cats.length,'criada por você','criadas por você'):'Padrão')+
      setRow('data','save','Backup e planilhas',validIso(S.set.bk)?'Último backup em '+dfull(S.set.bk):'Nenhum backup salvo')+'</div>'+
      '<div class="f"><span class="lab">Aparência</span><div class="seg" role="group" aria-label="Aparência">'+
      segBtn('theme','auto',S.set.theme,'Automática')+segBtn('theme','light',S.set.theme,'Clara')+segBtn('theme','dark',S.set.theme,'Escura')+'</div></div>'+
      '<div class="grp"><h3>Sobre</h3><p class="hint">Versão '+esc(APP_VERSION)+'. Seus lançamentos ficam guardados só neste aparelho e nada é enviado para servidor. Por isso vale salvar um backup de tempos em tempos.</p>'+
      '<button type="button" class="btn sm" data-act="reload">Buscar atualização</button></div>';
  }});
}
function pageCards(){
  openPage({title:'Cartões',build:function(body){
    var h='';
    if(S.cards.length){
      h+='<div class="set">';
      S.cards.forEach(function(c){
        h+='<button type="button" class="set-row" data-act="cardEdit" data-id="'+esc(c.id)+'"><span class="av">'+ic('card')+'</span><span class="set-l"><b>'+esc(c.name)+'</b><small>Fecha dia '+c.closing+', vence dia '+c.due+(c.limit>0?', limite '+money(c.limit):'')+'</small></span>'+ic('right')+'</button>';
      });
      h+='</div>';
    } else h+='<p class="hint">Nenhum cartão cadastrado.</p>';
    body.innerHTML=h+'<button type="button" class="btn primary block" data-act="cardNew">Novo cartão</button>';
  }});
}
function recMonth(r){
  var cur=mi(curK()), a=mi(r.from), b=r.to?mi(r.to):cur+24, i0=Math.min(Math.max(cur,a),b), i;
  for(i=i0;i<=b;i++){ if(recOcc(r,mk(i))) return mk(i); }
  for(i=i0-1;i>=a;i--){ if(recOcc(r,mk(i))) return mk(i); }
  return null;
}
function pageRecur(){
  openPage({title:'Contas e receitas que repetem',build:function(body){
    var cur=mi(curK()), on=[], off=[], h='';
    S.rec.forEach(function(r){ ((!r.to || mi(r.to)>=cur)?on:off).push(r); });
    function line(r){
      return '<button type="button" class="set-row" data-act="recOpen" data-id="'+esc(r.id)+'">'+avatar(r.cat,r.k)+'<span class="set-l"><b>'+esc(r.d)+'</b><small>'+
        (r.k==='in'?'Receita':'Despesa')+' de '+money(r.v)+', dia '+r.day+(r.to?', de '+mlab(r.from)+' a '+mlab(r.to):', desde '+mlab(r.from))+'</small></span>'+ic('right')+'</button>';
    }
    if(!S.rec.length) h+='<p class="hint">Nada repete ainda. Ao lançar uma despesa ou receita, escolha “Todo mês” ou “Por uns meses” em Repetir.</p>';
    if(on.length) h+='<div class="set">'+on.map(line).join('')+'</div>';
    if(off.length) h+='<div class="grp"><h3>Encerradas</h3><div class="set">'+off.map(line).join('')+'</div></div>';
    body.innerHTML=h+'<button type="button" class="btn primary block" data-act="new" data-pay="w">Novo lançamento</button>';
  }});
}
function pageCats(){
  var kind='out';
  openPage({title:'Categorias',build:function(body){
    var h='<p class="hint">As categorias padrão ficam sempre disponíveis. Crie outras se precisar.</p>';
    if(S.cats.length){
      h+='<div class="set">';
      S.cats.forEach(function(c){
        h+='<div class="set-row"><span class="av">'+ic('tag')+'</span><span class="set-l"><b>'+esc(c.n)+'</b><small>'+(c.k==='in'?'Receita':'Despesa')+'</small></span>'+
          '<button type="button" class="btn sm danger" data-del="'+esc(c.id)+'">Excluir</button></div>';
      });
      h+='</div>';
    }
    h+='<div class="grp"><h3>Nova categoria</h3><div class="f"><label for="kN">Nome</label><input class="inp" id="kN" type="text" maxlength="30" autocomplete="off" placeholder="Ex.: pets, presentes"></div>'+
      '<div class="seg" id="kK" role="group" aria-label="Tipo"><button type="button" data-k="out" aria-pressed="'+(kind==='out')+'">Despesa</button><button type="button" data-k="in" aria-pressed="'+(kind==='in')+'">Receita</button></div>'+
      '<p class="err hide" id="kErr" role="alert"></p><button type="button" class="btn primary block" id="kAdd">Criar categoria</button></div>';
    body.innerHTML=h;
    $('kK').addEventListener('click',function(e){
      var b=e.target.closest('[data-k]'); if(!b) return; kind=b.getAttribute('data-k');
      Array.prototype.forEach.call($('kK').querySelectorAll('[data-k]'),function(x){ x.setAttribute('aria-pressed',String(x.getAttribute('data-k')===kind)); });
    });
    $('kAdd').addEventListener('click',function(){
      var n=$('kN').value.trim();
      if(!n){ showErr('kErr','Escreva o nome da categoria.'); return; }
      var dup=catsOf(kind).some(function(c){ return plain(c.n)===plain(n); });
      if(dup){ showErr('kErr','Já existe uma categoria com esse nome.'); return; }
      S.cats.push({id:uid('u'),n:n.slice(0,30),k:kind}); commit('Categoria criada.');
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-del]'),function(btn){
      armed(btn,'Confirmar',function(){
        var id=btn.getAttribute('data-del');
        S.cats=S.cats.filter(function(c){ return c.id!==id; }); delete S.bud[id];
        commit('Categoria excluída. Os lançamentos dela aparecem em Outros.');
      });
    });
  }});
}

/* ---------- backup, restauração e planilhas ---------- */
function backupText(){ return JSON.stringify({app:'faturas',v:2,exportedAt:new Date().toISOString(),state:S},null,1); }
function saveFile(name,text,mime){
  return new Promise(function(resolve){
    var blob=new Blob([text],{type:mime}), file=null;
    function download(){
      try{
        var u=URL.createObjectURL(blob), a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(u); },8000); resolve(true);
      }catch(e){ resolve(false); }
    }
    try{ file=new File([blob],name,{type:mime}); }catch(e){}
    if(file && navigator.canShare && navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:name}).then(function(){ resolve(true); },function(e){ if(e && e.name==='AbortError') resolve(false); else download(); });
    } else download();
  });
}
function doBackup(){
  return saveFile('backup-financas-'+todayIso()+'.json',backupText(),'application/json').then(function(ok){
    if(ok){ S.set.bk=todayIso(); S.set.snooze=''; commit('Backup salvo. Guarde o arquivo em um lugar seguro.'); }
    return ok;
  });
}
function csvCell(s){ return '"'+String(s).replace(/"/g,'""')+'"'; }
function csvNum(v){ return nf.format(v).replace(/\./g,''); }
function csvWallet(k){
  var lines=['Data;Descrição;Categoria;Tipo;Valor;Situação'];
  monthRows(k).forEach(function(r){
    lines.push([dfull(r.dt),csvCell(r.d),csvCell(r.inv?'Fatura do cartão':catInfo(r.cat,r.k).n),r.k==='in'?'Receita':'Despesa',csvNum(r.v),r.done?(r.k==='in'?'Recebido':'Pago'):'Pendente'].join(';'));
  });
  return '﻿'+lines.join('\r\n');
}
function csvInvoice(k,cd){
  var lines=['Data;Descrição;Categoria;Parcela;Parcelas restantes;Valor da parcela'];
  invRows(k,cd.id).sort(function(a,b){ return a.it.dt<b.it.dt?-1:1; }).forEach(function(r){
    var it=r.it;
    lines.push([dfull(it.dt),csvCell(it.d),csvCell(catInfo(it.cat,'out').n),it.t>1?(r.n+'/'+it.t):'À vista',it.t>1?(it.t-r.n+1):'',csvNum(r.v)].join(';'));
  });
  return '﻿'+lines.join('\r\n');
}
function resetNav(){ G.month=curK(); G.cid=null; G.inv=null; G.wf='all'; G.wq=''; G.cq=''; G.ccat=''; G.psel=null; }
function pageData(){
  openPage({title:'Backup e planilhas',build:function(body){
    var cd=card(G.cid)||S.cards[0]||null, inv=cd?(G.inv||firstOpen(cd.id)):null, pre=null;
    try{ pre=localStorage.getItem(LS_PRE); }catch(e){}
    var h='<p class="hint">Seus lançamentos ficam só neste aparelho. O backup é um arquivo com tudo, para guardar ou levar para outro celular.'+(validIso(S.set.bk)?' Último backup em '+dfull(S.set.bk)+'.':'')+'</p>'+
      '<button type="button" class="btn primary block" id="dBackup">Salvar backup</button>'+
      '<button type="button" class="link" id="dShow">Mostrar o texto do backup para copiar</button>'+
      '<textarea class="inp hide" id="dOut" readonly aria-label="Texto do backup"></textarea>'+
      '<div class="grp"><h3>Restaurar backup</h3><div class="f"><label for="dFile">Arquivo de backup (.json)</label><input class="inp" id="dFile" type="file" accept=".json,application/json,text/plain"></div>'+
      '<div class="f"><label for="dPaste">Ou cole o texto do backup</label><textarea class="inp" id="dPaste" placeholder="{ ... }"></textarea></div>'+
      '<p class="err hide" id="dErr" role="alert"></p><button type="button" class="btn block" id="dRestore">Restaurar</button>'+
      (pre?'<button type="button" class="btn block" id="dPre">Voltar aos dados de antes da atualização</button>':'')+'</div>'+
      '<div class="grp"><h3>Planilhas (CSV)</h3><button type="button" class="btn block" id="dCsvW">Lançamentos de '+mname(G.month)+'</button>'+
      (cd?'<button type="button" class="btn block" id="dCsvI">Fatura de '+mlab(inv)+' do '+esc(cd.name)+'</button>':'')+'</div>'+
      '<div class="grp"><h3>Começar do zero</h3><button type="button" class="btn danger block" id="dReset">Apagar todos os dados</button></div>';
    body.innerHTML=h;
    $('dBackup').addEventListener('click',function(){ doBackup(); });
    $('dShow').addEventListener('click',function(){ var o=$('dOut'); o.value=backupText(); o.classList.remove('hide'); o.focus(); o.select(); });
    $('dFile').addEventListener('change',function(){
      var f=$('dFile').files[0]; if(!f) return;
      var rd=new FileReader(); rd.onload=function(){ $('dPaste').value=String(rd.result); }; rd.readAsText(f);
    });
    var parsed=null;
    armed($('dRestore'),function(){
      showErr('dErr',''); parsed=null;
      var data=null; try{ data=JSON.parse($('dPaste').value.trim()); }catch(e){}
      var n=data?normalize(data.state?data.state:data):null;
      if(!n){ showErr('dErr','Esse conteúdo não é um backup válido deste app.'); return null; }
      parsed=n;
      return 'Toque de novo: troca seus dados por '+plural(n.items.length+n.tx.length+n.rec.length,'lançamento','lançamentos');
    },function(){
      if(!parsed) return;
      S=parsed; S.set.bk=todayIso(); applyTheme(); resetNav(); closeAllPages(); commit('Backup restaurado.');
    });
    if(pre) armed($('dPre'),'Toque de novo: troca os dados atuais pelos antigos',function(){
      var d=null; try{ d=JSON.parse(pre); }catch(e){}
      var n=d?normalize(d):null; if(!n){ toast('A cópia antiga não pôde ser lida.'); return; }
      S=n; applyTheme(); resetNav(); closeAllPages(); commit('Dados de antes da atualização restaurados.');
    });
    $('dCsvW').addEventListener('click',function(){ saveFile('lancamentos-'+G.month+'.csv',csvWallet(G.month),'text/csv'); });
    if(cd) $('dCsvI').addEventListener('click',function(){ saveFile('fatura-'+inv+'.csv',csvInvoice(inv,cd),'text/csv'); });
    armed($('dReset'),'Toque de novo para apagar tudo',function(){
      S=fresh(); applyTheme(); resetNav(); closeAllPages(); commit('Dados apagados.');
    });
  }});
}

/* ---------- ações ---------- */
var PAGES = {balance:pageBalance,cards:pageCards,recur:pageRecur,budget:pageBudget,cats:pageCats,data:pageData};
ACT.pg=function(el){ var p=PAGES[attr(el,'p')]; if(p) p(); };
ACT.settings=function(){ pageSettings(); };
ACT['new']=function(el){ openEntry({kind:attr(el,'kind')||'',pay:attr(el,'pay')||''}); };
ACT.cardNew=function(){ openCardForm(null); };
ACT.cardEdit=function(el){ openCardForm(attr(el,'id')||G.cid); };
ACT.catd=function(el){ pageCat(attr(el,'v')); };
ACT.goal=function(el){ openGoal(attr(el,'id')||''); };
ACT.recOpen=function(el){
  var r=recById(attr(el,'id')); if(!r) return;
  var m=recMonth(r);
  if(!m){ S.rec=S.rec.filter(function(x){ return x!==r; }); commit('Esse lançamento não tinha mais meses ativos e foi removido.'); return; }
  openEntry({key:r.id+':'+m,scope:'next'});
};
ACT.theme=function(el){ S.set.theme=attr(el,'v'); applyTheme(); commit(); };
ACT.reload=function(){ location.reload(); };
ACT.backupNow=function(){ doBackup(); };

/* ===== partida ===== */
loadState();
applyTheme();
try{ if(history.state && history.state.pg) history.replaceState(null,''); }catch(e){}
render();
try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}

/* o app pode ficar aberto de um dia para o outro: ao voltar, atualiza "hoje" e o mês */
var bootDay = todayIso();
document.addEventListener('visibilitychange',function(){
  if(document.hidden || stack.length) return;
  var t=todayIso(); if(t===bootDay) return;
  if(G.month===bootDay.slice(0,7)) G.month=t.slice(0,7);
  bootDay=t; render();
});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}

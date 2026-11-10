/* Service worker: guarda o app no aparelho para abrir sem internet.
   Com internet, a página principal vem sempre da rede (assim uma versão nova aparece na primeira abertura);
   sem internet ou com rede lenta, vem a cópia guardada. */
var VERSION = 'financas-__VERSION__';
var FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
var HOME = new URL('./', self.registration.scope).href;

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
function fromCache(key){ return caches.open(VERSION).then(function(c){ return c.match(key,{ignoreSearch:true}); }); }
self.addEventListener('fetch', function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==location.origin) return;
  var isPage=req.mode==='navigate' || url.href===HOME || url.href===HOME+'index.html';
  if(isPage){
    var net=fetch(HOME,{cache:'no-store'}).then(function(res){
      if(res && res.ok){ var copy=res.clone(); return caches.open(VERSION).then(function(c){ return c.put(HOME,copy); }).then(function(){ return res; }); }
      throw new Error('http');
    });
    e.waitUntil(net.catch(function(){}));
    var slow=new Promise(function(resolve){ setTimeout(resolve,2500); }).then(function(){ return fromCache(HOME); });
    e.respondWith(
      Promise.race([net.catch(function(){ return fromCache(HOME); }), slow]).then(function(r){ return r || net; }).catch(function(){ return fromCache(HOME); })
    );
    return;
  }
  e.respondWith(fromCache(req).then(function(hit){
    return hit || fetch(req).then(function(res){
      if(res && res.ok){ var copy=res.clone(); caches.open(VERSION).then(function(c){ c.put(req,copy); }); }
      return res;
    });
  }));
});

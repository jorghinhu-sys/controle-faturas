/* Service worker: guarda o app no aparelho para abrir sem internet.
   Troque VERSION a cada publicação para o celular pegar a versão nova. */
var VERSION = 'faturas-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==location.origin) return;
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res && res.ok){ var copy=res.clone(); caches.open(VERSION).then(function(c){ c.put(req,copy); }); }
        return res;
      }).catch(function(){ return hit || caches.match('index.html'); });
      return hit || net;
    })
  );
});

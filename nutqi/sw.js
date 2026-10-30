var VERSION='nutqi-v1.02';
var CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
var FONTS='nutqi-fonts-v1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(CORE);}));self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==VERSION&&x!==FONTS;}).map(function(x){return caches.delete(x);}));}));self.clients.claim();});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var u=new URL(e.request.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(function(c){return c.match(e.request).then(function(r){var net=fetch(e.request).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(e.request,res.clone());return res;}).catch(function(){return r;});return r||net;});}));
    return;
  }
  if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(function(res){var cp=res.clone();caches.open(VERSION).then(function(c){c.put('index.html',cp);});return res;}).catch(function(){return caches.match('index.html');}));return;}
  e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}));
});

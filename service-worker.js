const CACHE='addisub-v1.1.3';
const FILES=['./','./index.html','./styles.css','./app.js','./config.js','./math.js','./learning.js','./storage.js','./session.js','./rewards.js','./share.js','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('addisub-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request,{ignoreSearch:true}))||fetch(event.request)));});

const C='gh-keuken-online-v55';
const STATIC=['./manifest.json','./gastenhuis-logo.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(STATIC)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('gh-keuken-online-')&&k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  const url=new URL(req.url);
  const isNavigation=req.mode==='navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/gastenhuis-keukenhulp/');

  if(isNavigation){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(C).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
          return res;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(C).then(cache=>cache.put(req,copy)).catch(()=>{});
        return res;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});

const CACHE_NAME = 'churrascomaster-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

// Instalação do Service Worker e cache dos arquivos estáticos locais
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a ativação imediata
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições (Cache-First Strategy)
self.addEventListener('fetch', (event) => {
    // Ignorar requisições que não sejam GET ou sejam para o tracker/APIs de terceiros que não queremos cachear agressivamente
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. Se estiver no cache, retorna do cache
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. Se não estiver, busca na rede
            return fetch(event.request).then((networkResponse) => {
                // Verificação básica de resposta válida
                if (!networkResponse || networkResponse.status !== 200 && networkResponse.type !== 'opaque') {
                    return networkResponse;
                }

                // 3. Salva a resposta da rede no cache para uso futuro (Runtime Caching)
                // Isso inclui CDN do Tailwind e Google Fonts
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Fallback opcional caso esteja offline e o recurso não esteja no cache
                // Para este app Single Page, geralmente não é necessário lógica complexa aqui
            });
        })
    );
});
// Service Worker básico para PWA
// Este service worker es necesario para que los navegadores muestren el prompt de instalación

const CACHE_NAME = 'pelus-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Error al cachear', error);
      })
  );
  // Fuerza la activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma control inmediato de todas las páginas
  return self.clients.claim();
});

// Estrategia: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones GET y HEAD (el Cache API no soporta POST, PUT, DELETE, etc.)
  // Excluir peticiones a APIs, webhooks y funciones de Netlify
  const shouldCache = 
    (request.method === 'GET' || request.method === 'HEAD') &&
    !url.pathname.startsWith('/.netlify/functions/') &&
    !url.pathname.startsWith('/api/') &&
    url.protocol !== 'chrome-extension:' &&
    url.protocol !== 'chrome:' &&
    url.protocol !== 'moz-extension:';

  if (!shouldCache) {
    // Para peticiones que no deben ser cacheadas (POST, APIs, etc.), solo hacer fetch
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas y del mismo origen
        if (response && response.status === 200 && response.type === 'basic') {
          // Clonar la respuesta porque solo puede ser leída una vez
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, responseToCache);
            } catch (error) {
              // Ignorar errores de cache (puede fallar si la respuesta es muy grande o no es cacheable)
              console.warn('Service Worker: No se pudo cachear la respuesta', error);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde cache
        return caches.match(request);
      })
  );
});


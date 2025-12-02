const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'web-build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found at:', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Add manifest link if it doesn't exist
if (!html.includes('<link rel="manifest"')) {
  const manifestLink = '    <link rel="manifest" href="/manifest.json">\n';
  html = html.replace('</head>', manifestLink + '</head>');
  console.log('Manifest link added to index.html');
}

// Add service worker registration script if it doesn't exist
if (!html.includes('serviceWorker.register')) {
  const serviceWorkerScript = `  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration.scope);
          })
          .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
          });
      });
    }
  </script>
`;
  html = html.replace('</body>', serviceWorkerScript + '</body>');
  console.log('Service Worker registration added to index.html');
}

fs.writeFileSync(indexPath, html, 'utf8');


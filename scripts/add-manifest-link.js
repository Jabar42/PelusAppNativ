const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');
const publicPath = path.join(__dirname, '..', 'public');

// Verificar que el directorio dist existe
if (!fs.existsSync(distPath)) {
  console.error('Directory dist not found:', distPath);
  process.exit(1);
}

// Verificar que index.html existe
if (!fs.existsSync(indexPath)) {
  console.error('index.html not found at:', indexPath);
  process.exit(1);
}

// Copiar manifest.json desde public si existe (siempre sobrescribir)
const manifestSource = path.join(publicPath, 'manifest.json');
const manifestDest = path.join(distPath, 'manifest.json');
console.log('Checking manifest.json...');
console.log('  Source:', manifestSource, 'exists:', fs.existsSync(manifestSource));
console.log('  Dest:', manifestDest, 'exists:', fs.existsSync(manifestDest));
if (fs.existsSync(manifestSource)) {
  fs.copyFileSync(manifestSource, manifestDest);
  console.log('✓ Manifest.json copied to dist/');
} else {
  console.warn('⚠ Warning: manifest.json not found in public/');
}

// Copiar sw.js desde public si existe (siempre sobrescribir)
const swSource = path.join(publicPath, 'sw.js');
const swDest = path.join(distPath, 'sw.js');
console.log('Checking sw.js...');
console.log('  Source:', swSource, 'exists:', fs.existsSync(swSource));
console.log('  Dest:', swDest, 'exists:', fs.existsSync(swDest));
if (fs.existsSync(swSource)) {
  fs.copyFileSync(swSource, swDest);
  console.log('✓ sw.js copied to dist/');
} else {
  console.warn('⚠ Warning: sw.js not found in public/');
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
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration.scope);
            // Verificar actualizaciones periódicamente
            setInterval(() => {
              registration.update();
            }, 60000);
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
console.log('Post-build script completed successfully');


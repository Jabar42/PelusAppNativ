const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'web-build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found at:', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Check if manifest link already exists
if (html.includes('<link rel="manifest"')) {
  console.log('Manifest link already exists in index.html');
  process.exit(0);
}

// Add manifest link before the closing </head> tag
const manifestLink = '    <link rel="manifest" href="/manifest.json">\n';
html = html.replace('</head>', manifestLink + '</head>');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Manifest link added to index.html');


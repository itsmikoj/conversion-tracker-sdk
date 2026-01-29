#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copiar el archivo del plugin al directorio raíz para que Expo lo encuentre
const source = path.join(__dirname, 'src', 'index.js');
const dest = path.join(__dirname, 'index.js');

fs.copyFileSync(source, dest);

console.log('✅ Config plugin built successfully');

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n📦 Installing Conversion Tracker SDK dependencies...\n');

const requiredPackages = [
  'react-native-fbsdk-next',
  'expo-tracking-transparency',
  '@react-native-async-storage/async-storage',
  'expo-constants'
];

// Check if packages are already installed
const nodeModulesPath = path.join(process.cwd(), '..', '..', 'node_modules');

requiredPackages.forEach(pkg => {
  const pkgPath = path.join(nodeModulesPath, pkg);
  if (!fs.existsSync(pkgPath)) {
    console.log(`⚠️  ${pkg} not found, it will be installed automatically`);
  } else {
    console.log(`✅ ${pkg} already installed`);
  }
});

console.log('\n✨ Conversion Tracker SDK ready!\n');
console.log('📖 Quick start:');
console.log('   import { useConversionTracker } from "@itsmikoj/conversation-tracker-sdk";\n');

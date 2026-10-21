/**
 * FocusFlow v5.0.0 - Production Build & Packaging Script
 * Generates clean production artifacts in dist/ for Jenkins pipeline archiving
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Starting FocusFlow v5.0.0 Production Packaging...');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const bundleDir = path.join(distDir, 'FocusFlow-v5.0.0');

// Clean or create dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(bundleDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy core assets
const targets = ['index.html', 'css', 'js', 'assets', 'README.md', 'Dockerfile', 'nginx.conf'];
targets.forEach(target => {
  const srcPath = path.join(rootDir, target);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, path.join(bundleDir, target));
    console.log(`   + Bundled: ${target}`);
  }
});

// Write build metadata
const buildMeta = {
  appName: 'FocusFlow',
  version: '5.0.0',
  buildTimestamp: new Date().toISOString(),
  environment: 'production',
  ciEngine: 'Jenkins CI/CD Declarative Pipeline',
  container: 'Docker / Nginx Alpine'
};

fs.writeFileSync(
  path.join(bundleDir, 'build-info.json'),
  JSON.stringify(buildMeta, null, 2),
  'utf8'
);

console.log('✅ Production bundle assembled at dist/FocusFlow-v5.0.0/');
console.log('✅ Packaging complete!\n');

/**
 * FocusFlow v5.0.0 - DevOps CI/CD Automated Test Suite
 * Used by Jenkins Declarative Pipeline to run automated code quality,
 * syntax linting, security audits, and asset integrity verification.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=====================================================');
console.log('🚀 FOCUSFLOW CI/CD PIPELINE - AUTOMATED AUDIT & TEST');
console.log('=====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  process.stdout.write(`⏳ [TEST ${totalTests}] ${name}... `);
  try {
    fn();
    passedTests++;
    console.log('✅ PASSED');
  } catch (err) {
    failedTests++;
    console.log('❌ FAILED');
    console.error(`   Error: ${err.message}\n`);
  }
}

// 1. Verify Core Project Structure
runTest('Verify Project Root Structure & Critical Files', () => {
  const rootFiles = ['index.html', 'css/styles.css', 'README.md'];
  rootFiles.forEach(file => {
    const full = path.join(__dirname, '..', file);
    if (!fs.existsSync(full)) {
      throw new Error(`Required core file missing: ${file}`);
    }
  });
});

// 2. Validate HTML5 Structure
runTest('Validate index.html Structure & Semantic Tags', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (!html.includes('<!DOCTYPE html>')) throw new Error('Missing DOCTYPE declaration');
  if (!html.includes('<title>FocusFlow')) throw new Error('Missing or invalid page title');
  if (!html.includes('id="tab-rooms"')) throw new Error('Missing V4 Virtual Study Rooms module');
  if (!html.includes('id="notes-drawer"')) throw new Error('Missing V4 Focus Scratchpad module');
  if (!html.includes('id="time-display"')) throw new Error('Missing Pomodoro Timer component (time-display)');
});

// 3. JavaScript Syntax Verification
runTest('Validate JavaScript Syntax for All Core Modules', () => {
  const jsDir = path.join(__dirname, '..', 'js');
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  if (files.length === 0) throw new Error('No JavaScript files found in js/');
  
  files.forEach(file => {
    const filePath = path.join(jsDir, file);
    execSync(`node -c "${filePath}"`);
  });
});

// 4. Security Audit: Check for Unsafe Eval and Exposed Secrets
runTest('Security Audit — Check for Unsafe Functions & Secrets', () => {
  const jsDir = path.join(__dirname, '..', 'js');
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  const forbiddenPatterns = [
    { pattern: /eval\s*\(/g, name: 'Unsafe eval()' },
    { pattern: /document\.write\s*\(/g, name: 'Unsafe document.write()' },
    { pattern: /(api[_-]?key|secret|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi, name: 'Exposed API Secret' }
  ];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
    forbiddenPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        throw new Error(`Security violation in ${file}: detected ${name}`);
      }
    });
  });
});

// 5. CSS Glassmorphism Rules & Integrity Check
runTest('CSS Stylesheet & Liquid Glass Theme Integrity', () => {
  const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('.glass-card')) throw new Error('Missing liquid glass base token (.glass-card)');
  if (!css.includes('.notes-drawer')) throw new Error('Missing V4 notes drawer styling');
  if (!css.includes('.rooms-modal-card')) throw new Error('Missing V4 virtual rooms modal styling');
});

console.log('\n=====================================================');
console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} Passed | ${failedTests} Failed`);
console.log('=====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL CI TESTS PASSED! Ready for deployment.\n');
  process.exit(0);
}

#!/usr/bin/env node

/**
 * Post-build script for GitHub Pages deployment
 * - Adds .nojekyll file to prevent Jekyll processing
 * - Creates 404.html for SPA routing
 * - Ensures base tag is present in both index.html and 404.html
 * - Fixes asset paths for subdirectory deployment
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const nojekyllPath = path.join(distDir, '.nojekyll');
const notFoundPath = path.join(distDir, '404.html');
const indexPath = path.join(distDir, 'index.html');
const BASE_PATH = '/cryptoshield/';

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found');
  process.exit(1);
}

// Create .nojekyll file
fs.writeFileSync(nojekyllPath, '', 'utf8');
console.log('✅ Created .nojekyll file for GitHub Pages');

/**
 * Process HTML file to add base tag and fix asset paths
 */
function processHtmlFile(content) {
  let processedContent = content;

  // Add base tag if not present
  if (!processedContent.includes('<base')) {
    processedContent = processedContent.replace(
      '<head>',
      `<head>\n    <base href="${BASE_PATH}">`
    );
  }

  // Fix absolute paths in script and link tags
  processedContent = processedContent
    // Fix script src paths
    .replace(/src="\/([^"]+)"/g, `src="${BASE_PATH}$1"`)
    // Fix link href paths (but not external links or data URIs)
    .replace(/href="\/([^"]+)"/g, (match, path) => {
      if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('//')) {
        return match;
      }
      return `href="${BASE_PATH}${path}"`;
    });

  return processedContent;
}

// Read and process index.html
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = processHtmlFile(indexContent);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ Processed index.html with base path and asset fixes');

  // Create 404.html for SPA routing (copy of processed index.html)
  fs.writeFileSync(notFoundPath, indexContent, 'utf8');
  console.log('✅ Created 404.html for SPA routing');
} else {
  console.error('❌ index.html not found in dist directory');
  process.exit(1);
}

// Process _expo directory if it exists
const expoDir = path.join(distDir, '_expo');
if (fs.existsSync(expoDir)) {
  console.log('✅ Found _expo directory with bundled assets');
}

console.log('✅ Post-build configuration complete for GitHub Pages');
console.log(`📦 Deploy directory: ${distDir}`);
console.log(`🌐 Base path: ${BASE_PATH}`);

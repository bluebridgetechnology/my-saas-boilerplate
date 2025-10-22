const fs = require('fs');
const path = require('path');

// Copy the client-reference-manifest from root app to dashboard directory
const sourceFile = path.join('.next', 'server', 'app', 'page_client-reference-manifest.js');
const targetDir = path.join('.next', 'server', 'app', '(dashboard)');
const targetFile = path.join(targetDir, 'page_client-reference-manifest.js');

try {
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy the file if it exists
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Copied page_client-reference-manifest.js to dashboard directory');
  } else {
    console.log('⚠️ Source file not found:', sourceFile);
  }
} catch (error) {
  console.error('❌ Error copying file:', error);
  process.exit(1);
}

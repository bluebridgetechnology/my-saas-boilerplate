// Simple PWA icon generator
// This creates basic placeholder icons for PWA functionality
// In production, you should replace these with proper branded icons

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon
function createIconSVG(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white">RS</text>
    </svg>
  `;
}

// This would be used to generate actual PNG icons
// For now, we'll create placeholder files
console.log('PWA Icon Generator');
console.log('Icon sizes needed:', iconSizes);
console.log('SVG template:', createIconSVG(192));

// In a real implementation, you would:
// 1. Use a library like sharp or canvas to convert SVG to PNG
// 2. Generate all required icon sizes
// 3. Save them to the public/icons/ directory
// 4. Update the manifest.json with the correct paths

export { createIconSVG, iconSizes };

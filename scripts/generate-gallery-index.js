const fs = require('fs');
const path = require('path');

const baseGalleryPath = path.join(process.cwd(), 'public', 'content', 'gallery');
const outputPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gallery-index.json');

/**
 * Generate gallery index with file paths.
 * Image dimensions (width, height, orientation) are NOT extracted at build time
 * to avoid OutOfMemoryException from System.Drawing.Image on large batches.
 * DynamicImage.tsx will use orientation metadata when available, or accept any
 * image when metadata is absent (no runtime new Image() cost).
 *
 * To add dimension metadata later, use a dedicated image processing tool
 * (e.g., sharp in a separate Node script with stream processing).
 */
const index = {};

if (fs.existsSync(baseGalleryPath)) {
  const categories = fs.readdirSync(baseGalleryPath).filter(file => {
    try {
      return fs.statSync(path.join(baseGalleryPath, file)).isDirectory();
    } catch {
      return false;
    }
  });

  for (const cat of categories) {
    const portfolioPath = path.join(baseGalleryPath, cat, 'portfolio');
    if (fs.existsSync(portfolioPath)) {
      const files = fs.readdirSync(portfolioPath);
      index[cat] = files
        .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
        .map(file => ({
          path: `/content/gallery/${cat}/portfolio/${file}`,
        }));
    }
  }
}

// Ensure output directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
console.log('Gallery index generated at ' + outputPath);

const totalImages = Object.values(index).reduce((sum, arr) => sum + arr.length, 0);
console.log(`Total images indexed: ${totalImages}`);

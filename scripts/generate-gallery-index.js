const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const baseGalleryPath = path.join(process.cwd(), 'public', 'content', 'gallery');
const outputPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gallery-index.json');

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
        .map(file => {
          const filePath = path.join(portfolioPath, file);
          const urlPath = `/content/gallery/${cat}/portfolio/${file}`;
          try {
            const dimensions = sizeOf(filePath);
            return {
              src: urlPath,
              width: dimensions.width,
              height: dimensions.height,
              orientation: dimensions.width >= dimensions.height ? 'horizontal' : 'vertical'
            };
          } catch (e) {
            console.error(`Error reading dimensions for ${filePath}:`, e.message);
            return {
              src: urlPath,
              width: 0,
              height: 0,
              orientation: 'horizontal'
            };
          }
        });
    }
  }
}

// Ensure output directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
console.log('Gallery index generated at ' + outputPath);

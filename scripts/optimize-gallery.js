const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const baseGalleryPath = path.join(process.cwd(), 'public', 'content', 'gallery');

async function optimizeFolder(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await optimizeFolder(fullPath);
      continue;
    }

    // Só processa imagens que não terminam com .webp (para evitar loop)
    if (/\.(jpg|jpeg|png|avif)$/i.test(file)) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const outputName = `${name}.webp`;
      const outputPath = path.join(dir, outputName);

      console.log(`Processing: ${file}...`);

      try {
        await sharp(fullPath)
          .resize({
            width: 1920,
            height: 2500, // Altura máxima grande mas proporcional
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ quality: 80 })
          .toFile(outputPath);

        // Deleta o original se a conversão deu certo
        fs.unlinkSync(fullPath);
        console.log(`✓ Optimized: ${outputName}`);
      } catch (err) {
        console.error(`✗ Error processing ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  if (!fs.existsSync(baseGalleryPath)) {
    console.error('Directory not found:', baseGalleryPath);
    return;
  }

  console.log('--- GALLERY OPTIMIZATION STARTED ---');
  await optimizeFolder(baseGalleryPath);
  console.log('--- OPTIMIZATION COMPLETE ---');
  console.log('Updating index...');
  
  // Roda o indexador após a limpeza
  require('./generate-gallery-index.js');
}

run();

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
  { filename: 'logo.png', width: 600, quality: 70, format: 'webp' },
];

const inputDir = path.resolve(__dirname, './public/chips');
const outputDir = path.resolve(__dirname, './public/compressed');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

images.forEach(({ filename, width, quality, format }) => {
  const inputPath = path.join(inputDir, filename);
  const baseName = path.basename(filename, path.extname(filename)); 
  const outputPath = path.join(outputDir, `${baseName}.${format}`);

  let transformer = sharp(inputPath).resize(width);

  // Choose output format based on 'format' value
  switch (format) {
    case 'jpg':
    case 'jpeg':
      transformer = transformer.jpeg({ quality });
      break;
    case 'png':
      transformer = transformer.png({ quality, compressionLevel: 9 });
      break;
    case 'webp':
      transformer = transformer.webp({ quality });
      break;
    default:
      console.warn(`Unsupported format "${format}" for ${filename}`);
      return;
  }

  transformer
    .toFile(outputPath)
    .then(() =>
      console.log(
        `Compressed ${filename} → ${baseName}.${format} (width=${width}, quality=${quality})`
      )
    )
    .catch((err) => console.error(`Error processing ${filename}:`, err));
});

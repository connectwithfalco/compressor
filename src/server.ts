import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { join, extname, basename } from 'node:path';
import fs from 'node:fs';

const browserDistFolder = join(import.meta.dirname, '../browser');
const upload = multer({ dest: 'uploads/' });
const outputDir = join(process.cwd(), 'public/assets/images/compressed');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// --- API ENDPOINT for image compression ---
app.post('/api/upload', upload.single('image'), async (req: any, res: any) => {
  try {
    const { width = 600, quality = 70, format, comLevel = 9 } = req.body;
    const inputPath = req.file.path;
    const originalExt = extname(req.file.originalname).toLowerCase().replace('.', '');
    const baseName = basename(req.file.originalname, extname(req.file.originalname));
    const finalFormat = (format || originalExt).toLowerCase();
    const outputPath = join(outputDir, `${baseName}.${finalFormat}`);

    // --- SVG handling (pass-through, no rasterization) ---
    if (originalExt === 'svg' || finalFormat === 'svg') {
      fs.copyFileSync(inputPath, outputPath);
      fs.unlinkSync(inputPath);
      return res.download(outputPath, `${baseName}.svg`);
    }

    // Initialize sharp
    let transformer = sharp(inputPath).resize(parseInt(width));

    // --- Format-specific compression ---
    switch (finalFormat) {
      case 'jpg':
      case 'jpeg':
        transformer = transformer.jpeg({ quality: parseInt(quality) });
        break;

      case 'png':
        transformer = transformer.png({
          quality: parseInt(quality),
          compressionLevel: parseInt(comLevel),
        });
        break;

      case 'webp':
        transformer = transformer.webp({
          quality: parseInt(quality),
          effort: parseInt(comLevel), // WebP equivalent to compressionLevel
        });
        break;

      case 'svg': // Explicit case for output as SVG
        fs.copyFileSync(inputPath, outputPath);
        fs.unlinkSync(inputPath);
        return res.download(outputPath, `${baseName}.svg`);

      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    // Save the compressed file
    await transformer.toFile(outputPath);

    // Send back to client
    res.download(outputPath, `${baseName}.${finalFormat}`, () => {
      fs.unlinkSync(inputPath); // cleanup original uploaded file
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

// Serve static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// SSR catch-all
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);

import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import sharp from 'sharp';
import Potrace from 'oslllo-potrace';
import { extname, basename } from 'node:path';

// Multer in-memory storage (no filesystem)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await runMiddleware(req, res, upload);

    const { width = 600, quality = 70, format, comLevel = 9 } = req.body as any;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const buffer = req.file.buffer;
    const originalExt = extname(req.file.originalname).toLowerCase().replace('.', '');
    const baseName = basename(req.file.originalname, extname(req.file.originalname));
    const finalFormat = (format || originalExt).toLowerCase();

    // --- SVG handling ---
    if (finalFormat === 'svg') {
      let svg: string;
      if (originalExt === 'svg') {
        svg = buffer.toString();
      } else {
        const pngBuffer = await sharp(buffer).png().toBuffer();
        svg = await Potrace(pngBuffer).trace();
      }

      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    // --- Raster (jpg/png/webp) ---
    let transformer = sharp(buffer).resize(parseInt(width as string));

    switch (finalFormat) {
      case 'jpg':
      case 'jpeg':
        transformer = transformer.jpeg({ quality: parseInt(quality as string) });
        res.setHeader('Content-Type', 'image/jpeg');
        break;

      case 'png':
        transformer = transformer.png({
          quality: parseInt(quality as string),
          compressionLevel: parseInt(comLevel as string),
        });
        res.setHeader('Content-Type', 'image/png');
        break;

      case 'webp':
        transformer = transformer.webp({
          quality: parseInt(quality as string),
          effort: parseInt(comLevel as string),
        });
        res.setHeader('Content-Type', 'image/webp');
        break;

      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    const outBuffer = await transformer.toBuffer();
    res.send(outBuffer);

  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Image processing failed' });
  }
}

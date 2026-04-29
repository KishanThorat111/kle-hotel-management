/**
 * Image Compression Script — converts all JPGs in public/images/ to WebP
 * Usage: node scripts/compress-images.mjs
 * Requires: npm install sharp --save-dev
 *
 * After running, upload the /public/images/webp/ folder to Cloudflare R2.
 * Then update image src URLs in your components to use the R2/CDN URL.
 */

import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const INPUT_DIR  = new URL('../public/images', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const OUTPUT_DIR = new URL('../public/images/webp', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const QUALITY = 82; // 80-85 is visually lossless for photos

mkdirSync(OUTPUT_DIR, { recursive: true });

const files = readdirSync(INPUT_DIR).filter(f => {
  const ext = extname(f).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext) && statSync(join(INPUT_DIR, f)).isFile();
});

console.log(`\nCompressing ${files.length} images → WebP (quality ${QUALITY})\n`);

let totalOriginal = 0;
let totalCompressed = 0;

for (const file of files) {
  const inputPath  = join(INPUT_DIR, file);
  const outputName = basename(file, extname(file)) + '.webp';
  const outputPath = join(OUTPUT_DIR, outputName);

  const originalSize = statSync(inputPath).size;
  totalOriginal += originalSize;

  await sharp(inputPath)
    .resize({ width: 1920, withoutEnlargement: true }) // cap at 1920px wide
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(outputPath);

  const compressedSize = statSync(outputPath).size;
  totalCompressed += compressedSize;

  const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
  console.log(`  ${file.padEnd(40)} ${(originalSize/1024).toFixed(0).padStart(6)} KB  →  ${(compressedSize/1024).toFixed(0).padStart(5)} KB  (${savings}% saved)`);
}

const totalSavings = (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1);
console.log(`\n  TOTAL: ${(totalOriginal/1024/1024).toFixed(2)} MB  →  ${(totalCompressed/1024/1024).toFixed(2)} MB  (${totalSavings}% saved)`);
console.log(`\n  ✓ WebP files written to: ${OUTPUT_DIR}`);
console.log(`\n  Next steps:`);
console.log(`  1. Upload public/images/webp/ to Cloudflare R2`);
console.log(`  2. Set R2 public URL as CDN_URL in your .env`);
console.log(`  3. Update img src in LandingPage.tsx:\n`);
console.log(`     const CDN = import.meta.env.VITE_CDN_URL ?? '';`);
console.log(`     <img src={\`\${CDN}/images/webp/campus.webp\`} ... />\n`);

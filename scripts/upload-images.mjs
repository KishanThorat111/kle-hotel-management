/**
 * Upload compressed WebP images to Cloudflare R2 kle-assets bucket.
 * Reads CLOUDFLARE_API_TOKEN from .env.local automatically.
 *
 * Usage:
 *   npm run images:upload
 *
 * Prerequisites:
 *   - .env.local must contain CLOUDFLARE_API_TOKEN=...
 *   - Images must be in public/images/webp/*.webp (run `npm run images:compress` first)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load .env.local
const envPath = join(root, '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error('❌  CLOUDFLARE_API_TOKEN not found in .env.local');
  process.exit(1);
}

const webpDir = join(root, 'public', 'images', 'webp');
if (!existsSync(webpDir)) {
  console.error('❌  public/images/webp/ not found. Run: npm run images:compress');
  process.exit(1);
}

const files = readdirSync(webpDir).filter(f => f.endsWith('.webp'));
console.log(`\nUploading ${files.length} images to R2 bucket kle-assets/images/\n`);

let ok = 0;
for (const file of files) {
  const filePath = join(webpDir, file);
  process.stdout.write(`  ${file.padEnd(36)}`);
  try {
    execSync(
      `npx wrangler r2 object put "kle-assets/images/${file}" --file "${filePath}" --content-type "image/webp" --remote`,
      { env: process.env, stdio: 'pipe' }
    );
    console.log('✓ uploaded');
    ok++;
  } catch (e) {
    console.log('✗ FAILED');
    console.error(e.stderr?.toString());
  }
}

console.log(`\n${ok}/${files.length} files uploaded to R2.\n`);
if (ok === files.length) {
  console.log('✅  All images live at:');
  console.log('   https://pub-fd0ab08dad314949855afdfccd5131ec.r2.dev/images/<name>.webp\n');
}

/**
 * Cloudflare R2 CDN image helper.
 * Serves WebP images from kle-assets R2 bucket.
 * Public dev URL — replace with custom domain once configured:
 *   R2 bucket → Settings → Custom Domains → Add → assets.yourdomain.com
 */
const CDN = 'https://pub-fd0ab08dad314949855afdfccd5131ec.r2.dev';

/**
 * Returns the CDN URL for an image stored in R2.
 * @param name  Filename without extension (e.g. 'campus')
 * @returns     Full URL to the WebP image on R2 CDN
 */
export function img(name: string): string {
  return `${CDN}/images/${name}.webp`;
}

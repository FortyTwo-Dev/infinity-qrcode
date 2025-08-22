/**
 * @file types.ts
 * Useful types for QR code generation and management.
 */

/**
 * Supported QR code types, each corresponding to a specific data format:
 *
 * - 'text' : Plain text (e.g., "Hello world!")
 * 
 * - 'url'  : Valid URL (e.g., "https://example.com", "http://my-site.com")
 *   Expected format: `<scheme>://<domain>` (scheme = http/https)
 *
 * - 'wi-fi' : Wi-Fi configuration in standard format.
 *   Expected format: `WIFI:S:<SSID>;T:<Encryption>;P:<Password>;;`
 *   Example: `WIFI:S:MyNetwork;T:WPA;P:myPassword;;`
 *   - SSID: Wi-Fi network name
 *   - Encryption: Encryption type (WEP/WPA/WPA2)
 *   - Password: Network password
 *
 * - 'email' : Email address in `mailto:` format.
 *   Expected format: `mailto:<email@example.com>`
 *   Example: `mailto:contact@example.com`
 */
export type QrcodeType = 'text' | 'url' | 'wi-fi' | 'email';

/**
 * Error correction levels for QR codes:
 *
 * - 'L' : Low      (~7%  error correction) – Fast to scan, less damage-resistant.
 * - 'M' : Medium   (~15% error correction) – Balanced speed and resilience.
 * - 'Q' : Quartile (~25% error correction) – Good damage resistance.
 * - 'H' : High     (~30% error correction) – Very resilient, but slower to scan.
 *
 * @see [Official QR Code Specification](https://www.qrcode.com/en/about/error_correction.html)
 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Supported file formats for QR code export:
 *
 * - 'svg'  : Vector image (ideal for web and high-quality print).
 * - 'png'  : Raster image with transparency (medium quality, lightweight).
 * - 'webp' : Modern image format, good compression and quality (recommended for web).
 * - 'jpeg' : Raster image (lossy, but widely compatible).
 */
export type FormatType = 'svg' | 'png' | 'webp' | 'jpeg';

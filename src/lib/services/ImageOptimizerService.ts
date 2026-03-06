/**
 * Image Optimizer Service
 * Handles responsive images, format selection, and compression
 */

export interface ResponsiveImageConfig {
  src: string;
  alt: string;
  sizes?: string;
  srcSet?: string;
  webpSrcSet?: string;
}

export interface ImageOptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
}

export class ImageOptimizerService {
  private static readonly COMPRESSION_TARGET = 0.4; // 60% compression = 40% of original
  private static readonly IMAGE_BUDGET = 200 * 1024; // 200KB total

  /**
   * Generate responsive image srcset
   */
  static generateResponsiveImageSrcSet(
    baseUrl: string,
    sizes: number[] = [320, 640, 1024, 1920]
  ): string {
    return sizes
      .map((size) => {
        const url = this.appendSizeToUrl(baseUrl, size);
        return `${url} ${size}w`;
      })
      .join(', ');
  }

  /**
   * Generate WebP srcset with fallback
   */
  static generateWebPSrcSet(
    baseUrl: string,
    sizes: number[] = [320, 640, 1024, 1920]
  ): string {
    return sizes
      .map((size) => {
        const url = this.appendSizeToUrl(baseUrl, size);
        const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return `${webpUrl} ${size}w`;
      })
      .join(', ');
  }

  /**
   * Create responsive image element
   */
  static createResponsiveImage(config: ResponsiveImageConfig): HTMLPictureElement {
    const picture = document.createElement('picture');

    // WebP source
    if (config.webpSrcSet) {
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = config.webpSrcSet;
      if (config.sizes) {
        webpSource.sizes = config.sizes;
      }
      picture.appendChild(webpSource);
    }

    // Fallback source
    if (config.srcSet) {
      const jpegSource = document.createElement('source');
      jpegSource.srcset = config.srcSet;
      if (config.sizes) {
        jpegSource.sizes = config.sizes;
      }
      picture.appendChild(jpegSource);
    }

    // Fallback image
    const img = document.createElement('img');
    img.src = config.src;
    img.alt = config.alt;
    if (config.sizes) {
      img.sizes = config.sizes;
    }
    picture.appendChild(img);

    return picture;
  }

  /**
   * Detect network speed and serve appropriate resolution
   */
  static getAdaptiveImageUrl(
    baseUrl: string,
    effectiveType: string = '4g'
  ): string {
    let size = 1024; // Default

    switch (effectiveType) {
      case 'slow-4g':
        size = 320;
        break;
      case '3g':
        size = 640;
        break;
      case '4g':
        size = 1024;
        break;
    }

    return this.appendSizeToUrl(baseUrl, size);
  }

  /**
   * Calculate compression ratio
   */
  static calculateCompressionRatio(
    originalSize: number,
    compressedSize: number
  ): number {
    if (originalSize === 0) return 0;
    return (compressedSize / originalSize) * 100;
  }

  /**
   * Verify compression meets target
   */
  static meetsCompressionTarget(
    originalSize: number,
    compressedSize: number
  ): boolean {
    const ratio = this.calculateCompressionRatio(originalSize, compressedSize);
    return ratio <= this.COMPRESSION_TARGET * 100;
  }

  /**
   * Track total image size
   */
  static trackImageSize(size: number): number {
    // In a real implementation, this would track cumulative size
    return size;
  }

  /**
   * Check if image budget exceeded
   */
  static isBudgetExceeded(totalImageSize: number): boolean {
    return totalImageSize > this.IMAGE_BUDGET;
  }

  /**
   * Get image budget
   */
  static getImageBudget(): number {
    return this.IMAGE_BUDGET;
  }

  private static appendSizeToUrl(baseUrl: string, size: number): string {
    // Simple implementation - in real scenario would use image service
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}w=${size}`;
  }
}


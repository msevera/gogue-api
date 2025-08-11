import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import * as sharp from 'sharp';
import { uid } from 'uid';

export type UploadImageResult = {
  path: string;
  width: number;
  height: number;
  color: string;
  mimeType: string;
  extension: string;
};

@Injectable()
export class StorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage(); // Uses ADC (Application Default Credentials)
    this.bucketName =
      this.configService.get<string>('GCS_BUCKET_NAME');

    if (!this.bucketName) {
      throw new Error('GCS_BUCKET_NAME must be set');
    }
  }

  async uploadImageFromUrl(
    imageUrl: string,
    destinationPrefix,
  ): Promise<UploadImageResult> {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: 'arraybuffer',
      // Follow redirects and set a sensible timeout
      maxRedirects: 3,
      timeout: 15000,
    });

    const buffer = Buffer.from(response.data);

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new InternalServerErrorException('Unable to read image metadata');
    }

    // Compute average color by resizing to 1x1 in sRGB and reading the pixel
    const { data: pixel } = await sharp(buffer)
      .toColorspace('srgb')
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [r, g, b] = [pixel[0], pixel[1], pixel[2]];
    const averageColor = `#${[r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')}`;

    const extension = this.mapFormatToExtension(metadata.format);
    const contentType = this.mapFormatToMime(metadata.format);

    const filename = `${destinationPrefix}/${uid(32)}.${extension}`;

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    await file.save(buffer, {
      resumable: false,
      contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;

    return {
      path: publicUrl,
      mimeType: contentType,
      extension,
      width: metadata.width,
      height: metadata.height,
      color: averageColor,
    };
  }

  private mapFormatToExtension(format?: string): string {
    switch (format) {
      case 'jpeg':
        return 'jpg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      case 'gif':
        return 'gif';
      case 'tiff':
        return 'tif';
      case 'avif':
        return 'avif';
      case 'svg':
        return 'svg';
      default:
        return 'bin';
    }
  }

  private mapFormatToMime(format?: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'tiff':
        return 'image/tiff';
      case 'avif':
        return 'image/avif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }
}



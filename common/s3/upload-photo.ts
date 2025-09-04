import { ConfigService } from '@nestjs/config';
import { S3_PATCH_ENUM } from './enum/s3.pach.enum';
import { S3StorageService } from './storage.service';
import sharp from 'sharp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadPhotoService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Storage: S3StorageService,
  ) {}

  async uploadPhoto(
    file: Express.Multer.File,
    path: S3_PATCH_ENUM,
    name: string,
  ) {
    let urlImage = null;
    if (file) {
      const bucketName = this.configService.get('S3_BUCKET_NAME');
      if (!bucketName) {
        throw new Error('Ошибка сервера: Отсутствуют настройки S3');
      }
      const fullPath = `foodcourt/${path}/`;

      const fileName = `${name}.webp`;

      await this.s3Storage.deleteFile(bucketName, fullPath + fileName);

      const coverWebpBuffer = await sharp(file.buffer)
        .webp({ quality: 90, lossless: true })
        .toBuffer();

      await this.s3Storage.uploadFile(
        bucketName,
        fullPath + fileName,
        coverWebpBuffer,
        'image/webp',
      );
      urlImage = `https://${this.configService.get('S3_BUCKET_ID')}.selstorage.ru/${fullPath}${fileName}`;
    }
    return urlImage;
  }

  async deletePhoto(path: S3_PATCH_ENUM, name: string) {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('Ошибка сервера: Отсутствуют настройки S3');
    }
    try {
      const fullPath = `foodcourt/${path}/`;
      const fileName = `${name}.webp`;
      await this.s3Storage.deleteFile(bucketName, fullPath + fileName);
      return true;
    } catch {
      return false;
    }
  }
  async deletePhotoByPath(path: string) {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('Ошибка сервера: Отсутствуют настройки S3');
    }
    await this.s3Storage.deleteFile(bucketName, path);
  }
}

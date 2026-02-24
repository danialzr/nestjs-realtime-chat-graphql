import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadService {
  getFileUrl(file: Express.Multer.File, folder: string): string {
    return `/uploads/${folder}/${file.filename}`;
  }
}

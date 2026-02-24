import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException, 
  UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { multerOptions } from 'src/common/utils/file-upload.util';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions('avatars'))) 
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    
    if (!file) {
      throw new BadRequestException('Please upload an image file (key: file)');
    }

    return await this.uploadService.getFileUrl(file, 'avatars');
  }
}
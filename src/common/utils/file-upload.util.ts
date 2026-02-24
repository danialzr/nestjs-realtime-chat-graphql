import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

export const multerOptions = (folder: string) => {
  const uploadPath = join(process.cwd(), 'public', 'uploads', folder);

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only images (jpg, jpeg, png) are allowed!'), false);
      }
    },
    storage: diskStorage({
      destination: uploadPath,
      filename: (req, file, cb) => {
        const fileExt = extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        cb(null, uniqueName);
      },
    }),
  };
};

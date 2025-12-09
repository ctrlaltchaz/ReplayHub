import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocsUploadService {
    async uploadImage(file: Express.Multer.File): Promise<string> {
        // Use the same upload directory as avatars
        const uploadBaseDir = process.env.ASSET_UPLOAD_DIR || './data';
        const uploadsDir = path.join(uploadBaseDir, 'docs', 'images');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filepath, file.buffer);

        // Generate relative URL (will be served as /uploads/docs/images/filename)
        const imageUrl = `/uploads/docs/images/${filename}`;

        return imageUrl;
    }
}

import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
  Headers,
  UseGuards
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config'
import { FileService } from './file.service'
import * as sharp from 'sharp'
import * as fs from 'fs'
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthGuard } from './auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService
  ) {}

  @UseInterceptors(AnyFilesInterceptor())
  @Post('products/upload')
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    let arr = []
    
    fs.access("./uploads", (error) => {
      if (error) {
        fs.mkdirSync("./uploads");
      }
    });

    const f = files.map(async file => {
      const { buffer } = file
      const ref = `${uuid()}.webp`;

      // compress image
      await sharp(buffer)
        .webp({ quality: 70 })
        .toFile("./uploads/" + ref);
      const compressFile = join(process.cwd(), '/uploads/' + ref)

      // upload to DO
      const data = fs.readFileSync(compressFile)
      const path = await this.fileService.upload(data, ref, file.mimetype, 'products')

      // remove local file
      fs.unlink(compressFile, () => {});

      arr.push(path)
    })

    await Promise.all(f)
    
    return arr
  }

  @Post('products/delete')
  async deleteFiles(
    @Body() formData,
    @Headers('authorization') token
  ) {
    return await this.fileService.delete(formData, 'products', token);
  }
}

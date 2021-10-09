import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
  Headers,
  UseGuards,
  Param
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
    private readonly fileService: FileService
  ) {}

  @UseInterceptors(AnyFilesInterceptor())
  @Post(':bucket/upload')
  async uploadFiles(
    @Param('bucket') bucket,
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
      const path = await this.fileService.upload(data, ref, file.mimetype, bucket)

      // remove local file
      fs.unlink(compressFile, () => {});

      arr.push(path)
    })

    await Promise.all(f)
    
    return arr
  }

  @Post(':bucket/delete')
  async deleteFiles(
    @Param('bucket') bucket,
    @Body() formData,
    @Headers('authorization') token
  ) {
    if (bucket === 'products') {
      return await this.fileService.deleteProduct(formData, bucket, token);
    } else {
      return await this.fileService.delete(formData, bucket, token);
    }
  }
}

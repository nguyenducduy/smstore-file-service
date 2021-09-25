import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './file.service'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [AppController],
  providers: [FileService],
})
export class AppModule {}

import { Module, Global } from '@nestjs/common';
import { TokenService } from './token.service';

@Global()
@Module({
  exports: [TokenService],
  providers: [
      TokenService,
  ]
})
export class AuthModule {}

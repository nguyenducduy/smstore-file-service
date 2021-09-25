import { Injectable, Inject, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { TokenService } from './auth/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.headers.authorization
        && (req.headers.authorization as string).split(' ')[0] === 'Bearer'
    ) {
        const token = (req.headers.authorization as string).split(' ')[1];
        
        if (token && this.tokenService.verify(token)) {
          return true
        } else {
          return false
        }
    } else {
        throw new HttpException('Unauthorized', 403);
    }
  }
}

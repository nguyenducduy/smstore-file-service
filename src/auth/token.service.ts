import { decode, verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService
  ) {}

  public verify(token: string) {
    return verify(token, this.configService.get('HASURA_SECRET_KEY'));
  }

  public decode(bearer: string) {
    const token = (bearer as string).split(' ')[1];
    return decode(token);
  }
}

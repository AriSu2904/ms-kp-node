import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from './model/user.model';
import { TokenPayload } from './dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private redis: Cache,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  _decodeToken(token: string): TokenPayload | null {
    try {
      const jsonStr = Buffer.from(token, 'base64url').toString();
      const obj = JSON.parse(jsonStr) as TokenPayload;

      if (!obj.nik || !obj.fullName || !obj.date) {
        return null;
      }

      return obj;
    } catch (error) {
      Logger.error('[UserService] Error decoding token', error);
      throw new UnauthorizedException('TOKEN DECODE ERROR');
    }
  }

  async login(nik: string, token: string): Promise<User | Error> {
    Logger.debug('[UserService] incoming login request for nik' + nik);

    const validToken = this._decodeToken(token);
    if (!validToken) {
      throw new UnauthorizedException('INVALID TOKEN FORMAT');
    }

    const { nik: savedNik, fullName, date } = validToken;

    const savedToken = await this.redis.get<TokenPayload>(`user-${savedNik}`);

    if (!savedToken) {
      throw new UnauthorizedException('UNKNOWN TOKEN');
    }

    if (
      nik == savedNik &&
      fullName === savedToken.fullName &&
      date === savedToken.date
    ) {
      const payload = { sub: nik, username: fullName };
      const newToken = await this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
      });
      return {
        nik: savedNik,
        token: newToken,
      };
    }

    throw new UnauthorizedException('TOKEN INTEGRITY INVALID');
  }

  async generateToken(nik: string, fullName: string): Promise<User> {
    const date = new Date();
    const tokenObj: TokenPayload = {
      nik,
      fullName,
      date: date.toISOString(),
    };
    Logger.debug('[UserService] Generating token with object', tokenObj);
    const jsonStr = JSON.stringify(tokenObj);

    await this.redis.set(`user-${nik}`, tokenObj);
    const token = Buffer.from(jsonStr).toString('base64url');

    return {
      nik,
      token,
    };
  }
}

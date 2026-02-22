import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthInput } from './dto/input-auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService
  ) { }

  async register(data: AuthInput) {
    const { phone, password } = data;

    const exist = await this.userService.findByPhone(phone);
    if (exist) throw new BadRequestException('Phone already registered');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userService.create({
      phone,
      password: hashedPassword,
      name: `User_${phone.slice(-4)}`
    })

    const at = await this.accessToken(user.id, user.role);
    const rt = await this.refreshToken(user.id);

    await this.saveRefreshToken(user.id, rt);

    const { password: _, ...result } = user;
    return {
      user: result,
      accessToken: at,
      refreshToken: rt
    }
  }

  async login(data: AuthInput) {
    const { phone, password } = data;

    const user = await this.userService.findByPhone(phone);
    if (!user) throw new BadRequestException('Invalid credentials');

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) throw new BadRequestException('Invalid credentials');

    const at = await this.accessToken(user.id, user.role);
    const rt = await this.refreshToken(user.id);

    await this.saveRefreshToken(user.id, rt);

    const { password: _, ...result } = user;

    return {
      user: result,
      accessToken: at,
      refreshToken: rt,
    };
  }

  async logout(providedRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(providedRefreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET')
      });

      const userId = payload.sub;

      const userTokens = await this.prisma.refreshToken.findMany({
        where: { userId }
      });

      const currentToken = userTokens.find(t =>
        bcrypt.compareSync(providedRefreshToken, t.token)
      );

      if (currentToken) {
        await this.prisma.refreshToken.delete({
          where: { id: currentToken.id }
        });
      }

      return true;
    } catch (e) {
      return true;
    }
  }

  async refresh(providedRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(providedRefreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET')
      });

      const userId = payload.sub;

      const userTokens = await this.prisma.refreshToken.findMany({
        where: { userId }
      });

      const currentToken = userTokens.find(t =>
        bcrypt.compareSync(providedRefreshToken, t.token)
      );

      if (!currentToken) throw new BadRequestException('Access Denied');

      if (new Date() > currentToken.expiresAt) {
        await this.prisma.refreshToken.delete({ where: { id: currentToken.id } });
        throw new BadRequestException('Refresh token expired');
      }

      await this.prisma.refreshToken.delete({ where: { id: currentToken.id } });

      const user = await this.userService.findById(userId);
      if (!user) throw new BadRequestException('Invalid Token');

      const newAt = await this.accessToken(user.id, user.role);
      const newRt = await this.refreshToken(user.id);

      await this.saveRefreshToken(user.id, newRt);

      return {
        accessToken: newAt,
        refreshToken: newRt,
      }
    } catch (e) {
      throw new BadRequestException('Refresh process failed');
    }
  }

  private async accessToken(userId: string, role: string) {
    const payload = { sub: userId, role }
    return await this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('ACCESS_TOKEN_EXPIRE') || '15m'
    })
  }

  private async refreshToken(userId: string) {
    return await this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRE') || '14d'
      }
    )
  }

  private async saveRefreshToken(userId: string, token: string) {
    const hashedRefresh = await bcrypt.hash(token, 12);

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefresh,
        userId,
        expiresAt
      }
    });
  }
}

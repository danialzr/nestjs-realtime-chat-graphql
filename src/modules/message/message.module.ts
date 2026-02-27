import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { ChatGateway } from './message.gateway';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
      UserModule,
      ConfigModule,
      JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get('ACCESS_TOKEN_EXPIRE') || '15m',
          },
        }),
      }),],
  providers: [MessageResolver, MessageService, ChatGateway],
})
export class MessageModule {}

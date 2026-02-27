import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from './modules/auth/guards/gql-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from './casl/casl.module';
import { AbilitiesGuard } from './casl/guards/abilities.guard';
import { UploadModule } from './upload/upload.module';
import { RoomModule } from './modules/room/room.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    CaslModule,
    //Import Modules
    UserModule,
    AuthModule,
    UploadModule,
    RoomModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbilitiesGuard,
    }
  ],
})
export class AppModule { }

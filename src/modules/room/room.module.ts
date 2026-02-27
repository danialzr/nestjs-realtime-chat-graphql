import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomResolver } from './room.resolver';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [RoomResolver, RoomService],
})
export class RoomModule {}

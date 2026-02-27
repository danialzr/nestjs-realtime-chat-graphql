import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RoomService } from './room.service';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';
import { RoomModel } from './models/room.model';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { PaginationInput } from './dto/pagination-room.input';
import { CheckAbility } from 'src/casl/decorators/check-ability.decorator';
import { Action } from 'src/casl/types/ability.types';
import { RoomIdInput } from './dto/roomid.input';
import { MemberInput } from './dto/member.input';
import { JoinBySlugInput } from './dto/join-by-slug.input';
import { ChangeRoleInput } from './dto/change-member-role.input';

@Resolver(() => RoomModel)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) { }

  @Mutation(() => RoomModel, {
    name: 'createRoom'
  })
  async create(
    @GetUser('id') userId: string,
    @Args('createRoomInput') createRoomInput: CreateRoomInput
  ) {
    return await this.roomService.createRoom(userId, createRoomInput);
  }

  @Query(() => [RoomModel])
  async getMyRooms(@GetUser('id') userId: string) {
    return await this.roomService.getMyRoom(userId)
  }

  @CheckAbility({ action: Action.Manage, subject: 'all' })
  @Query(() => [RoomModel])
  async getAllRooms(@Args('data') data: PaginationInput) {
    return await this.roomService.getAllRooms(data);
  }

  @Mutation(() => RoomModel)
  async updateRoom(
    @Args('input') input: UpdateRoomInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.updateRoom(userId, input)
  }

  @Mutation(() => Boolean)
  async deleteRoom(
    @Args('input') input: RoomIdInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.deleteRoom(userId, input);
  }

  @Mutation(() => RoomModel)
  async addMember(
    @Args('input') input: MemberInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.addMember(userId, input);
  }

  @Mutation(() => RoomModel)
  async joinBySlug(
    @Args('input') input: JoinBySlugInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.joinBySlug(userId, input);
  }

  @Mutation(() => RoomModel)
  async removeMember(
    @Args('input') input: MemberInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.removeMember(userId, input);
  }

  @Mutation(() => Boolean)
  async leaveRoom(
    @Args('input') input: RoomIdInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.leaveRoom(userId, input)
  }

  @Mutation(() => RoomModel)
  async changeMemberRole(
    @Args('input') input: ChangeRoleInput,
    @GetUser('id') userId: string
  ) {
    return this.roomService.changeMemberRole(userId, input);
  }
}

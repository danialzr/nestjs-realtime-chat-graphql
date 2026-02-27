import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { CreateMessageInput } from './dto/create-message.input';
import { MessageModel } from './models/message.model';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { RoomMessageIdInput } from './dto/room-id.input';
import { EditMessageInput } from './dto/edit-message.input';

@Resolver(() => MessageModel)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) { }

  @Mutation(() => MessageModel)
  async create(
    @Args('input') input: CreateMessageInput,
    @GetUser('id') userId: string
  ) {
    return this.messageService.sendMessage(userId, input);
  }

  @Query(() => [MessageModel])
  async getRoomMessages(
    @GetUser('id') userId: string,
    @Args('input') input: RoomMessageIdInput,
  ) {
    return this.messageService.getRoomMessages(userId, input);
  }

  @Mutation(() => MessageModel)
  async editMessage(
    @GetUser('id') userId: string,
    @Args('input') input: EditMessageInput
  ) {
    return this.messageService.editMessage(userId, input);
  }

  @Mutation(() => Boolean, { name: 'deleteMessage' })
  async deleteMessage(
    @GetUser('id') userId: string,
    @Args('messageId') messageId: string,
  ) {
    await this.messageService.deletemessage(userId, messageId);
    return true;
  }
}

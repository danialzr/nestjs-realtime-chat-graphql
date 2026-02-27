import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';

@Resolver('Message')
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation('createMessage')
  create(@Args('createMessageInput') createMessageInput: CreateMessageInput) {
    return this.messageService.create(createMessageInput);
  }

  @Query('message')
  findAll() {
    return this.messageService.findAll();
  }

  @Query('message')
  findOne(@Args('id') id: number) {
    return this.messageService.findOne(id);
  }

  @Mutation('updateMessage')
  update(@Args('updateMessageInput') updateMessageInput: UpdateMessageInput) {
    return this.messageService.update(updateMessageInput.id, updateMessageInput);
  }

  @Mutation('removeMessage')
  remove(@Args('id') id: number) {
    return this.messageService.remove(id);
  }
}

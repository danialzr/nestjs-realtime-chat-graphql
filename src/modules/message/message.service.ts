import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RoomMessageIdInput } from './dto/room-id.input';
import { EditMessageInput } from './dto/edit-message.input';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) { }

  async sendMessage(userId: string, input: CreateMessageInput) {
    const { roomId, content } = input;

    await this.validateMembership(userId, roomId);

    const message = await this.prisma.message.create({
      data: {
        content,
        roomId,
        senderId: userId
      },
      include: {
        room: true,
        sender: true
      }
    });

    return message
  }

  async getRoomMessages(userId: string, input: RoomMessageIdInput) {
    await this.validateMembership(userId, input.roomId);

    return await this.prisma.message.findMany({
      where: { roomId: input.roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async editMessage(userId, input: EditMessageInput) {
    const message = await this.prisma.message.findUnique({
      where: { id: input.messageId }
    });

    if (!message) throw new NotFoundException('Message not found');

    if (message.senderId !== userId) throw new ForbiddenException('You can only edit your own messages');

    return await this.prisma.message.update({
      where: { id: input.messageId },
      data: { content: input.newContent },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async deletemessage(userId, messageId) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    await this.validateMembership(userId, message.roomId);

    if (!message.senderId === userId) throw new ForbiddenException('You do not have permission to delete this message');

    await this.prisma.message.delete({
      where: { id: messageId }
    });
  }

  private async validateMembership(userId: string, roomId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } }
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }
  }
}

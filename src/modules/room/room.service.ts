import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GroupRole, Room, RoomType } from '@prisma/client';
import { PaginationInput } from './dto/pagination-room.input';
import { MemberInput } from './dto/member.input';
import { JoinBySlugInput } from './dto/join-by-slug.input';
import { RoomIdInput } from './dto/roomid.input';
import { ChangeRoleInput } from './dto/change-member-role.input';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) { }

  async createRoom(creatorId: string, input: CreateRoomInput): Promise<Room> {

    const uniqueUsers = Array.from(new Set(input.participantIds));

    if (uniqueUsers.includes(creatorId)) throw new BadRequestException('You cannot create a room with yourself.');

    //Direct Room
    if (uniqueUsers.length === 1) {
      const targetUserId = uniqueUsers[0];

      const existDirect = await this.prisma.room.findFirst({
        where: {
          type: RoomType.DIRECT,
          AND: [
            { members: { some: { userId: creatorId } } },
            { members: { some: { userId: targetUserId } } },
          ]
        }, include: { members: true }
      });

      if (existDirect) return existDirect;

      return await this.prisma.room.create({
        data: {
          type: RoomType.DIRECT,
          members: {
            create: [
              { userId: creatorId, role: GroupRole.MEMBER },
              { userId: targetUserId, role: GroupRole.MEMBER },
            ]
          }
        }, include: { members: true }
      });
    }

    //Group Room
    if (!input.name) throw new BadRequestException('Group room must have a name');

    return await this.prisma.room.create({
      data: {
        name: input.name,
        type: RoomType.GROUP,
        members: {
          create: [
            { userId: creatorId, role: GroupRole.OWNER },
            ...uniqueUsers.map((id) => ({
              userId: id,
              role: GroupRole.MEMBER,
            }))
          ]
        }
      }, include: { members: true },
    });
  }

  async getMyRoom(userId: string): Promise<Room[]> {
    return await this.prisma.room.findMany({
      where: {
        members: {
          some: { userId }
        }
      }, include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }

  async getAllRooms(data: PaginationInput) {
    return await this.prisma.room.findMany({
      take: data.limit,
      skip: data.offset,
      include: {
        _count: {
          select: { members: true, messages: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async updateRoom(userId: string, input: UpdateRoomInput) {
    const { roomId, ...updateData } = input;

    const member = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId
        }
      }
    });

    if (!member || (member.role !== GroupRole.OWNER && member.role !== GroupRole.ADMIN)) {
      throw new BadRequestException('you dont have permission to update this room')
    }

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });

    if (!room) throw new BadRequestException('room not found');
    if (room?.type === RoomType.DIRECT) {
      throw new BadRequestException('cannot update direct');
    }

    if (updateData.slug) {
      updateData.slug = updateData.slug.trim();
      const formattedSlug = `d.dani/${updateData.slug}`;

      const existingSlug = await this.prisma.room.findUnique({
        where: { slug: formattedSlug }
      });

      if (existingSlug && existingSlug.id !== roomId) {
        throw new BadRequestException('This slug is already taken');
      }

      updateData.slug = formattedSlug;
    }

    return await this.prisma.room.update({
      where: { id: roomId },
      data: {
        ...updateData
      },
      include: { members: true }
    })
  }

  async deleteRoom(userId: string, input: RoomIdInput): Promise<boolean> {
    const { roomId } = input
    const member = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId
        }
      }
    });
    if (!member || member.role !== GroupRole.OWNER) {
      throw new BadRequestException('Only the owner can delete the entire room');
    }

    await this.prisma.room.delete({
      where: { id: roomId }
    })

    return true;
  }

  async addMember(adminId: string, input: MemberInput) {
    const requester = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: adminId,
          roomId: input.roomId
        }
      }
    });
    if (!requester || (requester.role !== GroupRole.ADMIN && requester.role !== GroupRole.OWNER)) {
      throw new BadRequestException('You do not have permission to add members');
    }

    const room = await this.prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room || room.type === RoomType.DIRECT) {
      throw new BadRequestException('Cannot add members to a direct room Or room not found');
    }

    const isAlreadyMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: { userId: input.userId, roomId: input.roomId }
      }
    });
    if (isAlreadyMember) throw new BadRequestException('this memmber already exist');

    await this.prisma.roomMember.create({
      data: {
        userId: input.userId,
        roomId: input.roomId,
        role: GroupRole.MEMBER
      }
    });

    return await this.prisma.room.findUnique({
      where: { id: input.roomId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async joinBySlug(userId: string, input: JoinBySlugInput) {
    const { slug } = input;

    const room = await this.prisma.room.findUnique({
      where: { slug },
      include: {
        members: true,
      },
    });
    if (!room) throw new NotFoundException('Room not found');

    if (room.type === RoomType.DIRECT) throw new BadRequestException('Cannot join a direct room');

    const isAlreadyMember = room.members.some((m) => m.userId === userId);
    if (isAlreadyMember) throw new BadRequestException('You are already a member of this room');

    await this.prisma.roomMember.create({
      data: {
        userId,
        roomId: room.id,
        role: GroupRole.MEMBER,
      },
    });

    return await this.prisma.room.findUnique({
      where: { id: room.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
    });
  }

  async removeMember(adminId: string, input: MemberInput) {
    const { roomId, userId } = input;

    const [requester, targetMember] = await Promise.all([
      this.prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: adminId, roomId } },
        include: { room: true }
      }),
      this.prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } }
      })
    ]);

    if (!requester) throw new BadRequestException('You are not a member of this room');
    if (!targetMember) throw new BadRequestException('User is not a member of this room');

    if (requester.room.type === RoomType.DIRECT) {
      throw new BadRequestException('Cannot remove members from a direct room');
    }

    if (requester.role === GroupRole.MEMBER) {
      throw new BadRequestException('You do not have permission to remove members');
    }

    if (targetMember.role === GroupRole.OWNER) {
      throw new BadRequestException('Cannot remove the room owner');
    }

    if (requester.role === GroupRole.ADMIN && targetMember.role === GroupRole.ADMIN) {
      throw new BadRequestException('Admins cannot remove other admins');
    }

    if (adminId === userId) {
      throw new BadRequestException('Use leaveRoom to remove yourself');
    }

    await this.prisma.roomMember.delete({ where: { id: targetMember.id } });

    return await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true } },
        _count: { select: { members: true, messages: true } }
      }
    });
  }

  async leaveRoom(userId: string, input: RoomIdInput) {
    const { roomId } = input;

    const member = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: { userId, roomId }
      }
    });
    if (!member) throw new BadRequestException('You are not a member of this room');

    const allMembers = await this.prisma.roomMember.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    if (allMembers.length === 1) {
      await this.prisma.room.delete({ where: { id: roomId } });
      return { message: 'room deleted beacause not hav member' };
    }

    if (member.role === GroupRole.OWNER) {
      const successor =
        allMembers.find(m => m.userId !== userId && m.role === GroupRole.ADMIN) ||
        allMembers.find(m => m.userId !== userId);

      if (successor) {
        await this.prisma.roomMember.update({
          where: { id: successor.id },
          data: { role: GroupRole.OWNER }
        });
      }
    }

    await this.prisma.roomMember.delete({
      where: { id: member.id }
    });

    return { message: 'leaved successsfully' };
  }

  async changeMemberRole(adminId: string, input: ChangeRoleInput) {
    const { roomId, targetId, newRole } = input;

    const [requester, target] = await Promise.all([
      this.prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: adminId, roomId } }
      }),
      this.prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: targetId, roomId } }
      })
    ]);

    if (!requester) throw new BadRequestException('You are not a member of this room');
    if (!target) throw new BadRequestException('Target user is not a member of this room');

    if (requester.role !== GroupRole.OWNER && requester.role !== GroupRole.ADMIN) {
      throw new BadRequestException('You do not have permission to change roles');
    }

    if (newRole === GroupRole.OWNER && requester.role !== GroupRole.OWNER) {
      throw new BadRequestException('Only the current owner can transfer ownership');
    }

    if (requester.role === GroupRole.ADMIN && target.role === GroupRole.ADMIN && adminId !== targetId) {
      throw new BadRequestException('Admins cannot change each others roles');
    }

    if (target.role === GroupRole.OWNER && newRole !== GroupRole.OWNER) {
      throw new BadRequestException('Cannot demote the owner. Transfer ownership first');
    }

    if (newRole === GroupRole.OWNER) {
      await this.prisma.roomMember.update({
        where: { id: requester.id },
        data: { role: GroupRole.ADMIN }
      });
    }

    await this.prisma.roomMember.update({
      where: { id: target.id },
      data: { role: newRole }
    });

    return await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true } },
        _count: { select: { members: true, messages: true } }
      }
    });
  }
}

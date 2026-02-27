import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    const uniqueUsers = Array.from(new Set(input.participantIds || []));

    if (uniqueUsers.includes(creatorId)) throw new BadRequestException('You cannot create a room with yourself.');

    if (uniqueUsers.length > 0) {
      const validUsersCount = await this.prisma.user.count({
        where: { id: { in: uniqueUsers } }
      });

      if (validUsersCount !== uniqueUsers.length) {
        throw new BadRequestException('One or more users do not exist.');
      }
    }

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
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
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
      }, include: { room: true }
    });

    if (!member) throw new NotFoundException('You are not a member of this room');

    if (member.role !== GroupRole.OWNER && member.role !== GroupRole.ADMIN) {
      throw new ForbiddenException('You dont have permission to update this room')
    }

    if (member.room.type === RoomType.DIRECT) {
      throw new BadRequestException('Cannot update direct chat');
    }

    if (updateData.slug) {
      const formattedSlug = `d.dani/${updateData.slug.trim()}`;

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
      data: updateData,
      include: { members: true }
    });
  }

  async deleteRoom(userId: string, input: RoomIdInput): Promise<boolean> {
    const { roomId } = input;

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    if (room.type === RoomType.DIRECT) throw new BadRequestException('Direct rooms cannot be deleted');

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
    const { roomId, userId } = input;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: { userId: { in: [adminId, userId] } }
        }
      }
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.type === RoomType.DIRECT) throw new BadRequestException('Cannot add members to a direct room');

    const requester = room.members.find(m => m.userId === adminId);
    const target = room.members.find(m => m.userId === userId);

    if (!requester || (requester.role !== GroupRole.ADMIN && requester.role !== GroupRole.OWNER)) {
      throw new ForbiddenException('You do not have permission to add members');
    }

    if (target) throw new BadRequestException('This member already exists in the room');

    return await this.prisma.roomMember.create({
      data: {
        userId,
        roomId,
        role: GroupRole.MEMBER
      },
      include: {
        room: {
          include: {
            members: { include: { user: true } }
          }
        }
      }
    }).then(m => m.room);
  }

  async joinBySlug(userId: string, input: JoinBySlugInput) {
    const { slug } = input;

    const room = await this.prisma.room.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId }
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.type === RoomType.DIRECT) throw new BadRequestException('Cannot join a direct room');

    if (room.members.length > 0) {
      throw new BadRequestException('You are already a member of this room');
    }

    const newMember = await this.prisma.roomMember.create({
      data: {
        userId,
        roomId: room.id,
        role: GroupRole.MEMBER,
      },
      include: {
        room: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true } }
              }
            },
            _count: {
              select: { messages: true, members: true }
            }
          }
        }
      }
    });

    return newMember.room;
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

    if (!requester) throw new ForbiddenException('You are not a member of this room');
    if (!targetMember) throw new NotFoundException('User is not a member of this room');

    if (requester.room.type === RoomType.DIRECT) {
      throw new BadRequestException('Cannot remove members from a direct room');
    }

    if (requester.role === GroupRole.MEMBER) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    if (targetMember.role === GroupRole.OWNER) {
      throw new ForbiddenException('Cannot remove the room owner');
    }

    if (requester.role === GroupRole.ADMIN && targetMember.role === GroupRole.ADMIN) {
      throw new ForbiddenException('Admins cannot remove other admins');
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

  async leaveRoom(userId: string, input: RoomIdInput): Promise<boolean> {
    const { roomId } = input;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true }
    });

    if (!room) throw new NotFoundException('Room not found');

    const member = room.members.find(m => m.userId === userId);
    if (!member) throw new ForbiddenException('You are not a member of this room');

    if (room.type === RoomType.DIRECT) {
      throw new BadRequestException('You cannot leave a direct chat. Use delete room instead.');
    }

    if (room.members.length === 1) {
      await this.prisma.room.delete({ where: { id: roomId } });
      return true;
    }

    if (member.role === GroupRole.OWNER) {
      const successor =
        room.members.find(m => m.userId !== userId && m.role === GroupRole.ADMIN) ||
        room.members.find(m => m.userId !== userId);

      if (!successor) {
        throw new InternalServerErrorException('Could not find a successor for the owner');
      }

      await this.prisma.$transaction([
        this.prisma.roomMember.update({
          where: { id: successor.id },
          data: { role: GroupRole.OWNER }
        }),
        this.prisma.roomMember.delete({
          where: { userId_roomId: { userId, roomId } }
        })
      ]);
    } else {
      await this.prisma.roomMember.delete({
        where: { userId_roomId: { userId, roomId } }
      });
    }

    return true;
  }

  async changeMemberRole(adminId: string, input: ChangeRoleInput) {
    const { roomId, targetId, newRole } = input;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          where: { userId: { in: [adminId, targetId] } }
        }
      }
    });

    if (!room) throw new NotFoundException('Room not found');
    if (room.type === RoomType.DIRECT) throw new BadRequestException('Cannot change roles in direct chat');

    const requester = room.members.find(m => m.userId === adminId);
    const target = room.members.find(m => m.userId === targetId);

    if (!requester) throw new ForbiddenException('You are not a member of this room');
    if (!target) throw new NotFoundException('Target user is not a member');

    if (requester.role !== GroupRole.OWNER && requester.role !== GroupRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to change roles');
    }

    if (newRole === GroupRole.OWNER && requester.role !== GroupRole.OWNER) {
      throw new ForbiddenException('Only the current owner can transfer ownership');
    }

    if (requester.role === GroupRole.ADMIN && target.role === GroupRole.ADMIN && adminId !== targetId) {
      throw new ForbiddenException('Admins cannot change each others roles');
    }

    if (target.role === GroupRole.OWNER && newRole !== GroupRole.OWNER) {
      throw new BadRequestException('Cannot demote the owner directly');
    }

    if (newRole === GroupRole.OWNER) {
      await this.prisma.$transaction([
        this.prisma.roomMember.update({
          where: { id: requester.id },
          data: { role: GroupRole.ADMIN }
        }),
        this.prisma.roomMember.update({
          where: { id: target.id },
          data: { role: GroupRole.OWNER }
        })
      ]);
    } else {
      await this.prisma.roomMember.update({
        where: { id: target.id },
        data: { role: newRole }
      });
    }

    return await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true } },
        _count: { select: { members: true, messages: true } }
      }
    });
  }
}

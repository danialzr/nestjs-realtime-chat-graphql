import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone }
    })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, });
  }

  async getMe(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            room: true
          }
        }
      }
    })
  }

  async updateProfile(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data
    })
  }

  async changePassword(id: string, oldPass: string, newPass: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(newPass, 12);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    return true
  }

  async searchUsers(query: string): Promise<any[]> {
    if (!query || query.trim() === '') return [];

    return await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } }
        ],
      },
      take: 20,
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
      }
    })
  }

  async changeRole(targetId: string, newRole: Role): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId }
    })
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'SUPER_ADMIN') throw new ForbiddenException('Cant change this user rol');

    return await this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');

    const result = await this.prisma.user.delete({
      where: { id },
    });

    return Boolean(result);
  }
}

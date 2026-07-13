import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        provider: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        setting: true,
        streak: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    // The setting row is created at registration; recreate defensively if absent.
    return this.prisma.setting.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}

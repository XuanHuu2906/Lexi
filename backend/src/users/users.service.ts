import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Account not found');
    if (
      dto.confirmation !== 'DELETE' ||
      !user.passwordHash ||
      Buffer.byteLength(dto.password, 'utf8') > 72 ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      // A bad confirmation password must not invalidate a valid mobile session.
      throw new ForbiddenException('Account deletion could not be confirmed');
    }
    return this.prisma.$transaction(async (db) => {
      // Same row lock as login/refresh, so deletion cannot race token issuance.
      await db.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const current = await db.user.findUnique({ where: { id: userId } });
      if (!current || current.passwordHash !== user.passwordHash) {
        throw new ForbiddenException('Account changed; confirm again');
      }
      await db.auditLog.updateMany({
        where: { adminId: userId },
        data: { adminId: null, adminEmail: 'deleted@account.invalid' },
      });
      await db.auditLog.updateMany({
        where: { target: `Người dùng: ${current.email}` },
        data: {
          target: 'Người dùng đã xóa',
          reason: null,
          before: null,
          after: null,
        },
      });
      // All owned learning rows and refresh tokens have FK ON DELETE CASCADE.
      // Existing access JWTs fail JwtStrategy's database lookup immediately.
      await db.user.delete({ where: { id: userId } });
      return { deleted: true };
    });
  }

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

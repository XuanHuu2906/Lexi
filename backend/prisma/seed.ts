import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Badge catalogue — `condition` is human-readable; the actual check lives in
// the gamification service (Phase 9). `code` is the stable identifier.
const BADGES = [
  {
    code: 'first_word',
    name: 'Từ đầu tiên',
    description: 'Lưu từ vựng đầu tiên vào sổ.',
    condition: 'Save at least 1 word',
    icon: '📗',
  },
  {
    code: 'word_collector_50',
    name: 'Nhà sưu tầm',
    description: 'Lưu 50 từ vào sổ từ vựng.',
    condition: 'Save at least 50 words',
    icon: '📚',
  },
  {
    code: 'streak_7',
    name: 'Tuần lễ chăm chỉ',
    description: 'Duy trì streak 7 ngày liên tiếp.',
    condition: 'Reach a 7-day streak',
    icon: '🔥',
  },
  {
    code: 'streak_30',
    name: 'Tháng kiên trì',
    description: 'Duy trì streak 30 ngày liên tiếp.',
    condition: 'Reach a 30-day streak',
    icon: '🏆',
  },
  {
    code: 'quiz_perfect',
    name: 'Điểm tuyệt đối',
    description: 'Đạt điểm tối đa trong một bài quiz.',
    condition: 'Score 100% on a quiz',
    icon: '⭐',
  },
  {
    code: 'first_conversation',
    name: 'Người trò chuyện',
    description: 'Hoàn thành buổi luyện hội thoại đầu tiên.',
    condition: 'Complete 1 conversation practice',
    icon: '💬',
  },
] as const;

async function main() {
  // Badges — idempotent upsert by code.
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        condition: badge.condition,
        icon: badge.icon,
      },
      create: badge,
    });
  }
  console.log(`Seeded ${BADGES.length} badges`);

  // A test user with default settings + streak.
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@lexi.app' },
    update: {},
    create: {
      email: 'test@lexi.app',
      passwordHash,
      emailVerified: true,
      setting: { create: {} }, // schema defaults
      streak: { create: {} },
    },
  });
  console.log(`Seeded test user: ${user.email} (password: "password123")`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

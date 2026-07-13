import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ScenarioDifficulty } from '../generated/prisma/client';

// Seeds the admin area:
//   1. Promotes (or creates) an admin account.
//   2. Seeds the conversation-scenario bank (idempotent by name).
//
// Run with:  npm run db:seed:admin
// Configure via env (optional):
//   ADMIN_EMAIL     (default admin@lexi.vn)
//   ADMIN_PASSWORD  (default admin12345 — only used if the account is created)

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@lexi.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345';

const SCENARIOS: {
  name: string;
  description: string;
  roleHint: string;
  difficulty: ScenarioDifficulty;
  enabled: boolean;
}[] = [
  { name: 'Tại sân bay', description: 'Làm thủ tục check-in và qua cửa an ninh', roleHint: 'Bạn là nhân viên hàng không tại quầy check-in.', difficulty: 'EASY', enabled: true },
  { name: 'Phỏng vấn xin việc', description: 'Trả lời câu hỏi phỏng vấn vị trí nhân viên', roleHint: 'Bạn là nhà tuyển dụng, hỏi ứng viên giới thiệu bản thân.', difficulty: 'HARD', enabled: true },
  { name: 'Đặt bàn nhà hàng', description: 'Gọi món và yêu cầu đặc biệt', roleHint: 'Bạn là phục vụ nhà hàng, chào khách và ghi order.', difficulty: 'MEDIUM', enabled: true },
  { name: 'Nhận phòng khách sạn', description: 'Check-in và hỏi tiện nghi', roleHint: 'Bạn là lễ tân khách sạn.', difficulty: 'EASY', enabled: true },
  { name: 'Họp nhóm dự án', description: 'Trình bày tiến độ và phân công công việc', roleHint: 'Bạn là quản lý dự án điều phối cuộc họp.', difficulty: 'HARD', enabled: false },
  { name: 'Mua sắm siêu thị', description: 'Hỏi giá và đổi trả hàng', roleHint: 'Bạn là nhân viên bán hàng siêu thị.', difficulty: 'EASY', enabled: true },
  { name: 'Hỏi đường', description: 'Hỏi và chỉ đường trong thành phố', roleHint: 'Bạn là người dân địa phương chỉ đường.', difficulty: 'EASY', enabled: false },
  { name: 'Gọi điện chăm sóc khách hàng', description: 'Xử lý khiếu nại qua điện thoại', roleHint: 'Bạn là tổng đài viên tiếp nhận khiếu nại.', difficulty: 'MEDIUM', enabled: true },
];

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN' },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      emailVerified: true,
      role: 'ADMIN',
      setting: { create: {} },
      streak: { create: {} },
    },
  });
  console.log(
    `Admin ready: ${admin.email} (role=ADMIN). ` +
      `If just created, password is "${ADMIN_PASSWORD}".`,
  );

  let created = 0;
  for (const s of SCENARIOS) {
    await prisma.conversationScenario.upsert({
      where: { name: s.name },
      update: {
        description: s.description,
        roleHint: s.roleHint,
        difficulty: s.difficulty,
      },
      create: s,
    });
    created++;
  }
  const total = await prisma.conversationScenario.count();
  console.log(`Seeded ${created} scenarios. Table total: ${total}.`);
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

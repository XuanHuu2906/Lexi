"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt = __importStar(require("bcrypt"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
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
];
async function main() {
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
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'test@lexi.app' },
        update: {},
        create: {
            email: 'test@lexi.app',
            passwordHash,
            emailVerified: true,
            setting: { create: {} },
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
//# sourceMappingURL=seed.js.map
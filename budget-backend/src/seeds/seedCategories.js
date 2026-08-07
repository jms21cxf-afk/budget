// 기본 카테고리 시드 — CLI(npm run seed) 및 서버 기동 시 자동 실행
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { connectMongo, disconnectMongo } from '../config/db.js';
import { Category } from '../models/Category.js';
import { defaultCategories } from './defaultCategories.js';

/** DB에 기본 카테고리가 없으면 삽입 (이미 있으면 skip) */
export async function ensureDefaultCategories({ force = false } = {}) {
  const existing = await Category.countDocuments({ isDefault: true });

  if (existing > 0 && !force) {
    return false;
  }

  if (force && existing > 0) {
    await Category.deleteMany({ isDefault: true });
    console.log('Removed existing default categories.');
  }

  for (const group of defaultCategories) {
    const { children, ...parentData } = group;
    const hasChildren = Array.isArray(children) && children.length > 0;

    // 하위 없음 → 단일 선택 카테고리
    if (!hasChildren) {
      await Category.create({
        ...parentData,
        isDefault: true,
      });
      continue;
    }

    const parent = await Category.create({
      ...parentData,
      isDefault: true,
    });

    for (const child of children) {
      await Category.create({
        ...child,
        parent: parent._id,
        type: parent.type,
        isDefault: true,
      });
    }
  }

  console.log('Default categories seeded.');
  return true;
}

async function runSeedCli() {
  const force = process.argv.includes('--force');

  await connectMongo();
  const seeded = await ensureDefaultCategories({ force });

  if (!seeded && !force) {
    console.log('Default categories already exist. Use npm run seed:reset to replace.');
  }

  await disconnectMongo();
}

// npm run seed 로 직접 실행될 때만
const isCli = process.argv[1] === fileURLToPath(import.meta.url);
if (isCli) {
  runSeedCli().catch(async (err) => {
    console.error('Seed failed:', err.message);
    await disconnectMongo();
    process.exit(1);
  });
}

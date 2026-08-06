// 기본 카테고리 시드 실행 — npm run seed / npm run seed:reset
import 'dotenv/config';
import { connectMongo, disconnectMongo } from '../config/db.js';
import { Category } from '../models/Category.js';
import { defaultCategories } from './defaultCategories.js';

const force = process.argv.includes('--force');

async function seedCategories() {
  const existing = await Category.countDocuments({ isDefault: true });

  if (existing > 0 && !force) {
    console.log('Default categories already exist. Use npm run seed:reset to replace.');
    return;
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
}

async function runSeed() {
  await connectMongo();
  await seedCategories();
  await disconnectMongo();
}

runSeed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await disconnectMongo();
  process.exit(1);
});

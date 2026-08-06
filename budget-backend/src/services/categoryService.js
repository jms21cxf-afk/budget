// 카테고리 비즈니스 로직 — CRUD
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { HttpError } from '../utils/httpError.js';

export async function listCategories({ type }) {
  const filter = type ? { type } : {};

  return Category.find(filter).populate('parent').sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryById(id) {
  const category = await Category.findById(id).populate('parent');
  if (!category) {
    throw new HttpError(404, 'Category not found');
  }
  return category;
}

export async function createCategory(data) {
  if (data.parent) {
    const parent = await Category.findById(data.parent);
    if (!parent) {
      throw new HttpError(400, 'Parent category not found');
    }
    // 하위 카테고리는 상위와 같은 수입/지출 타입
    data.type = parent.type;
  }

  return Category.create(data);
}

export async function updateCategory(id, data) {
  const existing = await Category.findById(id);
  if (!existing) {
    throw new HttpError(404, 'Category not found');
  }

  if (existing.isDefault) {
    throw new HttpError(403, 'Default category cannot be modified');
  }

  if (data.parent) {
    const parent = await Category.findById(data.parent);
    if (!parent) {
      throw new HttpError(400, 'Parent category not found');
    }
    data.type = parent.type;
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('parent');

  return category;
}

export async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.isDefault) {
    throw new HttpError(403, 'Default category cannot be deleted');
  }

  const usedCount = await Transaction.countDocuments({ category: id });
  if (usedCount > 0) {
    throw new HttpError(409, 'Category is used by transactions');
  }

  await category.deleteOne();
  return category;
}

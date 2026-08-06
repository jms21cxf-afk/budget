// 거래 템플릿 CRUD
import { Category } from '../models/Category.js';
import { TransactionTemplate } from '../models/TransactionTemplate.js';
import { HttpError } from '../utils/httpError.js';
import { attachCategoryId, attachCategoryIdList } from '../utils/transactionResponse.js';

const categoryPopulate = {
  path: 'category',
  populate: { path: 'parent' },
};

async function assertCategoryForTemplate(categoryId, type) {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new HttpError(400, 'Category not found');
  }
  if (category.type !== type) {
    throw new HttpError(400, 'Category type does not match template type');
  }
  return category;
}

export async function listTemplates({ type }) {
  const filter = type ? { type } : {};

  const templates = await TransactionTemplate.find(filter)
    .populate(categoryPopulate)
    .sort({ sortOrder: 1, label: 1 });

  return attachCategoryIdList(templates);
}

export async function getTemplateById(id) {
  const template = await TransactionTemplate.findById(id).populate(
    categoryPopulate,
  );
  if (!template) {
    throw new HttpError(404, 'Template not found');
  }
  return attachCategoryId(template);
}

export async function createTemplate(data) {
  await assertCategoryForTemplate(data.category, data.type);
  const template = await TransactionTemplate.create(data);
  return getTemplateById(template._id);
}

export async function updateTemplate(id, data) {
  const existing = await TransactionTemplate.findById(id);
  if (!existing) {
    throw new HttpError(404, 'Template not found');
  }

  const nextType = data.type ?? existing.type;
  const nextCategory = data.category ?? existing.category;

  await assertCategoryForTemplate(nextCategory, nextType);

  const template = await TransactionTemplate.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(categoryPopulate);

  return attachCategoryId(template);
}

export async function deleteTemplate(id) {
  const template = await TransactionTemplate.findByIdAndDelete(id);
  if (!template) {
    throw new HttpError(404, 'Template not found');
  }
  return template;
}

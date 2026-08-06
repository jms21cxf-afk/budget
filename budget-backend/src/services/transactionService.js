// 거래 내역 비즈니스 로직 — CRUD·월별 조회
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { HttpError } from '../utils/httpError.js';
import { attachCategoryId, attachCategoryIdList } from '../utils/transactionResponse.js';

const categoryPopulate = {
  path: 'category',
  populate: { path: 'parent' },
};

async function assertCategoryExists(categoryId) {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new HttpError(400, 'Category not found');
  }
  return category;
}

/** 월별·타입 필터 목록 (UI: 2026.8, 수입/지출 탭) */
export async function listTransactions({ type, year, month }) {
  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.occurredAt = { $gte: start, $lt: end };
  } else if (year) {
    // 통계 월별 — 해당 연도 전체
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    filter.occurredAt = { $gte: start, $lt: end };
  }

  const transactions = await Transaction.find(filter)
    .populate(categoryPopulate)
    .sort({ occurredAt: -1 });

  return attachCategoryIdList(transactions);
}

export async function getTransactionById(id) {
  const transaction = await Transaction.findById(id).populate(categoryPopulate);
  if (!transaction) {
    throw new HttpError(404, 'Transaction not found');
  }
  return attachCategoryId(transaction);
}

export async function createTransaction(data) {
  await assertCategoryExists(data.category);

  return Transaction.create(data);
}

export async function updateTransaction(id, data) {
  if (data.category) {
    await assertCategoryExists(data.category);
  }

  const transaction = await Transaction.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(categoryPopulate);

  if (!transaction) {
    throw new HttpError(404, 'Transaction not found');
  }

  return attachCategoryId(transaction);
}

export async function deleteTransaction(id) {
  const transaction = await Transaction.findByIdAndDelete(id);
  if (!transaction) {
    throw new HttpError(404, 'Transaction not found');
  }
  return transaction;
}

// 반복 규칙 비즈니스 로직 — CRUD·월별 Transaction 생성
import { Category } from '../models/Category.js';
import { RecurringRule } from '../models/RecurringRule.js';
import { Transaction } from '../models/Transaction.js';
import { HttpError } from '../utils/httpError.js';
import { getTransactionById } from './transactionService.js';

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

/** dayOfMonth → 해당 연·월의 실제 Date (말일 clamp) */
export function resolveOccurrenceDate(year, month, dayOfMonth) {
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function getMonthRange(year, month) {
  return {
    start: new Date(Number(year), Number(month) - 1, 1),
    end: new Date(Number(year), Number(month), 1),
  };
}

/** 규칙 생성 시점(anchor) 기준 N개월 간격·종료일 검사 */
export function shouldGenerateRuleForMonth(rule, year, month) {
  const anchor = rule.createdAt ?? new Date();
  const anchorYear = anchor.getFullYear();
  const anchorMonth = anchor.getMonth() + 1;
  const monthsDiff = (Number(year) - anchorYear) * 12 + (Number(month) - anchorMonth);

  if (monthsDiff < 0) {
    return { ok: false, reason: 'before_start' };
  }

  const interval = rule.intervalMonths ?? 1;
  if (monthsDiff % interval !== 0) {
    return { ok: false, reason: 'interval_skip' };
  }

  if (rule.endDate) {
    const occurrenceDate = resolveOccurrenceDate(year, month, rule.dayOfMonth);
    const end = new Date(rule.endDate);
    end.setHours(23, 59, 59, 999);
    if (occurrenceDate > end) {
      return { ok: false, reason: 'past_end_date' };
    }
  }

  return { ok: true };
}

export async function listRecurringRules() {
  return RecurringRule.find()
    .populate(categoryPopulate)
    .sort({ dayOfMonth: 1, createdAt: 1 });
}

export async function getRecurringRuleById(id) {
  const rule = await RecurringRule.findById(id).populate(categoryPopulate);
  if (!rule) {
    throw new HttpError(404, 'Recurring rule not found');
  }
  return rule;
}

export async function createRecurringRule(data) {
  await assertCategoryExists(data.category);
  return RecurringRule.create(data);
}

export async function updateRecurringRule(id, data) {
  if (data.category) {
    await assertCategoryExists(data.category);
  }

  const rule = await RecurringRule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(categoryPopulate);

  if (!rule) {
    throw new HttpError(404, 'Recurring rule not found');
  }

  return rule;
}

export async function deleteRecurringRule(id) {
  const rule = await RecurringRule.findByIdAndDelete(id);
  if (!rule) {
    throw new HttpError(404, 'Recurring rule not found');
  }
  return rule;
}

/** 활성 규칙 → 해당 월 Transaction 생성 (이미 있으면 skip) */
export async function generateTransactionsForMonth({ year, month }) {
  if (!year || !month) {
    throw new HttpError(400, 'year and month are required');
  }

  const rules = await RecurringRule.find({ isActive: true }).populate(
    categoryPopulate,
  );
  const { start, end } = getMonthRange(year, month);

  const created = [];
  const skipped = [];

  for (const rule of rules) {
    const schedule = shouldGenerateRuleForMonth(rule, year, month);
    if (!schedule.ok) {
      skipped.push({
        ruleId: rule._id,
        memo: rule.memo,
        reason: schedule.reason,
      });
      continue;
    }

    const existing = await Transaction.findOne({
      recurringRuleId: rule._id,
      occurredAt: { $gte: start, $lt: end },
    });

    if (existing) {
      skipped.push({
        ruleId: rule._id,
        memo: rule.memo,
        reason: 'already_exists',
      });
      continue;
    }

    const occurredAt = resolveOccurrenceDate(year, month, rule.dayOfMonth);

    const transaction = await Transaction.create({
      type: rule.type,
      amount: rule.amount,
      category: rule.category._id,
      paymentMethod: rule.paymentMethod,
      memo: rule.memo,
      occurredAt,
      recurringRuleId: rule._id,
    });

    const populated = await getTransactionById(transaction._id);
    created.push(populated);
  }

  return {
    created,
    skipped,
    summary: {
      createdCount: created.length,
      skippedCount: skipped.length,
    },
  };
}

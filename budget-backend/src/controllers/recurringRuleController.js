// 반복 규칙 API 컨트롤러
import * as recurringRuleService from '../services/recurringRuleService.js';

export async function listRecurringRules(_req, res) {
  const rules = await recurringRuleService.listRecurringRules();
  res.json(rules);
}

export async function getRecurringRule(req, res) {
  const rule = await recurringRuleService.getRecurringRuleById(req.params.id);
  res.json(rule);
}

export async function createRecurringRule(req, res) {
  const rule = await recurringRuleService.createRecurringRule(req.body);
  const populated = await recurringRuleService.getRecurringRuleById(rule._id);
  res.status(201).json(populated);
}

export async function updateRecurringRule(req, res) {
  const rule = await recurringRuleService.updateRecurringRule(
    req.params.id,
    req.body,
  );
  res.json(rule);
}

export async function deleteRecurringRule(req, res) {
  await recurringRuleService.deleteRecurringRule(req.params.id);
  res.status(204).send();
}

export async function generateForMonth(req, res) {
  const year = Number(req.body.year ?? req.query.year);
  const month = Number(req.body.month ?? req.query.month);

  const result = await recurringRuleService.generateTransactionsForMonth({
    year,
    month,
  });

  res.json(result);
}

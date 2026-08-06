// 반복 규칙 CRUD + 월별 생성 — /api/recurring-rules
import { Router } from 'express';
import * as recurringRuleController from '../controllers/recurringRuleController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateObjectId } from '../utils/validateObjectId.js';

const router = Router();

router.get('/', asyncHandler(recurringRuleController.listRecurringRules));
router.post(
  '/generate',
  asyncHandler(recurringRuleController.generateForMonth),
);
router.get(
  '/:id',
  validateObjectId(),
  asyncHandler(recurringRuleController.getRecurringRule),
);
router.post('/', asyncHandler(recurringRuleController.createRecurringRule));
router.patch(
  '/:id',
  validateObjectId(),
  asyncHandler(recurringRuleController.updateRecurringRule),
);
router.delete(
  '/:id',
  validateObjectId(),
  asyncHandler(recurringRuleController.deleteRecurringRule),
);

export default router;

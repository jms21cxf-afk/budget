// API 라우트 묶음 — /api 하위 경로 등록
import { Router } from 'express';
import categoriesRouter from './categories.js';
import healthRouter from './health.js';
import recurringRulesRouter from './recurringRules.js';
import transactionsRouter from './transactions.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/categories', categoriesRouter);
router.use('/transactions', transactionsRouter);
router.use('/recurring-rules', recurringRulesRouter);

export default router;

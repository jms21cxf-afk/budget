// 월별 메모 라우트 — /api/month-memos
import { Router } from 'express';
import * as monthMemoController from '../controllers/monthMemoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(monthMemoController.getMonthMemo));
router.put('/', asyncHandler(monthMemoController.upsertMonthMemo));

export default router;

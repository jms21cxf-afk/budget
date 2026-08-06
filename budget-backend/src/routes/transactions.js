// 거래 내역 CRUD 라우트 — /api/transactions
import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateObjectId } from '../utils/validateObjectId.js';

const router = Router();

router.get('/', asyncHandler(transactionController.listTransactions));
router.get(
  '/:id',
  validateObjectId(),
  asyncHandler(transactionController.getTransaction),
);
router.post('/', asyncHandler(transactionController.createTransaction));
router.patch(
  '/:id',
  validateObjectId(),
  asyncHandler(transactionController.updateTransaction),
);
router.delete(
  '/:id',
  validateObjectId(),
  asyncHandler(transactionController.deleteTransaction),
);

export default router;

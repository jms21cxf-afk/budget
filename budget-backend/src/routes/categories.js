// 카테고리 CRUD 라우트 — /api/categories
import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateObjectId } from '../utils/validateObjectId.js';

const router = Router();

router.get('/', asyncHandler(categoryController.listCategories));
router.get(
  '/:id',
  validateObjectId(),
  asyncHandler(categoryController.getCategory),
);
router.post('/', asyncHandler(categoryController.createCategory));
router.patch(
  '/:id',
  validateObjectId(),
  asyncHandler(categoryController.updateCategory),
);
router.delete(
  '/:id',
  validateObjectId(),
  asyncHandler(categoryController.deleteCategory),
);

export default router;

// 카테고리 API 컨트롤러
import * as categoryService from '../services/categoryService.js';

export async function listCategories(req, res) {
  const { type } = req.query;
  const categories = await categoryService.listCategories({ type });
  res.json(categories);
}

export async function getCategory(req, res) {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json(category);
}

export async function createCategory(req, res) {
  const category = await categoryService.createCategory(req.body);
  const populated = await categoryService.getCategoryById(category._id);
  res.status(201).json(populated);
}

export async function updateCategory(req, res) {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json(category);
}

export async function deleteCategory(req, res) {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).send();
}

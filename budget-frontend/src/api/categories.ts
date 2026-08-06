// 카테고리 API — /api/categories CRUD
import { apiFetch, buildQuery } from './client';
import type {
  Category,
  CreateCategoryInput,
  TransactionType,
  UpdateCategoryInput,
} from '../types/category';

export async function getCategories(type?: TransactionType) {
  return apiFetch<Category[]>(`/categories${buildQuery({ type })}`);
}

export async function getCategory(id: string) {
  return apiFetch<Category>(`/categories/${id}`);
}

export async function createCategory(data: CreateCategoryInput) {
  return apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  return apiFetch<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}

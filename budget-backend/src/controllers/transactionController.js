// 거래 내역 API 컨트롤러
import * as transactionService from '../services/transactionService.js';

export async function listTransactions(req, res) {
  const { type, year, month } = req.query;
  const transactions = await transactionService.listTransactions({
    type,
    year,
    month,
  });
  res.json(transactions);
}

export async function getTransaction(req, res) {
  const transaction = await transactionService.getTransactionById(req.params.id);
  res.json(transaction);
}

export async function createTransaction(req, res) {
  const transaction = await transactionService.createTransaction(req.body);
  const populated = await transactionService.getTransactionById(transaction._id);
  res.status(201).json(populated);
}

export async function updateTransaction(req, res) {
  const transaction = await transactionService.updateTransaction(
    req.params.id,
    req.body,
  );
  res.json(transaction);
}

export async function deleteTransaction(req, res) {
  await transactionService.deleteTransaction(req.params.id);
  res.status(204).send();
}

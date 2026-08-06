// 거래 응답 — populate 실패해도 categoryId 유지
export function attachCategoryId(transaction) {
  const plain = transaction.toObject
    ? transaction.toObject({ virtuals: true })
    : { ...transaction };

  const populated = plain.category;
  const rawCategory =
    typeof transaction.get === 'function'
      ? transaction.get('category')
      : plain.category;

  // populate 성공 → 객체, 실패 → ObjectId 또는 null
  if (populated && typeof populated === 'object' && populated._id) {
    plain.categoryId = populated._id.toString();
  } else if (rawCategory && rawCategory.toString) {
    plain.categoryId = rawCategory.toString();
  } else {
    plain.categoryId = null;
  }

  if (!populated || typeof populated !== 'object' || !populated._id) {
    plain.category = null;
  }

  return plain;
}

export function attachCategoryIdList(transactions) {
  return transactions.map(attachCategoryId);
}

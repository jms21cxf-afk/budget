// 거래(내역) 스키마 — 수입/지출 한 건 (목록·달력·월별 집계의 기본 단위)
import mongoose from 'mongoose';
import {
  PAYMENT_METHOD_VALUES,
  TRANSACTION_TYPE_VALUES,
} from './constants.js';

const transactionSchema = new mongoose.Schema(
  {
    // 수입 / 지출
    type: {
      type: String,
      enum: TRANSACTION_TYPE_VALUES,
      required: true,
      index: true,
    },
    // 금액 (원, 항상 양수 — 부호는 type으로 구분)
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    // 거래 일시 (날짜 + 시간 — UI: "4 화", "오전 11:29")
    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },
    // 카테고리 (예: 주거.통신)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // 결제 수단 (UI: 현금)
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      default: 'cash',
    },
    // 메모/내용 (UI: 빨래방)
    memo: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    // 반복 규칙에서 생성된 거래 (중복 생성 방지)
    recurringRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringRule',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// 월별 목록·필터 (수입/지출 탭, 합계)
transactionSchema.index({ type: 1, occurredAt: -1 });
// 카테고리별 집계
transactionSchema.index({ category: 1, occurredAt: -1 });
// 규칙별 월 1회 생성 체크
transactionSchema.index({ recurringRuleId: 1, occurredAt: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);

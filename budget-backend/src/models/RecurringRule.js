// 반복 거래 규칙 — 매월 같은 날·금액으로 Transaction 생성
import mongoose from 'mongoose';
import {
  PAYMENT_METHOD_VALUES,
  RECURRENCE_FREQUENCIES,
  TRANSACTION_TYPE_VALUES,
} from './constants.js';

const recurringRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: TRANSACTION_TYPE_VALUES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      default: 'cash',
    },
    memo: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    /** 매월 몇 일 (1~31, 말일 넘으면 해당 월 마지막 날) */
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    /** N개월마다 반복 (1 = 매월) */
    intervalMonths: {
      type: Number,
      default: 1,
      min: 1,
      max: 12,
    },
    /** 반복 종료일 — null이면 무기한 */
    endDate: {
      type: Date,
      default: null,
    },
    frequency: {
      type: String,
      enum: RECURRENCE_FREQUENCIES,
      default: 'monthly',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

recurringRuleSchema.index({ isActive: 1, dayOfMonth: 1 });

export const RecurringRule = mongoose.model('RecurringRule', recurringRuleSchema);

// 월별 메모 스키마 — 연·월당 한 건 (메모 탭)
import mongoose from 'mongoose';

const monthMemoSchema = new mongoose.Schema(
  {
    // 연도 (예: 2026)
    year: {
      type: Number,
      required: true,
      min: 1970,
      max: 2100,
    },
    // 월 (1~12)
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    // 메모 본문
    content: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// 연·월 조합은 유일
monthMemoSchema.index({ year: 1, month: 1 }, { unique: true });

export const MonthMemo = mongoose.model('MonthMemo', monthMemoSchema);

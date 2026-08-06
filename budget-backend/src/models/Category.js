// 카테고리 스키마 — 수입/지출 분류·아이콘 (예: 주거.통신)
import mongoose from 'mongoose';
import { TRANSACTION_TYPE_VALUES } from './constants.js';

const categorySchema = new mongoose.Schema(
  {
    // 상위 카테고리 (없으면 최상위 — 예: "주거")
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // 카테고리 이름 (예: "통신")
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    // 수입/지출 구분
    type: {
      type: String,
      enum: TRANSACTION_TYPE_VALUES,
      required: true,
    },
    // UI 아이콘 키 또는 이모지 (예: "phone", "🏠")
    icon: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    // 목록·필터에서 표시 순서
    sortOrder: {
      type: Number,
      default: 0,
    },
    // 앱 기본 제공 카테고리 여부
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// UI 표기용 "주거.통신" 형태 라벨
categorySchema.virtual('fullLabel').get(function fullLabel() {
  if (this.parent?.name) {
    return `${this.parent.name}.${this.name}`;
  }
  return this.name;
});

categorySchema.index({ type: 1, sortOrder: 1 });
// 같은 type·parent 안에서만 이름 중복 불가 (수입/지출 각각 '기타' 가능)
categorySchema.index({ type: 1, parent: 1, name: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);

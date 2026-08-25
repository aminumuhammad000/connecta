import mongoose, { Document, Schema } from 'mongoose';

export interface ICurrency extends Document {
  code: string;        // e.g. 'USD', 'NGN'
  name: string;        // e.g. 'US Dollar'
  symbol: string;      // e.g. '$'
  flag: string;        // e.g. '🇺🇸'
  rateToUSD: number;   // 1 USD = X Local Currency
  isActive: boolean;   // true if available to users
  createdAt: Date;
  updatedAt: Date;
}

const CurrencySchema = new Schema<ICurrency>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    flag: {
      type: String,
      default: '🌐',
      trim: true,
    },
    rateToUSD: {
      type: Number,
      required: true,
      default: 1.0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Currency = mongoose.model<ICurrency>('Currency', CurrencySchema);
export default Currency;

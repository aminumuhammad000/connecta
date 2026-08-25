import mongoose, { Schema } from 'mongoose';
const CurrencySchema = new Schema({
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
}, { timestamps: true });
const Currency = mongoose.model('Currency', CurrencySchema);
export default Currency;

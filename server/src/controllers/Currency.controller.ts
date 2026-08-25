import { Request, Response } from 'express';
import Currency from '../models/Currency.model.js';

export const INITIAL_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1.0, isActive: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 0.79, isActive: true },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 0.92, isActive: true },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', rateToUSD: 1500.0, isActive: true },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', rateToUSD: 130.0, isActive: true },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭', rateToUSD: 15.5, isActive: true },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬', rateToUSD: 3700.0, isActive: true },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', rateToUSD: 18.5, isActive: true },
];

/**
 * Seed initial currencies if table is empty
 */
export const seedInitialCurrencies = async () => {
  try {
    const count = await Currency.countDocuments();
    if (count === 0) {
      await Currency.insertMany(INITIAL_CURRENCIES);
      console.log('💰 [CurrencySeed] Default 8 currencies seeded into DB.');
    }
  } catch (err) {
    console.error('⚠️ [CurrencySeed] Failed to seed currencies:', err);
  }
};

/**
 * GET /api/currencies
 * Fetch currencies list. If query activeOnly=true, return active currencies only.
 */
export const getCurrencies = async (req: Request, res: Response) => {
  try {
    const { activeOnly } = req.query;
    const filter: any = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    const currencies = await Currency.find(filter).sort({ code: 1 });
    return res.status(200).json({
      success: true,
      data: currencies,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch currencies',
    });
  }
};

/**
 * POST /api/currencies
 * Admin: Create a new currency
 */
export const createCurrency = async (req: Request, res: Response) => {
  try {
    const { code, name, symbol, flag, rateToUSD, isActive } = req.body;

    if (!code || !name || !symbol) {
      return res.status(400).json({
        success: false,
        message: 'Currency Code, Name, and Symbol are required',
      });
    }

    const existing = await Currency.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Currency with code ${code.toUpperCase()} already exists`,
      });
    }

    const newCurrency = await Currency.create({
      code: code.toUpperCase(),
      name,
      symbol,
      flag: flag || '🌐',
      rateToUSD: rateToUSD !== undefined ? Number(rateToUSD) : 1.0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: `Currency ${newCurrency.code} created successfully`,
      data: newCurrency,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create currency',
    });
  }
};

/**
 * PUT /api/currencies/:id
 * Admin: Update currency details
 */
export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, symbol, flag, rateToUSD, isActive } = req.body;

    const currency = await Currency.findById(id);
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    if (name !== undefined) currency.name = name;
    if (symbol !== undefined) currency.symbol = symbol;
    if (flag !== undefined) currency.flag = flag;
    if (rateToUSD !== undefined) currency.rateToUSD = Number(rateToUSD);
    if (isActive !== undefined) currency.isActive = Boolean(isActive);

    await currency.save();

    return res.status(200).json({
      success: true,
      message: `Currency ${currency.code} updated successfully`,
      data: currency,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update currency',
    });
  }
};

/**
 * PATCH /api/currencies/:id/toggle
 * Admin: Toggle active/inactive status
 */
export const toggleCurrencyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const currency = await Currency.findById(id);
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    currency.isActive = !currency.isActive;
    await currency.save();

    return res.status(200).json({
      success: true,
      message: `Currency ${currency.code} set to ${currency.isActive ? 'Active' : 'Inactive'}`,
      data: currency,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to toggle currency status',
    });
  }
};

/**
 * DELETE /api/currencies/:id
 * Admin: Delete currency
 */
export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const currency = await Currency.findByIdAndDelete(id);
    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Currency ${currency.code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete currency',
    });
  }
};

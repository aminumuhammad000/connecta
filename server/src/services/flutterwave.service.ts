import axios from 'axios';

const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
const FLUTTERWAVE_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH || 'connecta_flw_secret_hash_2026';
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

export const flutterwaveService = {
  /**
   * Initialize a standard Multi-Currency Flutterwave Payment Checkout
   */
  initializePayment: async (params: {
    txRef: string;
    amount: number;
    currency: string;
    email: string;
    name: string;
    phone?: string;
    redirectUrl: string;
    title?: string;
    description?: string;
  }) => {
    try {
      const response = await axios.post(
        `${FLW_BASE_URL}/payments`,
        {
          tx_ref: params.txRef,
          amount: params.amount,
          currency: params.currency.toUpperCase(),
          redirect_url: params.redirectUrl,
          customer: {
            email: params.email,
            phonenumber: params.phone || '',
            name: params.name
          },
          customizations: {
            title: params.title || 'Connecta Escrow Deposit',
            description: params.description || 'Wallet funding & milestone escrow deposit',
            logo: 'https://app.myconnecta.ng/logo.png'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err: any) {
      console.error('Flutterwave Initialize Payment Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to initialize Flutterwave payment');
    }
  },

  /**
   * Verify a Flutterwave Transaction by ID
   */
  verifyTransaction: async (transactionId: string) => {
    try {
      const response = await axios.get(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
        }
      });
      return response.data;
    } catch (err: any) {
      console.error('Flutterwave Verify Transaction Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to verify transaction');
    }
  },

  /**
   * Get Bank & Mobile Money Provider List by Country (NG, KE, GH, UG, ZA)
   */
  getBankList: async (countryCode: string = 'NG') => {
    const code = (countryCode || 'NG').toUpperCase();
    try {
      const response = await axios.get(`${FLW_BASE_URL}/banks/${code}`, {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
        }
      });
      return response.data;
    } catch (err: any) {
      console.warn(`Flutterwave getBankList warning for ${countryCode}:`, err.response?.data || err.message);
      // Fallback standard bank lists if API key is in sandbox or offline
      const fallbackBanks: Record<string, any[]> = {
        NG: [
          { code: '044', name: 'Access Bank' },
          { code: '058', name: 'GTBank (Guaranty Trust Bank)' },
          { code: '033', name: 'United Bank for Africa (UBA)' },
          { code: '057', name: 'Zenith Bank' },
          { code: '50515', name: 'Moniepoint Microfinance Bank' },
          { code: '999992', name: 'OPay Digital Services' },
          { code: '50211', name: 'Kuda Bank' }
        ],
        KE: [
          { code: 'MPESA', name: 'M-Pesa Kenya Mobile Money' },
          { code: '01', name: 'KCB Bank Kenya' },
          { code: '63', name: 'Diamond Trust Bank' },
          { code: '68', name: 'Equity Bank Kenya' }
        ],
        GH: [
          { code: 'MTN', name: 'MTN Mobile Money Ghana' },
          { code: 'VODA', name: 'Vodafone Cash Ghana' },
          { code: 'ATL', name: 'AirtelTigo Money' },
          { code: '030100', name: 'Absa Bank Ghana' }
        ],
        UG: [
          { code: 'MTN_UG', name: 'MTN Mobile Money Uganda' },
          { code: 'AIRTEL_UG', name: 'Airtel Money Uganda' },
          { code: '04', name: 'Bank of Baroda Uganda' },
          { code: '01', name: 'Stanbic Bank Uganda' }
        ],
        ZA: [
          { code: '632005', name: 'Absa Bank South Africa' },
          { code: '470010', name: 'Capitec Bank' },
          { code: '250655', name: 'First National Bank (FNB)' },
          { code: '051001', name: 'Standard Bank South Africa' }
        ]
      };
      return { status: 'success', data: fallbackBanks[code] || fallbackBanks.NG };
    }
  },

  /**
   * Initiate Flutterwave Transfer (Direct Bank / Mobile Money Payout)
   */
  initiateTransfer: async (params: {
    accountBank: string;
    accountNumber: string;
    amount: number;
    currency: string;
    narration?: string;
    reference: string;
  }) => {
    try {
      const response = await axios.post(
        `${FLW_BASE_URL}/transfers`,
        {
          account_bank: params.accountBank,
          account_number: params.accountNumber,
          amount: params.amount,
          currency: params.currency.toUpperCase(),
          narration: params.narration || 'Connecta Wallet Withdrawal',
          reference: params.reference,
          callback_url: 'https://api.myconnecta.ng/api/payments/flutterwave/webhook'
        },
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err: any) {
      console.error('Flutterwave Initiate Transfer Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to process payout transfer via Flutterwave');
    }
  },

  /**
   * Verify Webhook Signature
   */
  verifyWebhookHash: (signature: string) => {
    return signature === FLUTTERWAVE_SECRET_HASH;
  }
};

export default flutterwaveService;

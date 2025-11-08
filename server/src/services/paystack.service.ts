import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: {
      email: string;
      customer_code: string;
    };
  };
}

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    transfer_code: string;
    reference: string;
    status: string;
  };
}

class PaystackService {
  private headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata?: any
  ): Promise<PaystackInitializeResponse> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Paystack uses kobo (smallest currency unit)
          reference,
          metadata,
          callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * Create a transfer recipient
   */
  async createTransferRecipient(
    accountNumber: string,
    bankCode: string,
    accountName: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack recipient creation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create transfer recipient');
    }
  }

  /**
   * Initiate a transfer (withdrawal)
   */
  async initiateTransfer(
    recipientCode: string,
    amount: number,
    reference: string,
    reason?: string
  ): Promise<PaystackTransferResponse> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transfer`,
        {
          source: 'balance',
          amount: amount * 100, // Convert to kobo
          recipient: recipientCode,
          reference,
          reason: reason || 'Withdrawal from Connecta',
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack transfer error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
    }
  }

  /**
   * Verify transfer status
   */
  async verifyTransfer(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transfer/verify/${reference}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack transfer verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify transfer');
    }
  }

  /**
   * List all banks
   */
  async listBanks(): Promise<any> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank?currency=NGN`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack list banks error:', error.response?.data || error.message);
      throw new Error('Failed to fetch banks');
    }
  }

  /**
   * Resolve account number
   */
  async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack account resolution error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to resolve account');
    }
  }
}

export default new PaystackService();

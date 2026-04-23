import axios from 'axios';
import crypto from 'crypto';

const VTSTACK_API_BASE_URL = 'https://api.vtstack.com.ng/api';
const VTSTACK_SECRET_KEY = process.env.VTSTACK_SECRET_KEY || 'sk_live_xxxxxxxxxxxxxxxxxxxx';

/**
 * VTStack Service
 * Handles interactions with VTStack payment gateway
 */
class VTStackService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: VTSTACK_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VTSTACK_SECRET_KEY,
      },
    });
  }

  /**
   * Create a dedicated virtual account for a user
   */
  async createVirtualAccount(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bvn: string;
    reference: string;
  }) {
    try {
      const response = await this.api.post('/virtual-accounts', {
        ...userData,
        identity: 'individual',
        identityType: 'individual',
      });
      return response.data;
    } catch (error: any) {
      console.error('VTStack Create Virtual Account Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create virtual account');
    }
  }

  /**
   * Fetch balance for a specific virtual account
   */
  async getAccountBalance(accountNumber: string) {
    try {
      const response = await this.api.get(`/virtual-accounts/${accountNumber}/balance`);
      return response.data;
    } catch (error: any) {
      console.error('VTStack Get Balance Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch account balance');
    }
  }

  /**
   * Fetch all virtual accounts
   */
  async fetchVirtualAccounts() {
    try {
      const response = await this.api.get('/virtual-accounts');
      return response.data;
    } catch (error: any) {
      console.error('VTStack Fetch Accounts Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch virtual accounts');
    }
  }

  /**
   * Fetch list of supported banks
   */
  async listBanks() {
    try {
      const response = await this.api.get('/banks');
      return response.data;
    } catch (error: any) {
      console.error('VTStack List Banks Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch banks');
    }
  }

  /**
   * Verify/Resolve a bank account
   */
  async resolveAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await this.api.get(`/banks/verify?bankCode=${bankCode}&accountNumber=${accountNumber}`);
      return response.data;
    } catch (error: any) {
      console.error('VTStack Resolve Account Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to resolve account');
    }
  }

  /**
   * Secure Payout via VTStack Payout API (HMAC-SHA256 signed)
   *
   * Security headers sent:
   *   Authorization:      Bearer <VTSTACK_PAYOUT_SECRET_KEY>
   *   X-Timestamp:        current UNIX timestamp in ms (string)
   *   X-Signature:        HMAC-SHA256(timestamp + rawBodyString, payoutSecretKey) as hex
   *   X-Idempotency-Key:  unique UUID to prevent duplicate payouts
   *
   * POST /v1/payout/secure/request
   */
  async securePayout(payload: {
    amount: number;       // in kobo (NGN smallest unit)
    bankCode: string;
    accountNumber: string;
    accountName: string;
    narration?: string;
  }): Promise<{ idempotencyKey: string;[key: string]: any }> {
    const payoutSecretKey = process.env.VTSTACK_PAYOUT_SECRET_KEY || '';
    if (!payoutSecretKey) {
      throw new Error('VTSTACK_PAYOUT_SECRET_KEY is not configured. Please set it in your .env file.');
    }

    const timestamp = Date.now().toString();
    const bodyString = JSON.stringify(payload);

    // Generate HMAC-SHA256 signature: hash(timestamp + rawBody)
    const signature = crypto
      .createHmac('sha256', payoutSecretKey)
      .update(timestamp + bodyString)
      .digest('hex');

    // Unique idempotency key to prevent duplicate payouts
    const idempotencyKey = crypto.randomUUID();

    console.log(`🔐 [VTStack Payout] Initiating secure payout: ₦${payload.amount / 100} → ${payload.accountNumber} (${payload.bankCode})`);
    console.log(`🔑 [VTStack Payout] Idempotency Key: ${idempotencyKey}`);

    try {
      const response = await axios.post(
        'https://api.vtstack.com.ng/api/payout/secure/request',
        bodyString,  // send pre-serialised string so signature matches exactly
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payoutSecretKey}`,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );

      console.log('✅ [VTStack Payout] Response:', response.data);
      return { ...response.data, idempotencyKey };
    } catch (error: any) {
      const errData = error.response?.data;
      console.error('❌ [VTStack Payout] Error:', errData || error.message);
      throw new Error(errData?.message || errData?.error || 'VTStack payout request failed');
    }
  }

  /**
   * Check the status of a payout by its reference
   */
  async getPayoutStatus(reference: string) {
    try {
      const response = await this.api.get(`/payout/status/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('VTStack Payout Status Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch payout status');
    }
  }
}

export default new VTStackService();

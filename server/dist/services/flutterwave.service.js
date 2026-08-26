import axios from 'axios';
const getSecretKey = () => process.env.FLUTTERWAVE_SECRET_KEY || '';
const getClientId = () => process.env.FLUTTERWAVE_CLIENT_ID || '';
const getPublicKey = () => process.env.FLUTTERWAVE_PUBLIC_KEY || '';
const getSecretHash = () => process.env.FLUTTERWAVE_SECRET_HASH || 'connecta_flw_secret_hash_2026';
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';
const FLW_OAUTH_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';
let cachedV4Token = '';
let tokenExpiry = 0;
/**
 * Get active Bearer Token for Flutterwave (supports v4 OAuth and v3 Secret Keys)
 */
const getAuthToken = async () => {
    const clientId = getClientId();
    const secretKey = getSecretKey();
    if (clientId && secretKey) {
        if (cachedV4Token && Date.now() < tokenExpiry) {
            return cachedV4Token;
        }
        try {
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', secretKey);
            params.append('grant_type', 'client_credentials');
            const response = await axios.post(FLW_OAUTH_URL, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (response.data?.access_token) {
                cachedV4Token = response.data.access_token;
                tokenExpiry = Date.now() + (response.data.expires_in || 300) * 1000 - 30000;
                return cachedV4Token;
            }
        }
        catch (err) {
            console.warn('Flutterwave OAuth Token error, falling back to raw secret key:', err.message);
        }
    }
    return secretKey;
};
export const flutterwaveService = {
    /**
     * Initialize a standard Multi-Currency Flutterwave Payment Checkout
     */
    initializePayment: async (params) => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(`${FLW_BASE_URL}/payments`, {
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
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (err) {
            console.error('Flutterwave Initialize Payment Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Failed to initialize Flutterwave payment');
        }
    },
    /**
     * Verify a Flutterwave Transaction by ID
     */
    verifyTransaction: async (transactionId) => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (err) {
            console.error('Flutterwave Verify Transaction Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Failed to verify transaction');
        }
    },
    /**
     * Get Bank & Mobile Money Provider List by Country (NG, KE, GH, UG, ZA)
     */
    getBankList: async (countryCode = 'NG') => {
        const code = (countryCode || 'NG').toUpperCase();
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${FLW_BASE_URL}/banks/${code}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (err) {
            console.warn(`Flutterwave getBankList warning for ${countryCode}:`, err.response?.data || err.message);
            // Fallback comprehensive bank lists if API key is in sandbox or offline
            const fallbackBanks = {
                NG: [
                    { code: '044', name: 'Access Bank' },
                    { code: '063', name: 'Access Bank (Diamond)' },
                    { code: '035A', name: 'ALAT by Wema' },
                    { code: '401', name: 'ASO Savings and Loans' },
                    { code: '050', name: 'Ecobank Nigeria' },
                    { code: '562', name: 'Ekondo Microfinance Bank' },
                    { code: '50126', name: 'Eyowo' },
                    { code: '070', name: 'Fidelity Bank' },
                    { code: '011', name: 'First Bank of Nigeria (FBN)' },
                    { code: '214', name: 'First City Monument Bank (FCMB)' },
                    { code: '058', name: 'GTBank (Guaranty Trust Bank)' },
                    { code: '030', name: 'Heritage Bank' },
                    { code: '301', name: 'Jaiz Bank' },
                    { code: '082', name: 'Keystone Bank' },
                    { code: '50211', name: 'Kuda Bank' },
                    { code: '565', name: 'One Finance (Carbon)' },
                    { code: '50515', name: 'Moniepoint Microfinance Bank' },
                    { code: '999992', name: 'OPay Digital Services' },
                    { code: '999991', name: 'PalmPay' },
                    { code: '076', name: 'Polaris Bank' },
                    { code: '101', name: 'Providus Bank' },
                    { code: '125', name: 'Rubies MFB' },
                    { code: '51310', name: 'Sparkle Microfinance Bank' },
                    { code: '221', name: 'Stanbic IBTC Bank' },
                    { code: '068', name: 'Standard Chartered Bank' },
                    { code: '232', name: 'Sterling Bank' },
                    { code: '100', name: 'Suntrust Bank' },
                    { code: '302', name: 'TAJ Bank' },
                    { code: '102', name: 'Titan Trust Bank' },
                    { code: '032', name: 'Union Bank of Nigeria' },
                    { code: '033', name: 'United Bank for Africa (UBA)' },
                    { code: '215', name: 'Unity Bank' },
                    { code: '566', name: 'VFD Microfinance Bank' },
                    { code: '035', name: 'Wema Bank' },
                    { code: '057', name: 'Zenith Bank' },
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
                ],
                US: [
                    { code: 'US_ACH', name: 'US Direct ACH Bank Wire Transfer' },
                    { code: 'US_WIRE', name: 'US Wire Transfer / International SWIFT' },
                    { code: 'PAYPAL', name: 'PayPal USD Payout' },
                    { code: 'STRIPE_DIRECT', name: 'Direct USD Bank Account' }
                ]
            };
            return { status: 'success', data: fallbackBanks[code] || fallbackBanks.US || fallbackBanks.NG };
        }
    },
    /**
     * Verify / Resolve Account Details via Flutterwave API
     */
    verifyAccount: async (accountNumber, accountBank) => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(`${FLW_BASE_URL}/accounts/resolve`, {
                account_number: accountNumber,
                account_bank: accountBank,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (err) {
            console.error('Flutterwave Verify Account Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Could not verify account details with Flutterwave');
        }
    },
    /**
     * Initiate Flutterwave Transfer (Direct Bank / Mobile Money Payout)
     */
    initiateTransfer: async (params) => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(`${FLW_BASE_URL}/transfers`, {
                account_bank: params.accountBank,
                account_number: params.accountNumber,
                amount: params.amount,
                currency: params.currency.toUpperCase(),
                narration: params.narration || 'Connecta Wallet Withdrawal',
                reference: params.reference,
                callback_url: 'https://api.myconnecta.ng/api/payments/flutterwave/webhook'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (err) {
            console.error('Flutterwave Initiate Transfer Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Failed to process payout transfer via Flutterwave');
        }
    },
    /**
     * Verify Webhook Signature
     */
    verifyWebhookHash: (signature) => {
        return signature === getSecretHash();
    }
};
export default flutterwaveService;

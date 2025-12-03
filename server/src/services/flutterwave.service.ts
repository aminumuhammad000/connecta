import axios from 'axios';

const FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-8f427e73ba259780bd824c1bd7b9ef67-X';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

interface FlutterwaveInitializeResponse {
    status: string;
    message: string;
    data: {
        link: string;
    };
}

interface FlutterwaveVerifyResponse {
    status: string;
    message: string;
    data: {
        id: number;
        tx_ref: string;
        flw_ref: string;
        device_fingerprint: string;
        amount: number;
        currency: string;
        charged_amount: number;
        app_fee: number;
        merchant_fee: number;
        processor_response: string;
        auth_model: string;
        ip: string;
        narration: string;
        status: string;
        payment_type: string;
        created_at: string;
        account_id: number;
        customer: {
            id: number;
            name: string;
            phone_number: string;
            email: string;
            created_at: string;
        };
        meta?: any; // Metadata passed during initialization
    };
}

class FlutterwaveService {
    private headers = {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
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
    ): Promise<FlutterwaveInitializeResponse> {
        try {
            const payload = {
                tx_ref: reference,
                amount,
                currency: 'NGN',
                redirect_url: 'https://connecta.app/payment/callback', // This will be intercepted by the WebView
                payment_options: 'card',
                meta: metadata,
                customer: {
                    email,
                },
                customizations: {
                    title: 'Connecta Payment',
                    description: 'Payment for job posting',
                    logo: 'https://connecta.app/logo.png', // Optional
                },
            };
            console.log('Sending payload to Flutterwave:', JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `${FLUTTERWAVE_BASE_URL}/payments`,
                payload,
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Flutterwave initialization error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initialize payment');
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(transactionId: string): Promise<FlutterwaveVerifyResponse> {
        try {
            const response = await axios.get(
                `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Flutterwave verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
        }
    }
}

export default new FlutterwaveService();


import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-['Inter']">
            <Nav />
            <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Privacy Policy</h1>

                    <div className="prose prose-slate max-w-none text-gray-600">
                        <p className="mb-6">Last updated: January 2026</p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
                        <p className="mb-4">
                            Connecta ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Service, or otherwise when you contact us.
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Personal Data:</strong> Name, email address, postal address, phone number, and other similar contact data.</li>
                            <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument.</li>
                            <li><strong>Credentials:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use personal information collected via our Service for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Sharing Your Information</h2>
                        <p className="mb-4">
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Security of Your Information</h2>
                        <p className="mb-4">
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Contact Us</h2>
                        <p className="mb-4">
                            If you have questions or comments about this policy, you may email us at privacy@myconnecta.ng.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;

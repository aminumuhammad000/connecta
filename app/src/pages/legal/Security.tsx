
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { Icon } from '@iconify/react';

const Security = () => {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-['Inter']">
            <Nav />
            <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                    <div className="flex items-center gap-4 mb-8 border-b pb-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <Icon icon="mdi:shield-check" width="32" height="32" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Security at Connecta</h1>
                    </div>

                    <div className="prose prose-slate max-w-none text-gray-600">
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            Security is not an afterthought at Connecta—it's a core feature. We are committed to protecting your data, your payments, and your identity with industry-leading standards.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Icon icon="mdi:lock" className="text-orange-500" /> Data Encryption
                                </h3>
                                <p className="text-sm">All sensitive data is encrypted at rest and in transit using TLS 1.2+ and AES-256 encryption standards.</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Icon icon="mdi:credit-card-check" className="text-orange-500" /> Secure Payments
                                </h3>
                                <p className="text-sm">We partner with global payment processors (Stripe, Paystack) that are PCI-DSS Level 1 compliant to ensure your financial data is never compromised.</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Icon icon="mdi:account-check" className="text-orange-500" /> Identity Verification
                                </h3>
                                <p className="text-sm">We employ rigorous KYC (Know Your Customer) processes to verify the identity of freelancers and clients, minimizing fraud.</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Icon icon="mdi:server-network" className="text-orange-500" /> Infrastructure Security
                                </h3>
                                <p className="text-sm">Our infrastructure is hosted on secure cloud providers with 24/7 monitoring, automated backups, and DDoS protection.</p>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Reporting Vulnerabilities</h2>
                        <p className="mb-4">
                            We value the contributions of the security research community. If you believe you have found a security vulnerability in Connecta, please report it to us at security@myconnecta.ng.
                        </p>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Security;

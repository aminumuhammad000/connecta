
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';

const TermsOfService = () => {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-['Inter']">
            <Nav />
            <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Terms of Service</h1>

                    <div className="prose prose-slate max-w-none text-gray-600">
                        <p className="mb-6">Last updated: January 2026</p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using Connecta ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Description of Service</h2>
                        <p className="mb-4">
                            Connecta is a freelance marketplace connecting clients with independent professionals. We provide a platform for finding, hiring, managing, and paying for freelance work.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. User Accounts</h2>
                        <p className="mb-4">
                            To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. User Conduct</h2>
                        <p className="mb-4">
                            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, impairs, or renders the Service less efficient.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Payments and Fees</h2>
                        <p className="mb-4">
                            Connecta charges fees for certain services, such as facilitating payments between Clients and Freelancers. All fees are clearly disclosed at the time of transaction.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Intellectual Property</h2>
                        <p className="mb-4">
                            The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary rights.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. Termination</h2>
                        <p className="mb-4">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">8. Contact Information</h2>
                        <p className="mb-4">
                            If you have any questions about these Terms, please contact us at legal@myconnecta.ng.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfService;

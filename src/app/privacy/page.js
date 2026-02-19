export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-green">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-4">
                    We collect information you provide directly to us. For example, we collect information when you create an account, make a purchase, or communicate with us. The types of information we may collect include your name, email address, postal address, phone number, and payment information.
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">
                    We use the information we collect to provide, maintain, and improve our services, such as to process transactions, manage your account, and send you related information, including confirmations and receipts.
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">3. Security</h2>
                <p className="text-gray-600 mb-4">
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                </p>

                <p className="text-gray-500 italic mt-8 border-t border-gray-200 pt-4">
                    *This is a placeholder document. Please add your official privacy policy here.*
                </p>
            </div>
        </div>
    );
}

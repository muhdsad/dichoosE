export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-green">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

                <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                    Welcome to Dichoos! These terms and conditions outline the rules and regulations for the use of Dichoos's Website.
                    By accessing this website we assume you accept these terms and conditions. Do not continue to use Dichoos if you do not agree to take all of the terms and conditions stated on this page.
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">2. Cookies</h2>
                <p className="text-gray-600 mb-4">
                    We employ the use of cookies. By accessing Dichoos, you agreed to use cookies in agreement with the Dichoos's Privacy Policy.
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">3. License</h2>
                <p className="text-gray-600 mb-4">
                    Unless otherwise stated, Dichoos and/or its licensors own the intellectual property rights for all material on Dichoos. All intellectual property rights are reserved. You may access this from Dichoos for your own personal use subjected to restrictions set in these terms and conditions.
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">4. Hyperlinking to our Content</h2>
                <p className="text-gray-600 mb-4">
                    The following organizations may link to our Website without prior written approval: Government agencies; Search engines; News organizations.
                </p>

                <p className="text-gray-500 italic mt-8 border-t border-gray-200 pt-4">
                    *This is a placeholder document. Please add your official terms and conditions here.*
                </p>
            </div>
        </div>
    );
}

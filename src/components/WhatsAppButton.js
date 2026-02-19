import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    const phoneNumber = '918547246183'; // International format
    const message = 'Hello! I would like to know more about your products.';

    return (
        <Link
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center w-14 h-14"
            aria-label="Chat with us on WhatsApp"
        >
            <FaWhatsapp size={32} />
        </Link>
    );
};

export default WhatsAppButton;

import Image from 'next/image';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
    {
        id: 1,
        name: "Amina S.",
        location: "Kochi",
        text: "The vegetables are always fresh and organic. I love the weekly delivery service!",
        rating: 5,
        image: "https://randomuser.me/api/portraits/women/44.jpg" // Placeholder image
    },
    {
        id: 2,
        name: "Rahul M.",
        location: "Aluva",
        text: "Great quality fruits. My kids love the oranges and apples. Highly recommended!",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: 3,
        name: "Sarah J.",
        location: "Kakkanad",
        text: "Excellent customer service and prompt delivery. Dichoos is my go-to for groceries now.",
        rating: 4,
        image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
];

const Testimonials = () => {
    return (
        <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our happy customers have to say about our fresh produce and service.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 relative">
                            <FaQuoteLeft className="text-gray-100 text-5xl absolute top-4 left-4 -z-0" />
                            <div className="relative z-10">
                                <div className="flex items-center mb-4">
                                    <div className="relative w-12 h-12 mr-4">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} size={14} />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

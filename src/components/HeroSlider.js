"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
    {
        id: 1,
        image: '/final-banner.jpg', // Using same image for now, user can change later
        title: "Fresh & Organic",
        subtitle: "Farm fresh vegetables delivered to your doorstep",
        cta: "Shop Vegetables",
        link: "/products?category=Vegetables"
    },
    {
        id: 2,
        image: '/final-banner.jpg',
        title: "Juicy Fruits",
        subtitle: "start your day with healthy & sweet fruits",
        cta: "Shop Fruits",
        link: "/products?category=Fruits"
    },
    {
        id: 3,
        image: '/final-banner.jpg',
        title: "Weekly Exclusive Deals",
        subtitle: "Save big on your favorite items this week",
        cta: "View Offers",
        link: "/products?category=Offer"
    }
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden rounded-lg">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background Image */}
                    <div className="relative w-full h-full">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark Overlay for text readability */}
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 animate-fade-in-up">
                            {slide.title}
                        </h2>
                        <p className="text-sm md:text-xl mb-4 md:mb-6 max-w-2xl animate-fade-in-up delay-100">
                            {slide.subtitle}
                        </p>
                        <Link
                            href={slide.link}
                            className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition transform hover:scale-105 animate-fade-in-up delay-200"
                        >
                            {slide.cta}
                        </Link>
                    </div>
                </div>
            ))}

            {/* Dots Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-primary' : 'bg-white bg-opacity-50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;

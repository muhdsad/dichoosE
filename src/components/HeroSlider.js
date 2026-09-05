"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaLeaf } from 'react-icons/fa';

const slides = [
    {
        id: 1,
        image: '/bannar1.jpg',
        badge: "100% Farm Fresh",
        title: "Fresh & Organic Vegetables",
        subtitle: "Directly harvested from local organic farms. Picked daily and delivered to your doorstep within 2 hours.",
        cta: "Shop Vegetables",
        link: "/products?category=Vegetables"
    },
    {
        id: 2,
        image: '/bannar2.jpg',
        badge: "Vitamin C Boost",
        title: "Juicy & Delicious Fruits",
        subtitle: "Start your day with wholesome, sweet, and handpicked seasonal fruits bursting with natural flavors.",
        cta: "Explore Fruits",
        link: "/products?category=Fruits"
    },
    {
        id: 3,
        image: '/bannar3.jpg',
        badge: "Save Up To 40%",
        title: "Weekly Exclusive Deals",
        subtitle: "Unbeatable discounts on everyday household essentials, fresh dairy, rice, oils, and packaged foods.",
        cta: "View All Offers",
        link: "/products?category=Offer"
    }
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    return (
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] overflow-hidden rounded-3xl shadow-xl bg-slate-900 group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    {/* Background Image */}
                    <div className="relative w-full h-full">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            priority={index === 0}
                            unoptimized
                            className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent"></div>
                    </div>

                    {/* Content Glass Panel */}
                    <div className="absolute inset-0 flex items-center px-6 sm:px-12 md:px-16">
                        <div className="max-w-xl text-white space-y-3 sm:space-y-4">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                <FaLeaf className="text-emerald-400 text-xs" />
                                {slide.badge}
                            </span>
                            
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                                {slide.title}
                            </h1>

                            <p className="text-xs sm:text-base text-slate-200 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                                {slide.subtitle}
                            </p>

                            <div className="pt-2">
                                <Link
                                    href={slide.link}
                                    className="inline-flex items-center gap-2 gradient-emerald text-white text-xs sm:text-sm font-bold py-3 px-7 rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    <span>{slide.cta}</span>
                                    <FaArrowRight className="text-xs" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-600 transition-all duration-200"
                aria-label="Previous Slide"
            >
                <FaChevronLeft size={14} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-600 transition-all duration-200"
                aria-label="Next Slide"
            >
                <FaChevronRight size={14} />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;

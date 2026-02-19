"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { db } from "../lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import Testimonials from "../components/Testimonials";

import { categories } from "../utils/categories";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch latest 8 products for the homepage
        const q = query(collection(db, "products"), limit(8));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-light min-h-screen">
      {/* Hero Section - Slider */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <HeroSlider />
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-primary pl-4">
              Shop by Category
            </h2>
            <Link href="/products" className="text-primary font-medium hover:text-green-700 flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <Link
                href={`/products?category=${cat.name}`}
                key={index}
                className="group cursor-pointer"
              >
                <div className={`rounded-xl p-6 text-center shadow-sm hover:shadow-md transition duration-300 bg-white border border-gray-100 group-hover:border-primary`}>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <Image
                      src={cat.image} // This uses the path defined in your categories array
                      alt={cat.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-medium text-gray-800 group-hover:text-primary transition">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              <span className="text-primary">Fresh</span> Arrivals
            </h2>
            <div className="hidden md:flex space-x-2">
              <Link href="/products" className="px-4 py-1 bg-primary text-white rounded-full text-sm">All</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                  No products found. Add some from the Admin Panel!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              <span className="text-primary">Fresh</span> Arrivals
            </h2>
            <div className="hidden md:flex space-x-2">
              <Link href="/products" className="px-4 py-1 bg-primary text-white rounded-full text-sm">All</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                  No products found. Add some from the Admin Panel!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="z-10 text-white space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold">Get 20% Off on Your First Order</h2>
              <p className="text-green-100 max-w-2xl">Register now and get exclusive access to fresh deals and organic produce.</p>
              <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg mt-4">
                Register Now
              </button>
            </div>
            {/* Decorative Circle */}
            <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-green-600 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaTruck, FaLeaf, FaTags, FaShieldAlt, FaStar, FaFire } from "react-icons/fa";
import { db } from "../lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import Testimonials from "../components/Testimonials";

import { getCleanProduct } from "../utils/productUtils";
import { useCategories } from "../context/CategoryContext";

export default function Home() {
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(12));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return getCleanProduct({
            id: doc.id,
            ...data
          });
        });
        setProducts(productsData.filter(product => product.isPublished !== false));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = activeTab === "All"
    ? products
    : products.filter(p => {
        if (!p.categories && !p.category) return false;
        const cats = p.categories || [p.category];
        return cats.some(c => c.toLowerCase().includes(activeTab.toLowerCase()));
      });

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Hero Section - Slider */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <HeroSlider />
      </section>

      {/* Feature Highlights / Value Proposition Bar */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FaTruck className="text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">2-Hour Delivery</h4>
                <p className="text-[11px] text-slate-600">Fresh to your door</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FaLeaf className="text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Organic</h4>
                <p className="text-[11px] text-slate-600">Farm fresh quality</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FaTags className="text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Best Market Price</h4>
                <p className="text-[11px] text-slate-600">Daily wholesale deals</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Secure Payment</h4>
                <p className="text-[11px] text-slate-600">100% protected checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Curated Selection</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Shop by Category
              </h2>
            </div>
            <Link href="/products" className="group text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full transition">
              <span>View All Categories</span>
              <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {categories.map((cat, index) => (
              <Link
                href={`/products?category=${encodeURIComponent(cat.value || cat.name)}`}
                key={index}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-5 text-center border border-slate-200/80 shadow-soft hover:shadow-glow hover:border-emerald-500/40 transition-all duration-300 transform group-hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto mb-3 relative rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-emerald-500 transition-colors p-1 bg-slate-50">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Arrivals & Popular Products Section */}
      <section className="py-12 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-amber-500">
                <FaFire className="text-amber-500" /> Hot Arrivals
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Fresh Farm Produce & Grocery
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {["All", "Vegetables", "Fruits"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "gradient-emerald text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-semibold text-sm">No products available in this section right now.</p>
                  <Link href="/products" className="mt-3 inline-block text-xs font-bold text-emerald-600 hover:underline">
                    Explore all products &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl text-white">
            {/* Left Content */}
            <div className="z-10 space-y-4 text-center md:text-left max-w-xl">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                ⚡ First Order Offer
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Get 20% OFF On Your First Grocery Order
              </h2>
              <p className="text-emerald-100 text-xs md:text-sm font-normal leading-relaxed">
                Sign up today to unlock member-only farm fresh discounts, express 2-hour home delivery, and organic produce alerts.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 font-extrabold text-xs md:text-sm px-8 py-3.5 rounded-full shadow-lg hover:bg-slate-100 transition transform hover:scale-105 active:scale-95"
                >
                  <span>Register & Save Now</span>
                  <FaStar className="text-amber-500" />
                </Link>
              </div>
            </div>

            {/* Decorative Glass Circles */}
            <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/2 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <Testimonials />
    </div>
  );
}

import "./globals.css";
import { AuthContextProvider } from "../context/AuthContext";
import { CategoryProvider } from "../context/CategoryContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export const metadata = {
  title: "dichoos — Farm Fresh Organic Grocery & Daily Essentials",
  description: "Order 100% organic farm fresh vegetables, fruits, dairy products, and daily groceries delivered to your doorstep within 2 hours.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen antialiased bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        <AuthContextProvider>
          <CategoryProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="print:hidden">
                  <Navbar />
                </div>
                <main className="flex-grow">
                  {children}
                </main>
                <div className="print:hidden">
                  <WhatsAppButton />
                  <Footer />
                </div>
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}

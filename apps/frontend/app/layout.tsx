import "./globals.css";
import NavFooterWrapper from "./NavFooterWrapper";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AI E-Commerce",
  description: "Enterprise-level AI-powered E-Commerce platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ShopProvider>
                <NavFooterWrapper>
                  <main className="flex-1 container mx-auto px-4 py-6">
                    {children}
                  </main>
                </NavFooterWrapper>

                {/* Global Toast Notification */}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      borderRadius: "12px",
                      background:
                        "linear-gradient(90deg, #ff4d4d, #ff9966, #ff66b2)",
                      color: "#fff",
                      padding: "12px 18px",
                      fontWeight: "600",
                      boxShadow: "0 4px 20px rgba(255, 100, 80, 0.3)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                    },
                    success: {
                      icon: "✅",
                      duration: 2500,
                    },
                    error: {
                      icon: "❌",
                      duration: 2500,
                    },
                  }}
                />
              </ShopProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

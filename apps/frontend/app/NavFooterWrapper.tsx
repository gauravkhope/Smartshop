"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";

export default function NavFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Essential: hide nav/footer on auth pages your project actually uses
  const hideNavFooter =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/step-register" ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  return (
    <>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </>
  );
}

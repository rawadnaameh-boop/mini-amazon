import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CartProvider } from "@/context/CartContext";
import NavbarHeader from "@/components/NavbarHeader";
import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppRouterCacheProvider>
          {/* Wrapping application within the Cart engine context */}
          <CartProvider>
            <NavbarHeader />
            <main style={{ padding: "20px" }}>
              {children}
            </main>
            <CartDrawer />
          </CartProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
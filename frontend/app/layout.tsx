import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import NavbarHeader from "@/components/NavbarHeader";
import CartDrawer from "@/components/CartDrawer";
import ThemeRegistry from "@/components/ThemeRegistry";

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
        <ThemeRegistry>
          <CartProvider>
            <NavbarHeader />
            <main style={{ padding: "20px" }}>
              {children}
            </main>
            <CartDrawer />
          </CartProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

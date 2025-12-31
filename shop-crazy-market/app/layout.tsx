import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChristmasDecorations from "@/components/ChristmasDecorations";
import NewYearDecorations from "@/components/NewYearDecorations";
import WinterDecorations from "@/components/WinterDecorations";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MobileMetaTags from "@/components/MobileMetaTags";

export const metadata = {
  title: "Shop Crazy Market",
  description: "Where the deals get crazy - Your one-stop shop for unique items, digital products, and more",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shop Crazy Market",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Shop Crazy Market",
    title: "Shop Crazy Market",
    description: "Where the deals get crazy",
  },
  twitter: {
    card: "summary",
    title: "Shop Crazy Market",
    description: "Where the deals get crazy",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        <MobileMetaTags />
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ChristmasDecorations />
                <NewYearDecorations />
                <WinterDecorations />
                <Navbar />
                <div className="pb-20 md:pb-0 min-h-screen flex flex-col">{children}</div>
                <Footer />
                <BottomNav />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

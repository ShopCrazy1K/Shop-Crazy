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
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
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

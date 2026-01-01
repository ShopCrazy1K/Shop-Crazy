import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Decorations disabled for better mobile performance
// import ChristmasDecorations from "@/components/ChristmasDecorations";
// import NewYearDecorations from "@/components/NewYearDecorations";
// import WinterDecorations from "@/components/WinterDecorations";
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
    images: [
      {
        url: "/favicon-96x96.png",
        width: 96,
        height: 96,
        alt: "Shop Crazy Market Logo",
      },
      {
        url: "/android-chrome-192x192.png",
        width: 192,
        height: 192,
        alt: "Shop Crazy Market Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Shop Crazy Market",
    description: "Where the deals get crazy",
    images: ["/favicon-96x96.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Safari favicon - MUST be first, use absolute path */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        {/* Standard favicons for other browsers */}
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        {/* Apple touch icons for Safari iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        {/* iOS Splash Screens - Apple Touch Startup Images */}
        <link rel="apple-touch-startup-image" href="/splash/iphone-6-7-8.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-6-7-8-plus.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-x-xs.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-xr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-xs-max.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-12-13.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-12-13-pro-max.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad-pro.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        {/* Manifest - includes Android splash screens */}
        <link rel="manifest" href="/manifest.json" />
        {/* Google Search Console verification - add your verification code if you have one */}
      </head>
      <body>
        <MobileMetaTags />
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                {/* Decorations disabled for better mobile performance */}
                {/* <ChristmasDecorations /> */}
                {/* <NewYearDecorations /> */}
                {/* <WinterDecorations /> */}
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

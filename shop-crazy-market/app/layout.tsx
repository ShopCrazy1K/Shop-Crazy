import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import BottomNav from "@/components/BottomNav";
import ChristmasDecorations from "@/components/ChristmasDecorations";
import NewYearDecorations from "@/components/NewYearDecorations";
import WinterDecorations from "@/components/WinterDecorations";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata = {
  title: "Shop Crazy Market",
  description: "Where the deals get crazy",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ChristmasDecorations />
                <NewYearDecorations />
                <WinterDecorations />
                <div className="pb-20">{children}</div>
                <BottomNav />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}


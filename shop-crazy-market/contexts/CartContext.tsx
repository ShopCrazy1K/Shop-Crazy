"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: string; // listingId
  title: string;
  price: number; // price in cents
  quantity: number;
  image?: string;
  listingId: string; // Keep for clarity
  sellerId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load cart from localStorage - only in browser
    // Wrap everything in try-catch to prevent any errors from crashing the app
    try {
      if (typeof window !== 'undefined') {
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              // Validate cart items structure more thoroughly
              if (Array.isArray(parsedCart)) {
                const validItems = parsedCart.filter((item: any) => {
                  try {
                    return (
                      item &&
                      typeof item === 'object' &&
                      item.id &&
                      typeof item.id === 'string' &&
                      item.title &&
                      typeof item.title === 'string' &&
                      typeof item.price === 'number' &&
                      !isNaN(item.price) &&
                      item.price > 0 &&
                      typeof item.quantity === 'number' &&
                      !isNaN(item.quantity) &&
                      item.quantity > 0
                    );
                  } catch {
                    return false;
                  }
                });
                setItems(validItems);
              } else {
                // Invalid format, clear it
                try {
                  localStorage.removeItem("cart");
                } catch (e) {
                  // Ignore errors when clearing
                }
                setItems([]);
              }
            } catch (error) {
              console.error("Error parsing cart:", error);
              // Clear corrupted cart data
              try {
                localStorage.removeItem("cart");
              } catch (e) {
                // Ignore errors when clearing
              }
              setItems([]);
            }
          } else {
            setItems([]);
          }
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          setItems([]);
          setHasError(true);
        } finally {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    } catch (error) {
      // Catch any unexpected errors during initialization
      console.error("Unexpected error in CartProvider initialization:", error);
      setItems([]);
      setHasError(true);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes - only in browser and after initialization
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        // Validate items before saving
        const validItems = items.filter(item => 
          item &&
          item.id &&
          item.title &&
          typeof item.price === 'number' &&
          !isNaN(item.price) &&
          item.price > 0 &&
          typeof item.quantity === 'number' &&
          !isNaN(item.quantity) &&
          item.quantity > 0
        );
        
        if (validItems.length !== items.length) {
          // Some items were invalid, update state with only valid items
          setItems(validItems);
        }
        
        localStorage.setItem("cart", JSON.stringify(validItems));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
        // If storage is full or unavailable, try to clear old data
        try {
          if (error instanceof DOMException && error.code === 22) {
            // QuotaExceededError - storage is full
            console.warn("LocalStorage quota exceeded, clearing old cart data");
            localStorage.removeItem("cart");
          }
        } catch (e) {
          // Ignore errors when clearing
        }
      }
    }
  }, [items, isInitialized]);

  const addItem = (item: CartItem) => {
    // Validate item before adding
    if (!item || !item.id || !item.title || typeof item.price !== 'number' || item.price <= 0) {
      console.error("Invalid cart item:", item);
      return;
    }
    
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity + (item.quantity || 1)) } : i
        );
      }
      return [...prev, { ...item, quantity: Math.max(1, item.quantity || 1) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId || typeof quantity !== 'number' || isNaN(quantity)) {
      console.error("Invalid quantity update:", { productId, quantity });
      return;
    }
    
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    try {
      return items.reduce((sum, item) => {
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          return sum;
        }
        return sum + (item.price * item.quantity);
      }, 0);
    } catch (error) {
      console.error("Error calculating cart total:", error);
      return 0;
    }
  };

  const getItemCount = () => {
    try {
      return items.reduce((sum, item) => {
        if (!item || typeof item.quantity !== 'number') {
          return sum;
        }
        return sum + item.quantity;
      }, 0);
    } catch (error) {
      console.error("Error calculating item count:", error);
      return 0;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: items || [],
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


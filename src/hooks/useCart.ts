import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  capacity?: string;
}

const CART_STORAGE_KEY = 'iplace-cart';
const CART_EVENT_NAME = 'iplace-cart-updated';

const safeParseCart = (raw: string | null): CartItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  return safeParseCart(localStorage.getItem(CART_STORAGE_KEY));
};

const writeCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT_NAME));
};

export const useCart = (): {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
} => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCartFromStorage());

  // Mantém múltiplas instâncias do hook sincronizadas (Header, Produto, Carrinho, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sync = () => setCartItems(readCartFromStorage());

    window.addEventListener('storage', sync);
    window.addEventListener(CART_EVENT_NAME, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CART_EVENT_NAME, sync);
    };
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const current = readCartFromStorage();
    const existing = current.find((i) => i.id === item.id && i.color === item.color && i.capacity === item.capacity);

    const next = existing
      ? current.map((i) => (i.id === item.id && i.color === item.color && i.capacity === item.capacity ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...item, quantity }];

    writeCartToStorage(next);
    setCartItems(next);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    const next = readCartFromStorage().filter((item) => item.id !== id);
    writeCartToStorage(next);
    setCartItems(next);
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) {
      const next = readCartFromStorage().filter((item) => item.id !== id);
      writeCartToStorage(next);
      setCartItems(next);
      return;
    }

    const next = readCartFromStorage().map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    writeCartToStorage(next);
    setCartItems(next);
  }, []);

  const clearCart = useCallback(() => {
    writeCartToStorage([]);
    setCartItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };
};


import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('infinity_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('infinity_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, quantity = 1) => {
        const productId = String(product._id || product.id);
        if (!productId || productId === 'undefined') return;
        let updated = false;

        setCart((prev) => {
            const existing = prev.find((i) => String(i._id || i.id) === productId);
            if (existing) {
                updated = true;
                return prev.map((i) => String(i._id || i.id) === productId ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prev, { ...product, quantity }];
        });

        if (updated) {
            toast.success('Cart updated! 🛒');
        } else {
            toast.success('Added to cart! 🛒');
        }
    }, []);

    const removeFromCart = useCallback((idOrName) => {
        if (!idOrName) return;
        const search = String(idOrName).toLowerCase().trim();
        setCart((prev) => prev.filter((i) => {
            const itemId = String(i._id || i.id || i.productId || '').toLowerCase().trim();
            const itemName = (i.name || '').toLowerCase().trim();
            return itemId !== search && itemName !== search;
        }));
        toast.success('Removed from cart');
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        if (quantity < 1 || !id) return;
        const idStr = String(id);
        setCart((prev) => prev.map((i) => {
            const itemId = String(i._id || i.id || i.productId || '');
            return itemId === idStr || i.name === idStr ? { ...i, quantity } : i;
        }));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const cartTotal = useMemo(() =>
        cart.reduce((sum, i) => sum + (i.discountPrice > 0 ? i.discountPrice : i.price) * i.quantity, 0),
        [cart]);

    const cartCount = useMemo(() =>
        cart.reduce((sum, i) => sum + i.quantity, 0),
        [cart]);

    const value = useMemo(() => ({
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
    }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

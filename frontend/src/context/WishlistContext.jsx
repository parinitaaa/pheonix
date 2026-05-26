import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getWishlist, toggleWishlist as apiToggle } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    const fetchWishlist = useCallback(async () => {
        try {
            const { data } = await getWishlist();
            setWishlist(data.products.map((p) => p._id || p));
        } catch { }
    }, []);

    useEffect(() => {
        if (user) fetchWishlist();
        else setWishlist([]);
    }, [user, fetchWishlist]);

    const toggleWishlist = useCallback(async (product) => {
        if (!user) { toast.error('Please login to add to wishlist'); return; }
        const isInWishlist = wishlist.includes(product._id);
        setWishlist((prev) => isInWishlist ? prev.filter((id) => id !== product._id) : [...prev, product._id]);
        try {
            const { data } = await apiToggle(product._id);
            toast.success(data.message);
        } catch { fetchWishlist(); }
    }, [user, wishlist, fetchWishlist]);

    const isInWishlist = useCallback((id) => wishlist.includes(id), [wishlist]);

    const value = useMemo(() => ({
        wishlist,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
    }), [wishlist, toggleWishlist, isInWishlist, fetchWishlist]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);

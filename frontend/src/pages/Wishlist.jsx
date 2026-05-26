import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWishlist, toggleWishlist as apiToggle } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try { const { data } = await getWishlist(); setProducts(data.products); }
        catch { } finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchWishlist(); else setLoading(false); }, [user]);

    const handleRemove = async (productId) => {
        await toggleWishlist({ _id: productId });
        setProducts(p => p.filter(pr => pr._id !== productId));
    };

    if (!user) return (
        <div className="min-h-screen pt-40 flex items-center justify-center text-center px-4">
            <div className="glass rounded-2xl p-12"><Heart size={48} className="text-pink-400 mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">Login to see your wishlist</h2><Link to="/login"><button className="btn-primary mt-4 px-6 py-2.5">Login</button></Link></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <h1 className="font-orbitron text-3xl font-bold text-white mb-8">Wishlist <span className="text-slate-400 text-xl font-normal">({products.length})</span></h1>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="glass rounded-2xl h-64 shimmer" />)}</div>
                ) : products.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center"><Heart size={48} className="text-slate-600 mx-auto mb-4" /><h3 className="text-white text-xl font-bold mb-2">Your wishlist is empty</h3><p className="text-slate-400 mb-6">Save items you love for later</p><Link to="/products"><button className="btn-primary px-8 py-3">Explore Products</button></Link></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {products.map((p, i) => (
                            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="glass hover-lift rounded-2xl overflow-hidden flex flex-col">
                                <Link to={`/products/${p._id}`} className="relative h-44 overflow-hidden block">
                                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </Link>
                                <div className="p-4 flex flex-col flex-1">
                                    <Link to={`/products/${p._id}`} className="text-white font-semibold text-sm hover:text-purple-300 mb-1 line-clamp-2">{p.name}</Link>
                                    <p className="text-gradient font-bold text-lg mb-3">₹{(p.discountPrice > 0 ? p.discountPrice : p.price)?.toLocaleString('en-IN')}</p>
                                    <div className="flex gap-2 mt-auto">
                                        <button onClick={() => addToCart(p)} className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1"><ShoppingCart size={13} />Add to Cart</button>
                                        <button onClick={() => handleRemove(p._id)} className="w-9 h-9 rounded-xl glass border border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, ArrowLeft, ChevronRight, Truck, Shield, RefreshCw } from 'lucide-react';
import { getProduct, addReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    useEffect(() => {
        const fetch = async () => {
            try { const { data } = await getProduct(id); setProduct(data.product); }
            catch { toast.error('Product not found'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login to review'); return; }
        setSubmitting(true);
        try {
            await addReview(id, { rating: reviewRating, comment: reviewComment });
            toast.success('Review submitted!');
            setReviewComment('');
            const { data } = await getProduct(id);
            setProduct(data.product);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Product not found</div>;

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const fmt = (p) => `₹${p?.toLocaleString('en-IN')}`;

    return (
        <div className="min-h-screen pb-16">
            <div className="h-24 md:h-32" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link to="/" className="hover:text-white">Home</Link><ChevronRight size={14} />
                    <Link to="/products" className="hover:text-white">Products</Link><ChevronRight size={14} />
                    <span className="text-slate-300 line-clamp-1">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Images */}
                    <div>
                        <div className="glass rounded-2xl overflow-hidden h-96 mb-4">
                            <motion.img
                                key={activeImg}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={product.images?.[activeImg] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'}
                                alt={product.name}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'; }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2">
                                {product.images.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-purple-500' : 'border-white/10'}`}>
                                        <img
                                            src={img}
                                            alt=""
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=100'; }}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.isFeatured && <span className="badge badge-purple">Featured</span>}
                            {product.isTrending && <span className="badge badge-cyan">🔥 Trending</span>}
                            {product.isFlashSale && <span className="badge badge-red">⚡ Flash Sale</span>}
                            <span className="badge badge-gold">{product.category}</span>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                        {product.brand && <p className="text-slate-400 mb-4">by <span className="text-purple-400 font-medium">{product.brand}</span></p>}

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'star-filled fill-amber-400' : 'star-empty'} />)}
                            </div>
                            <span className="text-slate-400 text-sm">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-bold font-orbitron text-gradient">{fmt(price)}</span>
                            {product.discountPrice > 0 && <>
                                <span className="text-xl text-slate-500 line-through">{fmt(product.price)}</span>
                                <span className="badge badge-green">{product.discountPercent}% OFF</span>
                            </>}
                        </div>

                        <p className="text-slate-400 leading-relaxed mb-6">{product.description}</p>

                        {/* Quantity */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-slate-300 text-sm">Quantity:</span>
                            <div className="flex items-center glass rounded-xl overflow-hidden border border-white/10">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 text-white hover:bg-white/10 transition-colors text-lg">−</button>
                                <span className="w-12 text-center text-white font-semibold">{qty}</span>
                                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 text-white hover:bg-white/10 transition-colors text-lg">+</button>
                            </div>
                            <span className="text-slate-500 text-sm">{product.stock} in stock</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mb-8">
                            <button onClick={() => addToCart(product, qty)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3" disabled={product.stock === 0}>
                                <ShoppingCart size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button onClick={() => toggleWishlist(product)} className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${isInWishlist(product._id) ? 'border-pink-500 bg-pink-500/10' : 'glass border-white/10 hover:border-pink-500'}`}>
                                <Heart size={18} className={isInWishlist(product._id) ? 'text-pink-400 fill-pink-400' : 'text-white'} />
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[[Truck, 'Free Delivery', 'On orders over ₹999'], [Shield, 'Secure Payment', 'SSL encrypted'], [RefreshCw, 'Easy Returns', '30-day policy']].map(([Icon, title, sub]) => (
                                <div key={title} className="glass rounded-xl p-3 flex flex-col items-center text-center border border-white/10">
                                    <Icon size={20} className="text-purple-400 mb-2" />
                                    <p className="text-white text-xs font-semibold">{title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Specs */}
                {product.specifications?.length > 0 && (
                    <div className="glass rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {product.specifications.map((s, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <span className="text-slate-400 text-sm w-32 shrink-0">{s.key}</span>
                                    <span className="text-white text-sm font-medium">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Customer Reviews ({product.reviews?.length || 0})</h2>
                    {product.reviews?.length > 0 ? (
                        <div className="flex flex-col gap-4 mb-8">
                            {product.reviews.slice(0, 5).map((r, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">{r.name?.[0]}</div>
                                        <div>
                                            <p className="text-white text-sm font-semibold">{r.name}</p>
                                            <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'star-filled fill-amber-400' : 'star-empty'} />)}</div>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 mb-6">No reviews yet. Be the first!</p>}

                    {user && (
                        <form onSubmit={submitReview} className="border-t border-white/10 pt-6">
                            <h3 className="text-white font-semibold mb-4">Write a Review</h3>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} type="button" onClick={() => setReviewRating(s)}>
                                        <Star size={24} className={s <= reviewRating ? 'star-filled fill-amber-400 transition-transform hover:scale-110' : 'star-empty transition-transform hover:scale-110'} />
                                    </button>
                                ))}
                            </div>
                            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} required placeholder="Share your experience..." className="input-glass resize-none mb-4" />
                            <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm">{submitting ? 'Submitting...' : 'Submit Review'}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

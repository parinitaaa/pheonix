import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product, index = 0 }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const inWishlist = isInWishlist(product._id);

    const formatPrice = (p) => `₹${p?.toLocaleString('en-IN')}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="glass hover-lift rounded-2xl overflow-hidden group flex flex-col"
        >
            {/* Image */}
            <Link to={`/products/${product._id}`} className="relative overflow-hidden h-52 block">
                <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.isFlashSale && <span className="badge badge-red"><Zap size={10} /> Flash Sale</span>}
                    {product.isTrending && <span className="badge badge-purple">🔥 Trending</span>}
                    {product.isDailyDeal && <span className="badge badge-gold">⚡ Deal</span>}
                    {product.discountPercent > 0 && <span className="badge badge-green">{product.discountPercent}% OFF</span>}
                </div>

                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-all hover:bg-black/60"
                >
                    <Heart size={15} className={`transition-colors ${inWishlist ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
                </button>
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <Link to={`/products/${product._id}`} className="text-sm font-semibold text-white hover:text-purple-300 transition-colors line-clamp-2 flex-1">
                        {product.name}
                    </Link>
                </div>

                <p className="text-xs text-slate-500 mb-2">{product.brand || product.category}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} className={s <= Math.round(product.rating || 0) ? 'star-filled fill-amber-400' : 'star-empty'} />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">({product.numReviews || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-gradient">{formatPrice(price)}</span>
                    {product.discountPrice > 0 && (
                        <span className="text-xs text-slate-500 line-through">{formatPrice(product.price)}</span>
                    )}
                </div>

                {/* Flash sale timer */}
                {product.isFlashSale && product.flashSaleEnds && (
                    <div className="flex items-center gap-1 text-xs text-amber-400 mb-3">
                        <Clock size={11} />
                        <span>Ends in {Math.max(0, Math.floor((new Date(product.flashSaleEnds) - Date.now()) / 3600000))}h</span>
                    </div>
                )}

                {/* Add to cart */}
                <button
                    onClick={() => addToCart(product)}
                    className="mt-auto w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                    disabled={product.stock === 0}
                >
                    <ShoppingCart size={15} />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </motion.div>
    );
}

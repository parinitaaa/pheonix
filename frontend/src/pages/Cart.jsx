import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validateCoupon } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [validating, setValidating] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!user) { toast.error('Please login to apply coupon'); return; }
        setValidating(true);
        try {
            const { data } = await validateCoupon({ code: couponCode, orderAmount: cartTotal });
            setCoupon(data.coupon);
            toast.success(`Coupon applied! You save ₹${data.coupon.discount.toLocaleString('en-IN')}`);
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); setCoupon(null); }
        finally { setValidating(false); }
    };

    const shipping = cartTotal > 999 ? 0 : 99;
    const tax = Math.round(cartTotal * 0.05);
    const discount = coupon?.discount || 0;
    const total = cartTotal + shipping + tax - discount;

    if (cart.length === 0) return (
        <div className="min-h-screen pt-40 flex flex-col items-center justify-center text-center px-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-12">
                <ShoppingBag size={64} className="text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                <p className="text-slate-400 mb-6">Add some amazing products to get started</p>
                <Link to="/products" className="btn-primary px-8 py-3 inline-block">Shop Now</Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Header Spacer */}
            <div className="h-24 md:h-32" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <h1 className="font-orbitron text-4xl font-bold text-white mb-12 mt-8">Shopping Cart <span className="text-slate-400 text-xl font-normal">({cartCount} items)</span></h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Items */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <AnimatePresence>
                            {cart.map((item) => {
                                const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                                const itemId = item._id || item.id || item.productId;
                                return (
                                    <motion.div
                                        key={itemId || item.name}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass rounded-3xl p-8 flex flex-col gap-6"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-8">
                                            <Link to={`/products/${itemId}`} className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden shrink-0">
                                                <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                            </Link>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <Link to={`/products/${itemId}`} className="text-white text-2xl font-bold hover:text-purple-300 transition-colors line-clamp-2">{item.name}</Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(itemId || item.name)}
                                                            className="p-3 rounded-2xl hover:bg-red-500/20 text-red-500 transition-all z-30 relative scale-110"
                                                            title="Remove from cart"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-400 font-medium mb-4">{item.brand || item.category}</p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 glass px-2 py-1.5 rounded-xl border border-white/10">
                                                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)} className="w-8 h-8 text-slate-400 hover:text-white transition-colors"><Minus size={14} /></button>
                                                        <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)} className="w-8 h-8 text-slate-400 hover:text-white transition-colors"><Plus size={14} /></button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price</p>
                                                        <span className="text-white text-2xl font-black">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="glass rounded-2xl p-6 h-fit sticky top-32">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-lg">Order Summary</h2>
                            <button
                                onClick={() => { if (window.confirm('Clear all items?')) clearCart(); }}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 mb-5">
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Shipping</span><span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Tax (5%)</span><span className="text-white">₹{tax.toLocaleString('en-IN')}</span></div>
                            {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-400">Discount</span><span className="text-green-400">−₹{discount.toLocaleString('en-IN')}</span></div>}
                            <div className="border-t border-white/10 pt-3 flex justify-between font-bold"><span className="text-white">Total</span><span className="text-gradient text-xl">₹{total.toLocaleString('en-IN')}</span></div>
                        </div>

                        {/* Coupon */}
                        <div className="flex gap-2 mb-5">
                            <div className="relative flex-1">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="input-glass text-sm pl-9 py-2.5" />
                            </div>
                            <button onClick={handleApplyCoupon} disabled={validating} className="btn-secondary text-sm px-4 py-2.5 shrink-0">Apply</button>
                        </div>
                        {coupon && <p className="text-green-400 text-xs mb-4">✓ Coupon "{coupon.code}" applied</p>}

                        <button
                            onClick={() => user ? navigate('/checkout', { state: { coupon } }) : navigate('/login')}
                            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
                        >
                            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ArrowRight size={18} />
                        </button>

                        <p className="text-center text-xs text-slate-500 mt-3">🔒 SSL encrypted & secure checkout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Package, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Review', 'Confirm'];

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const coupon = location.state?.coupon;
    const couponCode = coupon?.code;
    const [step, setStep] = useState(0);
    const [placing, setPlacing] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [address, setAddress] = useState(user?.addresses?.[0] || {
        fullName: user?.name || '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
    });
    const [payment, setPayment] = useState('Card');

    const shipping = cartTotal > 999 ? 0 : 99;
    const tax = Math.round(cartTotal * 0.05);
    const discount = coupon?.discount || 0;
    const total = cartTotal + shipping + tax - discount;

    const placeOrder = async () => {
        setPlacing(true);
        try {
            const items = cart.map(i => ({ product: i._id, quantity: i.quantity }));
            const { data } = await createOrder({ items, shippingAddress: address, paymentMethod: payment, couponCode });
            setOrderId(data.order._id);
            clearCart();
            setStep(3);
        } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
        finally { setPlacing(false); }
    };

    const stepIcons = [MapPin, CreditCard, Package, CheckCircle];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h1 className="font-orbitron text-3xl font-bold text-white mb-8">Checkout</h1>

                {/* Progress */}
                <div className="flex items-center justify-between mb-10">
                    {STEPS.map((s, i) => {
                        const Icon = stepIcons[i];
                        return (
                            <div key={s} className="flex items-center">
                                <div className={`flex items-center gap-2 ${i < step ? 'text-green-400' : i === step ? 'text-purple-400' : 'text-slate-600'}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${i < step ? 'border-green-500 bg-green-500/20' : i === step ? 'border-purple-500 bg-purple-500/20 pulse-glow' : 'border-slate-700 bg-transparent'}`}>
                                        {i < step ? <CheckCircle size={16} /> : <Icon size={16} />}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium">{s}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`h-px w-8 sm:w-16 mx-2 transition-colors ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 0: Address */}
                    {step === 0 && (
                        <motion.div key="addr" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><MapPin size={20} className="text-purple-400" /> Shipping Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[['fullName', 'Full Name', 'text'], ['phone', 'Phone Number', 'tel'], ['addressLine1', 'Address Line 1', 'text'], ['addressLine2', 'Address Line 2 (optional)', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'], ['pincode', 'Pincode', 'text']].map(([field, label, type]) => (
                                    <div key={field} className={field === 'addressLine1' || field === 'addressLine2' ? 'sm:col-span-2' : ''}>
                                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                                        <input type={type} value={address[field] || ''} onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))} className="input-glass" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <button onClick={() => {
                                    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) { toast.error('Please fill all required fields'); return; }
                                    setStep(1);
                                }} className="btn-primary flex items-center gap-2">Next <ArrowRight size={16} /></button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Payment */}
                    {step === 1 && (
                        <motion.div key="pay" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><CreditCard size={20} className="text-purple-400" /> Payment Method</h2>
                            <div className="flex flex-col gap-3">
                                {['Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map(method => (
                                    <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${payment === method ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'}`}>
                                        <input type="radio" name="payment" value={method} checked={payment === method} onChange={() => setPayment(method)} className="accent-purple-500" />
                                        <span className="text-white font-medium">{method}</span>
                                        {method === 'Card' && <span className="ml-auto text-2xl">💳</span>}
                                        {method === 'UPI' && <span className="ml-auto text-2xl">📱</span>}
                                        {method === 'Net Banking' && <span className="ml-auto text-2xl">🏦</span>}
                                        {method === 'Cash on Delivery' && <span className="ml-auto text-2xl">💵</span>}
                                    </label>
                                ))}
                            </div>
                            <p className="text-slate-500 text-xs mt-4 text-center">⚠️ This is a demo app. No real payment is processed.</p>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                                <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">Review Order <ArrowRight size={16} /></button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><Package size={20} className="text-purple-400" /> Review Order</h2>
                            <div className="flex flex-col gap-3 mb-5">
                                {cart.map(item => (
                                    <div key={item._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                        <img src={item.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium line-clamp-1">{item.name}</p><p className="text-slate-400 text-xs">Qty: {item.quantity}</p></div>
                                        <p className="text-white font-semibold text-sm">₹{((item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mb-6">
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Shipping</span><span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Tax (5%)</span><span className="text-white">₹{tax}</span></div>
                                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-400">Discount ({couponCode})</span><span className="text-green-400">−₹{discount.toLocaleString('en-IN')}</span></div>}
                                <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2"><span className="text-white">Total</span><span className="text-gradient">₹{total.toLocaleString('en-IN')}</span></div>
                            </div>
                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                                <button onClick={placeOrder} disabled={placing} className="btn-primary flex items-center gap-2 px-6">
                                    {placing ? 'Placing...' : 'Place Order'} {!placing && <CheckCircle size={16} />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-12 text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-400" />
                            </motion.div>
                            <h2 className="font-orbitron text-3xl font-bold text-white mb-3">Order Placed! 🎉</h2>
                            <p className="text-slate-400 mb-6">Your order has been confirmed and is being processed.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to={`/orders/${orderId}`}><button className="btn-primary px-6 py-3">Track Order</button></Link>
                                <Link to="/products"><button className="btn-secondary px-6 py-3">Continue Shopping</button></Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

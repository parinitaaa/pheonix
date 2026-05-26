import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, RotateCcw, ChevronRight, RefreshCw } from 'lucide-react';
import { getMyOrders, cancelOrder, requestRefund } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    Processing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    Confirmed: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    Shipped: { icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    'Out for Delivery': { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    Delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    Cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    Refunded: { icon: RotateCcw, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try { const { data } = await getMyOrders(); setOrders(data.orders); }
            catch { } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleCancel = async (orderId) => {
        try {
            await cancelOrder(orderId, { reason: 'User requested' });
            toast.success('Order cancelled');
            const { data } = await getMyOrders();
            setOrders(data.orders);
        } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
    };

    const handleRefund = async (orderId) => {
        try {
            await requestRefund(orderId, { reason: 'Item not as described', description: 'Requesting refund' });
            toast.success('Refund request submitted');
        } catch (err) { toast.error(err.response?.data?.message || 'Refund failed'); }
    };

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <h1 className="font-orbitron text-3xl font-bold text-white mb-8">My Orders</h1>

                {loading ? (
                    <div className="flex flex-col gap-4">{[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-24 shimmer" />)}</div>
                ) : orders.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Package size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white text-xl font-bold mb-2">No orders yet</h3>
                        <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                        <Link to="/products"><button className="btn-primary px-8 py-3">Shop Now</button></Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map((order, i) => {
                            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Processing;
                            const Icon = cfg.icon;
                            const isExpanded = expanded === order._id;
                            return (
                                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="glass rounded-2xl overflow-hidden">
                                    <div className="p-5 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : order._id)}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cfg.bg}`}>
                                                <Icon size={18} className={cfg.color} />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold"># {order._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-white font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                                                <p className={`text-xs font-medium ${cfg.color}`}>{order.orderStatus}</p>
                                            </div>
                                            <ChevronRight size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/10 p-5">
                                            <div className="flex flex-col gap-3 mb-4">
                                                {order.items.map((item, j) => (
                                                    <div key={j} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                        <div className="flex-1"><p className="text-white text-sm">{item.name}</p><p className="text-slate-400 text-xs">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p></div>
                                                        <p className="text-white font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-sm border-t border-white/10 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} className="text-slate-400" />
                                                    <span className="text-slate-400">Tracking: <span className="text-white font-mono">{order.trackingNumber}</span></span>
                                                </div>
                                                <div className="flex gap-2">
                            {['Processing', 'Confirmed'].includes(order.orderStatus) && (
                                <button onClick={(e) => { e.stopPropagation(); handleCancel(order._id); }} className="btn-secondary text-xs py-1.5 px-3 border-red-500/50 text-red-400 hover:bg-red-500/10">Cancel</button>
                            )}
                                                    {order.orderStatus === 'Delivered' && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleRefund(order._id); }} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><RefreshCw size={12} /> Request Refund</button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

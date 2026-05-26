import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingCart, Package, Users, Gavel,
    RefreshCw, TrendingUp, DollarSign, Plus, Edit, Trash2,
    Check, X, Search, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react';
import {
    getAdminStats, getAdminProducts, getAdminOrders,
    getAdminUsers, getAdminRefunds, updateOrderStatus,
    processRefund, deleteProduct, createProduct, updateProduct
} from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Product Edit Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: 0, category: 'Electronics', stock: 10, image: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'stats') {
                const { data } = await getAdminStats(); setStats(data);
            } else if (activeTab === 'products') {
                const { data } = await getAdminProducts(); setProducts(data.products);
            } else if (activeTab === 'orders') {
                const { data } = await getAdminOrders(); setOrders(data.orders);
            } else if (activeTab === 'users') {
                const { data } = await getAdminUsers(); setUsers(data.users);
            } else if (activeTab === 'refunds') {
                const { data } = await getAdminRefunds(); setRefunds(data.refunds);
            }
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, { status });
            toast.success(`Order ${status}`);
            fetchData();
        } catch (err) { toast.error('Update failed'); }
    };

    const handleProcessRefund = async (refundId, status) => {
        try {
            await processRefund(refundId, { status });
            toast.success(`Refund ${status}`);
            fetchData();
        } catch (err) { toast.error('Processing failed'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            fetchData();
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, productForm);
                toast.success('Product updated');
            } else {
                await createProduct(productForm);
                toast.success('Product created');
            }
            setShowProductModal(false);
            setEditingProduct(null);
            fetchData();
        } catch (err) { toast.error('Save failed'); }
    };

    const menuItems = [
        { id: 'stats', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'refunds', label: 'Refunds', icon: RefreshCw },
    ];

    return (
        <div className="min-h-screen pt-20 bg-[#060912]">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">

                {/* Sidebar */}
                <aside className="w-full lg:w-64 glass-card border-r border-white/5 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap min-w-max lg:min-w-0 ${activeTab === item.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-bold text-white uppercase tracking-tight font-orbitron">
                                    Admin / <span className="text-purple-400">{activeTab}</span>
                                </h1>

                                {activeTab === 'products' && (
                                    <button
                                        onClick={() => {
                                            setEditingProduct(null);
                                            setProductForm({ name: '', description: '', price: 0, category: 'Electronics', stock: 10, image: '' });
                                            setShowProductModal(true);
                                        }}
                                        className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                                    >
                                        <Plus size={16} /> Add Product
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Overview */}
                                    {activeTab === 'stats' && stats && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" />
                                            <StatCard label="Total Orders" value={stats.orders} icon={ShoppingCart} color="text-purple-400" />
                                            <StatCard label="Registered Users" value={stats.users} icon={Users} color="text-cyan-400" />
                                            <StatCard label="Active Auctions" value={stats.auctions} icon={Gavel} color="text-amber-400" />

                                            {/* Chart Placeholder */}
                                            <div className="lg:col-span-4 glass rounded-2xl p-6 mt-4 border border-white/5">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-white font-bold flex items-center gap-2"><BarChart3 size={18} className="text-purple-400" /> Sales Activity</h3>
                                                    <select className="input-glass w-32 py-1 text-xs"><option>Last 7 Days</option></select>
                                                </div>
                                                <div className="h-64 flex items-end gap-2 px-4">
                                                    {[40, 60, 45, 90, 65, 80, 70].map((h, i) => (
                                                        <div key={i} className="flex-1 bg-gradient-to-t from-purple-600/60 to-cyan-400/60 rounded-t-lg transition-all hover:brightness-125" style={{ height: `${h}%` }}></div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between mt-4 text-[10px] text-slate-500 px-4">
                                                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Products Table */}
                                    {activeTab === 'products' && (
                                        <div className="glass-card rounded-2xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">Product</th>
                                                        <th className="px-6 py-4">Category</th>
                                                        <th className="px-6 py-4">Price</th>
                                                        <th className="px-6 py-4">Stock</th>
                                                        <th className="px-6 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {products.map(p => (
                                                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 flex items-center gap-3">
                                                                <img src={p.images?.[0] || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover" />
                                                                <div className="text-sm font-medium text-white line-clamp-1 max-w-[200px]">{p.name}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-400">{p.category}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-white">₹{p.price.toLocaleString()}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.stock < 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                    {p.stock} left
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => { setEditingProduct(p); setProductForm(p); setShowProductModal(true); }} className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-all"><Edit size={16} /></button>
                                                                    <button onClick={() => handleDeleteProduct(p._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Orders Table */}
                                    {activeTab === 'orders' && (
                                        <div className="glass-card rounded-2xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">Order ID</th>
                                                        <th className="px-6 py-4">Customer</th>
                                                        <th className="px-6 py-4">Total</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm">
                                                    {orders.map(o => (
                                                        <tr key={o._id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 font-mono text-xs text-purple-300">#{o._id.slice(-8).toUpperCase()}</td>
                                                            <td className="px-6 py-4 text-white">{o.user?.name || 'Guest'}</td>
                                                            <td className="px-6 py-4 font-bold text-white">₹{o.totalPrice.toLocaleString()}</td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge status={o.orderStatus} />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <select
                                                                    value={o.orderStatus}
                                                                    onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                                                                    className="input-glass text-xs py-1.5 w-32"
                                                                >
                                                                    <option value="Processing">Processing</option>
                                                                    <option value="Confirmed">Confirmed</option>
                                                                    <option value="Shipped">Shipped</option>
                                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                                    <option value="Delivered">Delivered</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Users Table */}
                                    {activeTab === 'users' && (
                                        <div className="glass-card rounded-2xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">User</th>
                                                        <th className="px-6 py-4">Email</th>
                                                        <th className="px-6 py-4">Role</th>
                                                        <th className="px-6 py-4">Joined</th>
                                                        <th className="px-6 py-4">Points</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm">
                                                    {users.map(u => (
                                                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-[10px]">{u.name[0]}</div>
                                                                <span className="text-white font-medium">{u.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={u.role === 'admin' ? 'text-cyan-400' : 'text-slate-500'}>{u.role}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 text-amber-400 font-bold">{u.points || 0}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Refunds Table */}
                                    {activeTab === 'refunds' && (
                                        <div className="glass-card rounded-2xl overflow-hidden">
                                            {refunds.length === 0 ? (
                                                <div className="p-20 text-center text-slate-500">No pending refund requests</div>
                                            ) : (
                                                <table className="w-full text-left">
                                                    <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                                        <tr>
                                                            <th className="px-6 py-4">Order</th>
                                                            <th className="px-6 py-4">Reason</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-sm">
                                                        {refunds.map(r => (
                                                            <tr key={r._id} className="hover:bg-white/5 transition-colors">
                                                                <td className="px-6 py-4 font-mono text-xs text-amber-300">#{r.order?.slice(-8).toUpperCase()}</td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-white font-medium">{r.reason}</div>
                                                                    <div className="text-slate-500 text-xs">{r.description}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                                                            r.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                        {r.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {r.status === 'Pending' && (
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleProcessRefund(r._id, 'Approved')} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"><Check size={16} /></button>
                                                                            <button onClick={() => handleProcessRefund(r._id, 'Rejected')} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"><X size={16} /></button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-lg p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Product Name</label>
                                <input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="input-glass" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="input-glass h-24 pt-2" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Price (₹)</label>
                                <input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="input-glass" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Stock</label>
                                <input type="number" required value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="input-glass" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Image URL</label>
                                <input value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} className="input-glass" placeholder="https://..." />
                            </div>
                            <div className="col-span-2 flex gap-3 mt-4">
                                <button type="submit" className="btn-primary flex-1 py-3 text-sm font-bold">Save Changes</button>
                                <button type="button" onClick={() => setShowProductModal(false)} className="btn-secondary flex-1 py-3 text-sm font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-all cursor-default overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform"><Icon size={64} /></div>
            <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{label}</p>
                <h2 className="text-2xl font-black text-white font-orbitron">{value}</h2>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}><Icon size={20} /></div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Processing: 'bg-yellow-500/20 text-yellow-400',
        Confirmed: 'bg-blue-500/20 text-blue-400',
        Shipped: 'bg-cyan-500/20 text-cyan-400',
        'Out for Delivery': 'bg-purple-500/20 text-purple-400',
        Delivered: 'bg-green-500/20 text-green-400',
        Cancelled: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${styles[status] || 'bg-slate-500/20 text-slate-400'}`}>
            {status}
        </span>
    );
}

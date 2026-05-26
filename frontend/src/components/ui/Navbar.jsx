import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, User, Search, Menu, X, Zap, LogOut, LayoutDashboard, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Shop' },
        { to: '/auctions', label: 'Live Auctions', badge: '🔴 LIVE' },
        { to: '/deals', label: 'Deals' },
    ];

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#13072e]/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10`}
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                        <Zap size={18} className="text-white" />
                    </div>
                    <span className={`font-orbitron font-bold text-xl text-gradient`}>INFINITY</span>
                </Link>

                {/* Center nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-colors group text-slate-300 hover:text-white`}
                        >
                            {link.badge && <span className="absolute -top-1 -right-1 text-[9px] bg-red-500 text-white px-1 rounded-full">{link.badge}</span>}
                            {link.label}
                            {location.pathname === link.to && (
                                <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <form onSubmit={handleSearch} className={`hidden md:flex items-center gap-2 border border-purple-500/20 bg-white/5 rounded-xl px-3 py-2 transition-all focus-within:border-purple-500/50`}>
                        <button type="submit" className="text-slate-400 hover:text-white transition-colors">
                            <Search size={14} className="text-slate-400" />
                        </button>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="bg-transparent text-sm text-white outline-none w-32 placeholder:text-slate-500 focus:w-48 transition-all"
                        />
                    </form>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <Heart size={20} className={wishlist.length > 0 ? 'text-pink-400' : 'text-slate-400'} />
                        {wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <ShoppingCart size={20} className={cartCount > 0 ? 'text-cyan-400' : 'text-slate-400'} />
                        {cartCount > 0 && (
                            <motion.span
                                key={cartCount}
                                initial={{ scale: 1.5 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                            >{cartCount}</motion.span>
                        )}
                    </Link>

                    {/* User */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                            </button>
                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-48 glass border border-white/10 rounded-xl py-2 shadow-2xl"
                                        onMouseLeave={() => setProfileOpen(false)}
                                    >
                                        <div className="px-4 py-2 border-b border-white/10">
                                            <p className="text-white text-sm font-semibold">{user.name}</p>
                                            <p className="text-slate-400 text-xs">{user.email}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-slate-300" onClick={() => setProfileOpen(false)}><User size={14} /> Profile</Link>
                                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-slate-300" onClick={() => setProfileOpen(false)}><Package size={14} /> Orders</Link>
                                        {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-purple-400" onClick={() => setProfileOpen(false)}><LayoutDashboard size={14} /> Admin</Link>}
                                        <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-sm text-red-400 w-full text-left"><LogOut size={14} /> Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary text-sm py-2.5 px-6">
                            Login
                        </Link>
                    )}

                    {/* Mobile menu */}
                    <button className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/10 px-4 py-4 flex flex-col gap-2"
                    >
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-2">
                            <Search size={14} className="text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder:text-slate-500" />
                        </form>
                        {navLinks.map((link) => (
                            <Link key={link.to} to={link.to} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium">{link.label}</Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

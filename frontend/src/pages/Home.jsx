import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, ShoppingBag, Gavel, Star, TrendingUp, Clock, ArrowRight, Trophy } from 'lucide-react';
import ThreeBackground from '../components/3d/ThreeBackground';
import ProductCard from '../components/product/ProductCard';
import { getProducts } from '../services/api';
import { getAuctions } from '../services/api';

// Countdown timer hook
// Countdown timer hook - stable version using integer ticker
function useCountdown(target) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const end = useMemo(() => new Date(target), [target]);
    const diff = Math.max(0, end - Date.now());

    return useMemo(() => ({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
    }), [diff]);
}

function FlashSaleTimer() {
    const saleEnd = useMemo(() => new Date(Date.now() + 8 * 3600000), []);
    const { h, m, s } = useCountdown(saleEnd);
    return (
        <div className="flex items-center gap-3">
            {[['h', String(h).padStart(2, '0')], ['m', String(m).padStart(2, '0')], ['s', String(s).padStart(2, '0')]].map(([label, val]) => (
                <div key={label} className="countdown-box">
                    <div className="text-2xl font-bold font-orbitron text-gradient">{val}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
}

const heroSlides = [
    { title: 'Shop the', highlight: 'Future', sub: 'Next-gen products. Lightning deals. Immersive experience.', cta: 'Explore Shop', link: '/products', gradient: 'from-purple-600 to-cyan-400' },
    { title: 'Live', highlight: 'Auctions', sub: 'Bid in real-time for exclusive collectibles and tech.', cta: 'Join Auction', link: '/auctions', gradient: 'from-amber-500 to-red-500' },
    { title: 'Daily', highlight: 'Deals', sub: 'Handpicked bargains refreshed every 24 hours.', cta: 'View Deals', link: '/deals', gradient: 'from-pink-500 to-purple-600' },
];

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [trending, setTrending] = useState([]);
    const [flashSale, setFlashSale] = useState([]);
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [heroIdx, setHeroIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [feat, trend, flash, auctions] = await Promise.all([
                    getProducts({ isFeatured: true, limit: 6 }),
                    getProducts({ isTrending: true, limit: 6 }),
                    getProducts({ isFlashSale: true, limit: 4 }),
                    getAuctions({ status: 'active' }),
                ]);
                setFeatured(feat.data.products);
                setTrending(trend.data.products);
                setFlashSale(flash.data.products);
                setActiveAuctions(auctions.data.auctions.slice(0, 3));
            } catch { } finally { setLoading(false); }
        };
        fetchAll();
        const heroTimer = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000);
        return () => clearInterval(heroTimer);
    }, []);

    const slide = heroSlides[heroIdx];

    return (
        <div className="relative min-h-screen">
            <ThreeBackground />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center pt-16 z-10">
                <div className="hero-overlay" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={heroIdx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-4xl"
                            >
                                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                                    <Zap size={14} className="text-yellow-400" />
                                    <span className="text-sm text-slate-300">Next-Gen E-Commerce Platform</span>
                                </div>
                                <h1 className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl text-white mb-4">
                                    {slide.title}{' '}
                                    <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>{slide.highlight}</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-xl mx-auto">{slide.sub}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                                    <Link to={slide.link} className="btn-primary px-8 py-4 text-base flex items-center gap-2">
                                        {slide.cta} <ArrowRight size={18} />
                                    </Link>
                                    <Link to="/auctions" className="btn-secondary px-8 py-4 text-base flex items-center gap-2">
                                        <Gavel size={18} /> Live Auctions
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide dots */}
                        <div className="flex gap-2 mt-10">
                            {heroSlides.map((_, i) => (
                                <button key={i} onClick={() => setHeroIdx(i)} className={`h-1.5 rounded-full transition-all ${i === heroIdx ? 'w-8 bg-purple-500' : 'w-2 bg-white/20'}`} />
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-20 w-full max-w-2xl mx-auto">
                            {[['50K+', 'Products'], ['2.5M+', 'Users'], ['99.9%', 'Uptime']].map(([val, label]) => (
                                <div key={label} className="text-center">
                                    <div className="font-orbitron text-3xl font-bold text-gradient">{val}</div>
                                    <div className="text-sm text-slate-400 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <div className="w-5 h-8 border-2 border-white/20 rounded-full flex items-start justify-center p-1"><div className="w-1 h-2 bg-white/40 rounded-full" /></div>
                </div>
            </section>

            <div className="relative z-10 bg-gradient-to-b from-transparent to-[#080b14]">
                {/* Flash Sale */}
                {flashSale.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                        <div className="glass neon-border rounded-2xl p-8 mb-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2"><Zap className="text-amber-400" size={20} /><span className="text-amber-400 font-orbitron font-bold uppercase tracking-wider text-sm">Flash Sale</span></div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white">Limited Time Offers</h2>
                                </div>
                                <FlashSaleTimer />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {flashSale.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    </section>
                )}

                {/* Active Auctions preview */}
                {activeAuctions.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-red-400 text-sm font-semibold uppercase tracking-wider">Live Now</span></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">Active Auctions</h2>
                            </div>
                            <Link to="/auctions" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"><span>View All</span><ChevronRight size={16} /></Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {activeAuctions.map((auction, i) => (
                                <AuctionPreviewCard key={auction._id} auction={auction} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Products */}
                {featured.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <div><div className="flex items-center gap-2 mb-1"><Star size={16} className="text-amber-400 fill-amber-400" /><span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Featured</span></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">Handpicked for You</h2></div>
                            <Link to="/products?isFeatured=true" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"><span>View All</span><ChevronRight size={16} /></Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    </section>
                )}

                {/* Trending */}
                {trending.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                        <div className="flex items-center justify-between mb-8">
                            <div><div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-cyan-400" /><span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Trending</span></div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">What's Hot Right Now</h2></div>
                            <Link to="/products?isTrending=true" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"><span>View All</span><ChevronRight size={16} /></Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {trending.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    </section>
                )}

                {/* Categories */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { name: 'Electronics', emoji: '⚡', gradient: 'from-purple-600 to-blue-600' },
                            { name: 'Gaming', emoji: '🎮', gradient: 'from-cyan-600 to-teal-500' },
                            { name: 'Fashion', emoji: '👗', gradient: 'from-pink-600 to-rose-500' },
                            { name: 'Jewelry', emoji: '💎', gradient: 'from-amber-500 to-yellow-400' },
                            { name: 'Collectibles', emoji: '🏆', gradient: 'from-orange-500 to-red-500' },
                        ].map((cat) => (
                            <Link key={cat.name} to={`/products?category=${cat.name}`}>
                                <motion.div whileHover={{ scale: 1.05 }} className={`glass rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer border border-white/10 hover:border-purple-500/40 transition-all`}>
                                    <div className={`text-4xl`}>{cat.emoji}</div>
                                    <span className="text-sm font-medium text-slate-300">{cat.name}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Promo Banner */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
                    <div className="glass rounded-3xl p-8 md:p-12 bg-gradient-to-br from-purple-900/40 to-cyan-900/20 border border-purple-500/20 text-center">
                        <Trophy className="text-amber-400 mx-auto mb-4" size={40} />
                        <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-3">Join the <span className="text-gradient">Leaderboard</span></h2>
                        <p className="text-slate-400 text-lg mb-6 max-w-xl mx-auto">Shop, earn points, win auctions — climb the ranks and unlock exclusive perks.</p>
                        <Link to="/leaderboard" className="btn-primary px-8 py-3 text-base inline-block">
                            View Leaderboard 🏆
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

function AuctionPreviewCard({ auction, index }) {
    const { h, m, s } = useCountdown(auction.endTime);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="glass hover-lift rounded-2xl overflow-hidden border border-red-500/20">
            <div className="relative h-44 overflow-hidden">
                <img src={auction.image || auction.product?.images?.[0] || ''} alt={auction.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex gap-2">
                        {[String(h).padStart(2, '0'), String(m).padStart(2, '0'), String(s).padStart(2, '0')].map((v, i) => (
                            <div key={i} className="countdown-box flex-1 py-2">
                                <div className="text-lg font-bold font-orbitron text-white">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">{auction.title}</h3>
                <div className="flex items-center justify-between">
                    <div><p className="text-xs text-slate-400">Current Bid</p><p className="text-lg font-bold text-gradient">₹{auction.currentBid > 0 ? auction.currentBid.toLocaleString('en-IN') : auction.startingPrice.toLocaleString('en-IN')}</p></div>
                    <Link to={`/auctions/${auction._id}`} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
                        <Gavel size={13} /> Bid Now
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

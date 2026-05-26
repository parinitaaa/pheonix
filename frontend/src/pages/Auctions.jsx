import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gavel, Clock, Trophy, Users, ChevronRight, Zap } from 'lucide-react';
import { getAuctions } from '../services/api';

function useCountdown(target) {
    const [t, setT] = useState({ h: 0, m: 0, s: 0 });
    useEffect(() => {
        const upd = () => { const d = Math.max(0, new Date(target) - Date.now()); setT({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) }); };
        upd();
        const id = setInterval(upd, 1000);
        return () => clearInterval(id);
    }, [target]);
    return t;
}

function AuctionCard({ auction, index }) {
    const { h, m, s } = useCountdown(auction.endTime);
    const urgent = h === 0 && m < 30;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
            className="glass hover-lift rounded-2xl overflow-hidden flex flex-col">
            <div className="relative h-56 overflow-hidden">
                <img src={auction.image || auction.product?.images?.[0]} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status */}
                <div className="absolute top-3 left-3">
                    {auction.status === 'active' && <div className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-bold"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE AUCTION</div>}
                    {auction.status === 'upcoming' && <div className="badge badge-cyan">🕐 Starting Soon</div>}
                    {auction.status === 'ended' && <div className="badge badge-purple">🏆 Ended</div>}
                </div>

                {/* Timer */}
                <div className="absolute bottom-3 left-3 right-3">
                    {auction.status === 'active' && (
                        <div className={`flex items-center gap-1 mb-2 ${urgent ? 'text-red-400' : 'text-amber-400'}`}>
                            <Clock size={13} /><span className="text-xs font-semibold">{urgent ? '⚠️ Ending soon!' : 'Time remaining'}</span>
                        </div>
                    )}
                    <div className="flex gap-2">
                        {[[String(h).padStart(2, '0'), 'H'], [String(m).padStart(2, '0'), 'M'], [String(s).padStart(2, '0'), 'S']].map(([v, l]) => (
                            <div key={l} className="countdown-box flex-1">
                                <div className={`text-xl font-bold font-orbitron ${urgent && auction.status === 'active' ? 'text-red-400' : 'text-white'}`}>{v}</div>
                                <div className="text-[10px] text-slate-400 uppercase">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{auction.title}</h3>
                {auction.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{auction.description}</p>}

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-0.5">Current Bid</p>
                        <p className="text-2xl font-bold font-orbitron text-gradient">₹{(auction.currentBid > 0 ? auction.currentBid : auction.startingPrice).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-400 text-xs mb-1"><Users size={12} /><span>{auction.totalBids || 0} bids</span></div>
                        {auction.highestBidder && <p className="text-xs text-purple-400">👑 {auction.highestBidder.name}</p>}
                    </div>
                </div>

                <Link to={`/auctions/${auction._id}`} className="mt-auto">
                    <button className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${auction.status === 'active' ? 'btn-primary' : auction.status === 'ended' ? 'glass border border-white/10 text-slate-400 cursor-default' : 'btn-secondary'}`} disabled={auction.status === 'ended'}>
                        {auction.status === 'active' ? <><Gavel size={16} /> Place Bid</> : auction.status === 'upcoming' ? <><Clock size={16} /> Set Reminder</> : <><Trophy size={16} /> View Results</>}
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}

export default function Auctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            try { const { data } = await getAuctions(); setAuctions(data.auctions); }
            catch { } finally { setLoading(false); }
        };
        fetch();
        const id = setInterval(async () => {
            try { const { data } = await getAuctions(); setAuctions(data.auctions); } catch { }
        }, 30000);
        return () => clearInterval(id);
    }, []);

    const filtered = filter === 'all' ? auctions : auctions.filter(a => a.status === filter);

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" /><span className="text-red-400 text-sm font-bold uppercase tracking-wider">Live Auctions</span></div>
                        <h1 className="font-orbitron text-4xl font-black text-white">Bid & Win</h1>
                        <p className="text-slate-400 mt-1">Real-time bidding on exclusive collectibles and tech</p>
                    </div>
                    <div className="glass rounded-2xl p-4 border border-amber-500/20 flex items-center gap-3">
                        <Zap className="text-amber-400" size={24} />
                        <div><p className="text-white font-semibold text-sm">Anti-Bot Protected</p><p className="text-slate-400 text-xs">1 bid per 10 seconds</p></div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-8">
                    {['all', 'active', 'upcoming', 'ended'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-purple-600 text-white' : 'glass text-slate-400 hover:text-white border border-white/10'}`}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="glass rounded-2xl h-80 shimmer" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 glass rounded-2xl">
                        <Gavel size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-xl mb-2">No auctions found</h3>
                        <p className="text-slate-400">Check back soon for new exciting auctions</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((a, i) => <AuctionCard key={a._id} auction={a} index={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

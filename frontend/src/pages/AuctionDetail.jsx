import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Trophy, Clock, Users, ArrowLeft, ChevronUp } from 'lucide-react';
import { getAuction, placeBid } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Countdown({ endTime }) {
    const [t, setT] = useState({ h: 0, m: 0, s: 0 });
    useEffect(() => {
        const upd = () => { const d = Math.max(0, new Date(endTime) - Date.now()); setT({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) }); };
        upd(); const id = setInterval(upd, 1000); return () => clearInterval(id);
    }, [endTime]);
    return (
        <div className="flex gap-3">
            {[[String(t.h).padStart(2, '0'), 'Hours'], [String(t.m).padStart(2, '0'), 'Minutes'], [String(t.s).padStart(2, '0'), 'Seconds']].map(([val, label]) => (
                <div key={label} className="countdown-box">
                    <div className="text-3xl font-bold font-orbitron text-gradient">{val}</div>
                    <div className="text-xs text-slate-400 mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
}

export default function AuctionDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [bidding, setBidding] = useState(false);

    const fetchAuction = async () => {
        try { const { data } = await getAuction(id); setAuction(data.auction); setBids(data.bids); }
        catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAuction(); const id2 = setInterval(fetchAuction, 10000); return () => clearInterval(id2); }, [id]);

    const handleBid = async () => {
    const bidNum = Number(bidAmount);
    // Compute current bid and next minimum bid based on auction data
    const currentBid = auction?.currentBid > 0 ? auction.currentBid : auction?.startingPrice;
    const minNextBid = currentBid + (auction?.minBidIncrement || 0);

    if (!bidAmount || isNaN(bidNum)) {
        toast.error('Enter a valid bid amount');
        return;
    }
    if (bidNum < minNextBid) {
        toast.error(`Bid must be at least ₹${minNextBid.toLocaleString('en-IN')}`);
        return;
    }
    setBidding(true);
    try {
        const { data } = await placeBid(id, { amount: bidNum });
        setAuction(data.auction);
        if (data.bids) setBids(data.bids);
        setBidAmount('');
        toast.success(data.message || 'Bid placed successfully');
        fetchAuction();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Bid failed');
    } finally {
        setBidding(false);
    }
};





    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!auction) return <div className="min-h-screen flex items-center justify-center text-white">Auction not found</div>;

    const currentBid = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
    const minNextBid = currentBid + auction.minBidIncrement;
    const isActive = auction.status === 'active';

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <Link to="/auctions" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"><ArrowLeft size={16} /> Back to Auctions</Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div className="lg:col-span-2">
                        <div className="glass rounded-2xl overflow-hidden mb-6">
                            <div className="relative h-72">
                                <img src={auction.image || auction.product?.images?.[0]} alt={auction.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-4 left-4">
                                    {isActive && <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-bold"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE AUCTION</div>}
                                </div>
                            </div>
                            <div className="p-6">
                                <h1 className="font-orbitron text-2xl font-bold text-white mb-2">{auction.title}</h1>
                                <p className="text-slate-400">{auction.description}</p>
                            </div>
                        </div>

                        {/* Bid history */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4"><ChevronUp className="text-purple-400" size={20} /> Bid History ({bids.length})</h2>
                            {bids.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No bids yet. Be the first!</p>
                            ) : (
                                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                                    {bids.map((bid, i) => (
                                        <motion.div key={bid._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                            className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5'}`}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                                {bid.user?.name?.[0] || '?'}
                                            </div>
                                            <div className="flex-1"><p className="text-white text-sm font-medium">{bid.user?.name || 'Anonymous'}</p><p className="text-slate-400 text-xs">{new Date(bid.createdAt).toLocaleTimeString()}</p></div>
                                            <div className="text-right">
                                                <p className={`font-bold ${i === 0 ? 'text-gradient' : 'text-white'}`}>₹{bid.amount.toLocaleString('en-IN')}</p>
                                                {i === 0 && <p className="text-xs text-purple-400">Highest</p>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-5">
                        {/* Stats */}
                        <div className="glass rounded-2xl p-6 border border-purple-500/20">
                            <div className="text-center mb-5">
                                <p className="text-slate-400 text-sm mb-1">Current Highest Bid</p>
                                <p className="font-orbitron text-4xl font-black text-gradient">₹{currentBid.toLocaleString('en-IN')}</p>
                                {auction.highestBidder && <p className="text-purple-400 text-sm mt-1">👑 {auction.highestBidder.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="glass rounded-xl p-3 text-center"><p className="text-slate-400 text-xs">Total Bids</p><p className="text-white font-bold text-xl flex items-center justify-center gap-1"><Users size={16} />{auction.totalBids}</p></div>
                                <div className="glass rounded-xl p-3 text-center"><p className="text-slate-400 text-xs">Min Increment</p><p className="text-white font-bold text-sm">₹{auction.minBidIncrement.toLocaleString('en-IN')}</p></div>
                            </div>

                            {isActive && (
                                <div className="mb-5"><p className="text-slate-400 text-xs mb-3 text-center">Time Remaining</p><Countdown endTime={auction.endTime} /></div>
                            )}

                            {auction.status === 'ended' && auction.winner && (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center mb-4">
                                    <Trophy size={28} className="text-amber-400 mx-auto mb-2" />
                                    <p className="text-amber-300 font-semibold">Auction Ended!</p>
                                    <p className="text-white">{auction.winner?.name} won for ₹{auction.winningBid?.toLocaleString('en-IN')}</p>
                                </div>
                            )}
                        </div>

                        {/* Bid form */}
                        {isActive && (
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Gavel size={18} className="text-purple-400" /> Place Your Bid</h3>
                                <p className="text-slate-400 text-xs mb-3">Minimum bid: <span className="text-white font-semibold">₹{minNextBid.toLocaleString('en-IN')}</span></p>
                                <div className="flex gap-2 mb-4">
                                    {[minNextBid, minNextBid + auction.minBidIncrement, minNextBid + auction.minBidIncrement * 2].map(amt => (
                                        <button key={amt} onClick={() => setBidAmount(String(amt))} className={`flex-1 text-xs py-2 rounded-xl border transition-all ${bidAmount === String(amt) ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
                                            ₹{(amt / 1000).toFixed(0)}K
                                        </button>
                                    ))}
                                </div>
                                <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={`Min ₹${minNextBid.toLocaleString('en-IN')}`} className="input-glass mb-4" min={minNextBid} />
                                <button onClick={handleBid} disabled={bidding} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                    {bidding ? 'Placing bid...' : <><Gavel size={16} /> Bid ₹{Number(bidAmount || 0).toLocaleString('en-IN')}</>}
                                </button>
                                <p className="text-slate-500 text-xs text-center mt-3">⚡ Anti-bot: 1 bid per 10 seconds limit</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

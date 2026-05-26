import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Sparkles, User, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getLeaderboard();
                setLeaderboard(data.leaderboard);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Split top 3 and others
    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    // Helper to get order for visual layout (2nd, 1st, 3rd)
    const getTopThreeOrdered = () => {
        const ordered = [];
        if (topThree[1]) ordered.push({ ...topThree[1], rank: 2 });
        if (topThree[0]) ordered.push({ ...topThree[0], rank: 1 });
        if (topThree[2]) ordered.push({ ...topThree[2], rank: 3 });
        return ordered;
    };

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-4"
                    >
                        <Trophy size={16} className="text-amber-400 animate-bounce" />
                        <span className="text-sm font-semibold text-purple-300">INFINITY Hall of Fame</span>
                    </motion.div>
                    <h1 className="font-orbitron text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        User <span className="text-gradient">Leaderboard</span>
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                        Shop, maintain streaks, and climb the rankings to unlock exclusive rewards!
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-4 h-64">
                            {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl shimmer-bg" />)}
                        </div>
                        {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-16 shimmer-bg" />)}
                    </div>
                ) : (
                    <>
                        {/* Top 3 podium */}
                        {topThree.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6 mb-12 pt-8">
                                {getTopThreeOrdered().map((u) => {
                                    const isFirst = u.rank === 1;
                                    const heightClass = isFirst ? 'h-80 border-amber-500/40 bg-amber-500/5' : u.rank === 2 ? 'h-72 border-slate-400/30 bg-slate-400/5' : 'h-64 border-amber-700/30 bg-amber-700/5';
                                    const trophyColor = isFirst ? 'text-amber-400' : u.rank === 2 ? 'text-slate-300' : 'text-amber-600';
                                    
                                    return (
                                        <motion.div
                                            key={u._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: u.rank * 0.1 }}
                                            className={`glass relative rounded-3xl p-6 border flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${heightClass}`}
                                        >
                                            {/* Rank Badge */}
                                            <div className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-lg border-2 bg-[#0d1120] ${isFirst ? 'border-amber-400 text-amber-400' : u.rank === 2 ? 'border-slate-300 text-slate-300' : 'border-amber-600 text-amber-600'}`}>
                                                {u.rank}
                                            </div>

                                            <div className="relative mb-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/10 shadow-xl">
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <Trophy size={20} className={`absolute -bottom-1 -right-1 ${trophyColor}`} />
                                            </div>

                                            <h3 className="text-white font-bold text-lg line-clamp-1">{u.name}</h3>
                                            
                                            <div className="flex flex-col gap-1 mt-3">
                                                <span className="text-sm font-semibold font-orbitron text-gradient flex items-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" /> {u.points?.toLocaleString()} pts
                                                </span>
                                                <span className="text-xs text-amber-500 font-medium flex items-center justify-center gap-1">
                                                    <Flame size={12} className="fill-amber-500" /> {u.streak || 0} Day Streak
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table for remaining users */}
                        {others.length > 0 && (
                            <div className="glass rounded-3xl overflow-hidden border border-white/5 mb-8">
                                <div className="p-5 border-b border-white/5">
                                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                        <Sparkles size={18} className="text-purple-400" /> Rank Standings
                                    </h2>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {others.map((u, index) => (
                                        <div key={u._id} className="flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="font-orbitron font-bold text-slate-500 w-6 text-center">
                                                    {index + 4}
                                                </span>
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-xl object-cover" alt="" /> : u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{u.name}</p>
                                                    <p className="text-xs text-amber-500 font-medium flex items-center gap-1">
                                                        <Flame size={10} className="fill-amber-500" /> {u.streak || 0} Day Streak
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold font-orbitron text-sm flex items-center gap-1 justify-end">
                                                    <Star size={12} className="text-amber-400 fill-amber-400" /> {u.points?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Logged in user stats */}
                        {user && (
                            <div className="glass rounded-3xl p-6 border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-cyan-900/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-center sm:text-left">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-lg font-bold border border-purple-500/30">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Your Standing</h4>
                                        <p className="text-xs text-slate-400">Keep maintaining your streak and ordering to increase points!</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-center sm:text-right">
                                        <p className="text-xs text-slate-400">Your Points</p>
                                        <p className="text-lg font-black font-orbitron text-gradient flex items-center gap-1 sm:justify-end">
                                            <Star size={14} className="text-amber-400 fill-amber-400" /> {user.points || 0}
                                        </p>
                                    </div>
                                    <div className="text-center sm:text-right border-l border-white/10 pl-6">
                                        <p className="text-xs text-slate-400">Your Streak</p>
                                        <p className="text-lg font-black font-orbitron text-amber-500 flex items-center gap-1 sm:justify-end">
                                            <Flame size={14} className="fill-amber-500" /> {user.streak || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Guide card */}
                        <div className="glass rounded-3xl p-6 border border-white/5 flex gap-4">
                            <Info className="text-purple-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">How points are awarded:</h4>
                                <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                                    <li>Daily logins: Log in consecutive days to maintain your active login streak.</li>
                                    <li>Shop & Buy: Earn points back matching a percentage of order total values.</li>
                                    <li>Auctions: Points are utilized to compete for items and won auctions award leaderboard prestige.</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

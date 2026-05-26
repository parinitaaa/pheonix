import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative border-t border-white/10 mt-20 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                                <Zap size={18} className="text-white" />
                            </div>
                            <span className="font-orbitron font-bold text-xl text-gradient">INFINITY</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">The next-generation digital marketplace. Shop, bid, and discover in a futuristic universe.</p>
                        <div className="flex gap-3 mt-4">
                            {[Github, Twitter, Instagram, Mail].map((Icon, i) => (
                                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                                    <Icon size={15} className="text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-2">
                            {['Electronics', 'Fashion', 'Gaming', 'Collectibles', 'Beauty', 'Sports'].map((cat) => (
                                <li key={cat}><Link to={`/products?category=${cat}`} className="text-slate-400 text-sm hover:text-white transition-colors">{cat}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Features</h4>
                        <ul className="space-y-2">
                            {[['Live Auctions', '/auctions'], ['Daily Deals', '/deals'], ['Flash Sales', '/products?isFlashSale=true'], ['Trending', '/products?isTrending=true'], ['Leaderboard', '/leaderboard']].map(([label, to]) => (
                                <li key={label}><Link to={to} className="text-slate-400 text-sm hover:text-white transition-colors">{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2">
                            {['FAQ', 'Track Order', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}><span className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">{item}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs">© 2025 INFINITY. All rights reserved. Built for the future.</p>
                    <div className="flex gap-4">
                        {['INFINITY20', 'WELCOME10'].map((code) => (
                            <span key={code} className="badge badge-purple text-xs cursor-pointer" title="Coupon code">{code}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

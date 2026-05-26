import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThreeBackground from '../components/3d/ThreeBackground';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { const user = await login(email, password); navigate(user.role === 'admin' ? '/admin' : '/'); }
        catch { }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <ThreeBackground />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-sm relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center"><Zap size={22} className="text-white" /></div>
                        <span className="font-orbitron font-bold text-2xl text-gradient">INFINITY</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome Back</h1>
                <p className="text-slate-400 text-center text-sm mb-6">Enter the future marketplace</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@infinity.com" className="input-glass pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-glass pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">{loading ? 'Signing in...' : 'Sign In'}</button>
                </form>

                <div className="mt-5 p-4 bg-white/5 rounded-xl text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300 mb-2">Demo Credentials:</p>
                    <p>👤 User: user@infinity.com / User@123456</p>
                    <p>🛡️ Admin: admin@infinity.com / Admin@123456</p>
                </div>

                <p className="text-center text-slate-400 text-sm mt-5">Don't have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">Register</Link></p>
            </motion.div>
        </div>
    );
}

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { await register(name, email, password); navigate('/'); }
        catch { }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <ThreeBackground />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-sm relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center"><Zap size={22} className="text-white" /></div>
                        <span className="font-orbitron font-bold text-2xl text-gradient">INFINITY</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-1">Create Account</h1>
                <p className="text-slate-400 text-center text-sm mb-6">Join the next-gen marketplace</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Nova" className="input-glass pl-10" /></div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@infinity.com" className="input-glass pl-10" /></div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" className="input-glass pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">{loading ? 'Creating account...' : 'Create Account'}</button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-5">Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Login</Link></p>
            </motion.div>
        </div>
    );
}

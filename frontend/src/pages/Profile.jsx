import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, BookOpen, Target, CheckSquare, Flame, Star, Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, addAddress, deleteAddress } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', shoppingGoal: user?.shoppingGoal || 0 });
    const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' });
    const [todos, setTodos] = useState(user?.todos || []);
    const [todoText, setTodoText] = useState('');
    const [notes, setNotes] = useState(user?.notes || []);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [showAddAddr, setShowAddAddr] = useState(false);

    const saveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({ ...form, todos, notes });
            await refreshUser();
            toast.success('Profile updated!');
        } catch (err) { toast.error('Update failed'); }
        finally { setSaving(false); }
    };

    const addTodo = () => {
        if (!todoText.trim()) return;
        setTodos(t => [...t, { text: todoText, completed: false, createdAt: new Date() }]);
        setTodoText('');
    };

    const toggleTodo = (i) => setTodos(t => t.map((item, idx) => idx === i ? { ...item, completed: !item.completed } : item));
    const deleteTodo = (i) => setTodos(t => t.filter((_, idx) => idx !== i));

    const addNote = () => {
        if (!noteTitle.trim()) return;
        setNotes(n => [{ title: noteTitle, content: noteContent, createdAt: new Date() }, ...n]);
        setNoteTitle(''); setNoteContent('');
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try { await addAddress(newAddr); await refreshUser(); setShowAddAddr(false); setNewAddr({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }); toast.success('Address added!'); }
        catch (err) { toast.error('Failed to add address'); }
    };

    const handleDeleteAddress = async (id) => {
        try { await deleteAddress(id); await refreshUser(); toast.success('Address removed'); }
        catch { toast.error('Failed to remove'); }
    };

    const tabs = [['profile', User, 'Profile'], ['addresses', MapPin, 'Addresses'], ['planner', CheckSquare, 'Planner'], ['notes', BookOpen, 'Notes'], ['goals', Target, 'Goals']];

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]?.toUpperCase()}</div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                        <p className="text-slate-400">{user?.email}</p>
                        <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
                            <span className="badge badge-purple">⭐ {user?.points || 0} Points</span>
                            <span className="badge badge-gold"><Flame size={11} /> {user?.streak || 0} Day Streak</span>
                            {user?.role === 'admin' && <span className="badge badge-cyan">🛡️ Admin</span>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Tab sidebar */}
                    <div className="hidden sm:flex flex-col gap-1 w-48 shrink-0">
                        {tabs.map(([key, Icon, label]) => (
                            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${tab === key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Icon size={16} />{label}
                            </button>
                        ))}
                    </div>

                    {/* Mobile tab scroll */}
                    <div className="sm:hidden flex gap-2 mb-4 overflow-x-auto w-full">
                        {tabs.map(([key, Icon, label]) => (
                            <button key={key} onClick={() => setTab(key)} className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${tab === key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'glass text-slate-400 border border-white/10'}`}>
                                <Icon size={13} />{label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {tab === 'profile' && (
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-white font-bold text-lg mb-5">Personal Info</h2>
                                <div className="flex flex-col gap-4">
                                    <div><label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Display Name</label>
                                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-glass" /></div>
                                    <div><label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                                        <input value={user?.email} disabled className="input-glass opacity-50 cursor-not-allowed" /></div>
                                    <button onClick={saveProfile} disabled={saving} className="btn-primary self-start px-6 py-2.5 flex items-center gap-2"><Save size={15} />{saving ? 'Saving...' : 'Save Changes'}</button>
                                </div>
                            </div>
                        )}

                        {tab === 'addresses' && (
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-white font-bold text-lg">Saved Addresses</h2>
                                    <button onClick={() => setShowAddAddr(!showAddAddr)} className="btn-primary text-xs py-2 px-4 flex items-center gap-1"><Plus size={14} />Add New</button>
                                </div>
                                {showAddAddr && (
                                    <form onSubmit={handleAddAddress} className="bg-white/5 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[['fullName', 'Full Name'], ['phone', 'Phone'], ['addressLine1', 'Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([f, l]) => (
                                            <input key={f} placeholder={l} value={newAddr[f]} onChange={e => setNewAddr(a => ({ ...a, [f]: e.target.value }))} required className="input-glass text-sm" />
                                        ))}
                                        <div className="sm:col-span-2 flex gap-2">
                                            <button type="submit" className="btn-primary text-sm py-2 px-5">Save Address</button>
                                            <button type="button" onClick={() => setShowAddAddr(false)} className="btn-secondary text-sm py-2 px-5">Cancel</button>
                                        </div>
                                    </form>
                                )}
                                {!user?.addresses?.length && !showAddAddr && <p className="text-slate-500 text-center py-8">No addresses saved yet</p>}
                                <div className="flex flex-col gap-3">
                                    {user?.addresses?.map((addr) => (
                                        <div key={addr._id} className="flex items-start justify-between p-4 bg-white/5 rounded-xl">
                                            <div><p className="text-white font-medium">{addr.fullName}</p><p className="text-slate-400 text-sm">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p><p className="text-slate-400 text-sm">{addr.phone}</p></div>
                                            <button onClick={() => handleDeleteAddress(addr._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'planner' && (
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><CheckSquare size={20} className="text-purple-400" />Shopping Planner</h2>
                                <div className="flex gap-2 mb-4">
                                    <input value={todoText} onChange={e => setTodoText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="Add item to buy..." className="input-glass flex-1" />
                                    <button onClick={addTodo} className="btn-primary px-4 py-2.5"><Plus size={16} /></button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {todos.map((todo, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(i)} className="accent-purple-500 w-4 h-4 cursor-pointer" />
                                            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>{todo.text}</span>
                                            <button onClick={() => deleteTodo(i)} className="p-1 hover:bg-red-500/20 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                                        </div>
                                    ))}
                                    {todos.length === 0 && <p className="text-slate-500 text-center py-8">Your shopping list is empty</p>}
                                </div>
                                {todos.length > 0 && <button onClick={saveProfile} className="btn-primary mt-4 text-sm py-2 px-5 flex items-center gap-2"><Save size={14} />Save List</button>}
                            </div>
                        )}

                        {tab === 'notes' && (
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><BookOpen size={20} className="text-cyan-400" />Notes</h2>
                                <div className="bg-white/5 rounded-xl p-4 mb-4 flex flex-col gap-3">
                                    <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Note title..." className="input-glass text-sm" />
                                    <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={3} placeholder="Note content..." className="input-glass text-sm resize-none" />
                                    <div className="flex gap-2">
                                        <button onClick={addNote} className="btn-primary text-sm py-2 px-5 flex items-center gap-2"><Plus size={14} />Add Note</button>
                                        <button onClick={saveProfile} className="btn-secondary text-sm py-2 px-5 flex items-center gap-2"><Save size={14} />Save All</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {notes.map((note, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-white font-semibold text-sm">{note.title}</h4>
                                                <button onClick={() => { setNotes(n => n.filter((_, idx) => idx !== i)); }} className="p-1 hover:bg-red-500/20 rounded-lg"><Trash2 size={12} className="text-red-400" /></button>
                                            </div>
                                            <p className="text-slate-400 text-xs">{note.content}</p>
                                        </div>
                                    ))}
                                    {notes.length === 0 && <p className="text-slate-500 text-center py-8 col-span-2">No notes yet</p>}
                                </div>
                            </div>
                        )}

                        {tab === 'goals' && (
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><Target size={20} className="text-amber-400" />Shopping Goal</h2>
                                <p className="text-slate-400 text-sm mb-4">Set a monthly shopping budget target and track your progress.</p>
                                <div className="mb-6">
                                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Monthly Budget Goal (₹)</label>
                                    <input type="number" value={form.shoppingGoal} onChange={e => setForm(f => ({ ...f, shoppingGoal: e.target.value }))} placeholder="e.g. 5000" className="input-glass" />
                                </div>
                                {form.shoppingGoal > 0 && (
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                                            <span>Spent this month</span><span>₹{user?.monthlySpend?.toLocaleString('en-IN') || 0} / ₹{Number(form.shoppingGoal).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" animate={{ width: `${Math.min(100, ((user?.monthlySpend || 0) / form.shoppingGoal) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-xl p-4 text-center"><p className="text-slate-400 text-xs mb-1">Total Points</p><p className="text-2xl font-bold font-orbitron text-gradient">{user?.points || 0}</p></div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center"><p className="text-slate-400 text-xs mb-1">Login Streak</p><p className="text-2xl font-bold font-orbitron text-amber-400">{user?.streak || 0} 🔥</p></div>
                                </div>
                                <button onClick={saveProfile} disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2"><Save size={15} />{saving ? 'Saving...' : 'Save Goal'}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

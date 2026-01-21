
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { USERS_API } from '../lib/axios';
import { User, Phone, Mail, Save, X, ChevronLeft, Shield } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`${USERS_API}/me`);
            setUser(res.data);
            setFormData({
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                phone_number: res.data.phone_number
            });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put(`${USERS_API}/me`, formData);
            setUser(res.data.user);
            setIsEditing(false);
            // Update local storage if needed
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="glass-header px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4 w-full">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6">
                <div className="card-premium">
                    <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 border-4 border-white shadow-xl flex items-center justify-center text-white font-bold text-3xl">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{user?.first_name} {user?.last_name}</h2>
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                                <Shield size={12} fill="currentColor" /> {user?.user_role}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        disabled={true} // Email usually not editable directly
                                        value={user?.email}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); setFormData({ first_name: user.first_name, last_name: user.last_name, phone_number: user.phone_number }); }}
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                                    >
                                        <Save size={18} /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

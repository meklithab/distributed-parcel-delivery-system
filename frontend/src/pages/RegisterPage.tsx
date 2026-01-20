
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { USERS_API } from '../lib/axios';
import { Truck, Mail, Lock, User, Phone, Briefcase, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    user_role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`${USERS_API}/auth/register`, formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-40" />

        <div className="w-full max-w-xl z-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-slate-100 mb-4 animate-soft-pulse">
                    <Truck className="text-indigo-600" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-slate-500 mt-2">Join our network of customers and couriers</p>
            </div>

            <div className="card-premium">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" placeholder="John" 
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-900"
                                    onChange={e => setFormData({...formData, first_name: e.target.value})} required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text" placeholder="Doe" 
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-900"
                                    onChange={e => setFormData({...formData, last_name: e.target.value})} required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" placeholder="john@example.com" 
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-900"
                                    onChange={e => setFormData({...formData, email: e.target.value})} required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input 
                                    type="text" placeholder="+251..." 
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-900"
                                    onChange={e => setFormData({...formData, phone_number: e.target.value})} required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Secure Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" placeholder="••••••••" 
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-slate-900"
                                onChange={e => setFormData({...formData, password: e.target.value})} required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 ml-1">I want to join as</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setFormData({...formData, user_role: 'CUSTOMER'})}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.user_role === 'CUSTOMER' 
                                    ? 'border-indigo-600 bg-indigo-50/50' 
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                }`}
                            >
                                <User size={24} className={formData.user_role === 'CUSTOMER' ? 'text-indigo-600' : 'text-slate-400'} />
                                <span className={`text-sm font-bold ${formData.user_role === 'CUSTOMER' ? 'text-indigo-600' : 'text-slate-500'}`}>Customer</span>
                                {formData.user_role === 'CUSTOMER' && <CheckCircle size={14} className="text-indigo-600" />}
                            </div>
                            <div 
                                onClick={() => setFormData({...formData, user_role: 'COURIER'})}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    formData.user_role === 'COURIER' 
                                    ? 'border-indigo-600 bg-indigo-50/50' 
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                }`}
                            >
                                <Briefcase size={24} className={formData.user_role === 'COURIER' ? 'text-indigo-600' : 'text-slate-400'} />
                                <span className={`text-sm font-bold ${formData.user_role === 'COURIER' ? 'text-indigo-600' : 'text-slate-500'}`}>Courier</span>
                                {formData.user_role === 'COURIER' && <CheckCircle size={14} className="text-indigo-600" />}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-primary py-3.5 text-lg font-bold mt-4"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account? 
                        <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 ml-1 underline-offset-4 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
            
            <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
                Secure & Distributed Registration
            </p>
        </div>
    </div>
  );
}

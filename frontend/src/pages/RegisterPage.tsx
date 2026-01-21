// RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { AUTH_API } from '../lib/axios';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    user_role: 'CUSTOMER'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`${AUTH_API}/register`, formData);
      addToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors?.map((e: any) => e.msg).join(', ');
      addToast(validationErrors || err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 transition-all hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="text" placeholder="First Name" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, first_name: e.target.value})} required
            disabled={isLoading}
          />
          <input 
            type="text" placeholder="Last Name" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, last_name: e.target.value})} required
            disabled={isLoading}
          />
          <input 
            type="email" placeholder="Email" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, email: e.target.value})} required
            disabled={isLoading}
          />
          <input 
            type="text" placeholder="Phone (+251...)" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, phone_number: e.target.value})} required
            disabled={isLoading}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, password: e.target.value})} required
            disabled={isLoading}
          />
          <select 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            onChange={e => setFormData({...formData, user_role: e.target.value})}
            disabled={isLoading}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="COURIER">Courier</option>
          </select>

          <button 
            type="submit" 
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size={20} color="white" /> : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}

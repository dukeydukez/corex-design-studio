'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    // Demo mode: simulate registration and redirect
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify({
          id: 'demo-user-1',
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organizationId: 'demo-org-1',
        }));
        localStorage.setItem('demo_mode', 'true');
      }
      setIsLoading(false);
      router.push('/dashboard');
    }, 800);
  };

  const handleDemoAccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo-user-1',
        email: 'demo@corexcreative.com',
        firstName: 'Dwayne',
        lastName: 'Holness',
        organizationId: 'demo-org-1',
      }));
      localStorage.setItem('demo_mode', 'true');
    }
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm ${
      errors[field] ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-block">
            <img src="/CorexCreative_Black.png" alt="Corex Creative" className="h-10 object-contain mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">COREX Studio</h1>
          <p className="text-gray-500 mt-2">AI-Powered Design Platform</p>
        </div>

        {/* Form */}
        <div className="animate-fade-in-up stagger-1 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-6">Start designing with AI-powered agents</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className={inputClass('firstName')} placeholder="John" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className={inputClass('lastName')} placeholder="Doe" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="your@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className={inputClass('password')} placeholder="Min. 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} className={inputClass('confirmPassword')} placeholder="Re-enter password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] disabled:bg-gray-300 disabled:scale-100 transition-smooth text-sm shadow-lg shadow-gray-900/10"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-4">
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
            </div>
            <button
              onClick={handleDemoAccess}
              className="w-full py-3 border border-orange-200 text-orange-700 rounded-xl font-medium hover:bg-orange-50 hover:border-orange-300 hover:scale-[1.01] active:scale-[0.99] transition-smooth text-sm"
            >
              Enter Demo Mode
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-smooth">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 COREX Creative Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}

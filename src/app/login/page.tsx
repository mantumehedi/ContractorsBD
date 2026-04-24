'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Key, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setStep('otp');
      setMessage({ type: 'success', text: 'Verification code sent to your email!' });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    } else {
      setMessage({ type: 'success', text: 'Success! Redirecting...' });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1C1E] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            CONTRACTORS<span className="text-[#00FF41]">BD</span>
          </h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
            {step === 'email' ? 'Secure Login / Registration' : 'Enter Verification Code'}
          </p>
        </div>

        <div className="bg-[#2D2F31]/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
          
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            
            {step === 'email' ? (
              <motion.div 
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF41] transition-all"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 block px-1">Verification Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF41] transition-all tracking-[0.5em] font-mono text-center text-xl"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="mt-4 text-[10px] uppercase font-bold text-white/30 hover:text-white/60 transition-colors"
                >
                  Change Email?
                </button>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
                step === 'email' 
                  ? 'bg-[#00FF41] text-black shadow-green-900/20' 
                  : 'bg-blue-600 text-white shadow-blue-900/20'
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {step === 'email' ? 'Send Verification Code' : 'Verify & Enter Dashboard'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-white/20 text-xs font-medium max-w-[280px] mx-auto leading-relaxed">
          Site Managers can log in with their assigned project email to access field tools.
        </div>
      </motion.div>
    </main>
  );
}

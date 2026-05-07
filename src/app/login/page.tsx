'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Key, ArrowRight, Loader2, CheckCircle2, AlertCircle, Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TRANSLATIONS = {
  en: {
    title: 'CONTRACTORS',
    subtitle_email: 'Secure Login / Registration',
    subtitle_otp: 'Enter Verification Code',
    label_email: 'Email Address',
    placeholder_email: 'name@company.com',
    label_otp: 'Verification Code',
    placeholder_otp: 'Enter 6-digit code',
    btn_send_otp: 'Send Verification Code',
    btn_verify: 'Verify & Enter Dashboard',
    change_email: 'Change Email?',
    footer_note: 'Site Managers can log in with their assigned project email to access field tools.',
    otp_sent: 'Verification code sent to your email!',
    success_redirect: 'Success! Redirecting...',
    error_generic: 'Something went wrong. Please try again.',
  },
  bn: {
    title: 'কন্ট্রাক্টরস',
    subtitle_email: 'নিরাপদ লগইন / রেজিস্ট্রেশন',
    subtitle_otp: 'ভেরিফিকেশন কোড দিন',
    label_email: 'Email Address',
    placeholder_email: 'name@company.com',
    label_otp: 'ভেরিফিকেশন কোড',
    placeholder_otp: '6 ডিজিট কোড দিন',
    btn_send_otp: 'ভেরিফিকেশন কোড পাঠান',
    btn_verify: 'ভেরিফাই ও ড্যাশবোর্ড প্রবেশ',
    change_email: 'ইমেইল পরিবর্তন করবেন?',
    footer_note: 'সাইট ম্যানেজাররা তাদের নির্ধারিত প্রজেক্ট ইমেইল দিয়ে লগইন করে ফিল্ড টুলস ব্যবহার করতে পারবেন।',
    otp_sent: 'আপনার ইমেইলে ভেরিফিকেশন কোড পাঠানো হয়েছে!',
    success_redirect: 'সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...',
    error_generic: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।',
  }
};

export default function LoginPage() {
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key];

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_lang') as 'en' | 'bn';
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'bn' : 'en';
    setLang(newLang);
    localStorage.setItem('preferred_lang', newLang);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const devPassword = 'ContractorsBD_Dev_2026';

    // 1. Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: devPassword,
    });

    if (signInError) {
      // 2. If sign in fails, try to sign up (auto-signup)
      if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('User not found')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: devPassword,
        });

        if (signUpError) {
          setMessage({ type: 'error', text: signUpError.message });
          setIsLoading(false);
        } else {
          setMessage({ type: 'success', text: t('success_redirect') });
          setTimeout(() => router.push('/'), 1500);
        }
      } else {
        setMessage({ type: 'error', text: signInError.message });
        setIsLoading(false);
      }
    } else {
      // Success
      setMessage({ type: 'success', text: t('success_redirect') });
      setTimeout(() => router.push('/'), 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

      {/* Language Toggle */}
      <div className="absolute top-8 right-8 z-20">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => {
              setLang('en');
              localStorage.setItem('preferred_lang', 'en');
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => {
              setLang('bn');
              localStorage.setItem('preferred_lang', 'bn');
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'bn' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            বাংলা
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            {t('title')}<span className="text-blue-500">BD</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
            {t('subtitle_email')}
          </p>
        </div>

        <div className="bg-[#1E293B]/50 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl shadow-black/50">
          
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <motion.div 
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-3 block px-1">{t('label_email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input 
                  type="email"
                  required
                  placeholder={t('placeholder_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all text-lg font-medium"
                />
              </div>
            </motion.div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl bg-blue-600 text-white shadow-blue-900/40 hover:bg-blue-500"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {t('btn_verify')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest max-w-[320px] mx-auto leading-relaxed">
          {t('footer_note')}
        </div>
      </motion.div>
    </main>
  );
}


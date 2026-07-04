import React, { useState } from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Mail, UserCheck, Lock, ChevronRight, UserPlus, Info, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function LoginScreen({ onLoginSuccess, onShowToast }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Form inputs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handlePresetLogin = async (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setIsRegister(false);
    
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: presetEmail, password: presetPass })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: `Server returned an invalid response (status ${res.status})` };
      }
      if (res.ok && data.status === 'success') {
        localStorage.setItem('scp_current_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onShowToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        onShowToast(data.error || "Authentication failed.", 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || "An error occurred.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      onShowToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      setLoading(true);
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { email, password, name, phone } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: `Server returned an invalid response (status ${res.status})` };
      }
      if (res.ok && data.status === 'success') {
        localStorage.setItem('scp_current_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onShowToast(
          isRegister 
            ? `Account created! Welcome, ${data.user.name}.` 
            : `Welcome back, ${data.user.name}!`, 
          'success'
        );
      } else {
        onShowToast(data.error || "Authentication failed.", 'error');
      }
    } catch (err: any) {
      onShowToast(err.message || "An error occurred.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800" id="login-layout-container">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl min-h-[550px]">
        
        {/* LEFT BRAND PANEL */}
        <div className="md:col-span-5 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 p-8 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-black tracking-widest text-indigo-200 uppercase">
              <Shield className="w-3.5 h-3.5" />
              Secure Portal
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight leading-none text-white">
                Super Cool <span className="text-indigo-400 block mt-1">HVAC Projects</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs pt-1">
                Enterprise-grade client, site, service job planning and workforce deployment hub.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-8 relative z-10">
            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Default Seed Logins</span>
            <div className="space-y-2 text-xs">
              {/* ADMIN CARD */}
              <button 
                type="button"
                onClick={() => handlePresetLogin('aijaz523@gmail.com', 'admin123')}
                className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white">Aijaz (Admin)</span>
                    <span className="px-1 py-0.5 bg-indigo-500/20 text-indigo-200 text-[8px] font-black uppercase tracking-wider rounded">Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">aijaz523@gmail.com / admin123</p>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-300 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>


            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[10px] text-indigo-300/60 font-medium flex items-center gap-1.5 relative z-10">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            Backed by persistent Neon PostgreSQL
          </div>
        </div>

        {/* RIGHT AUTHFORM PANEL */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isRegister ? 'Create an account' : 'Sign in to your portal'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isRegister 
                  ? 'Join our service enterprise system to access projects and assignments.' 
                  : 'Enter your credentials to manage service jobs and deployment records.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isRegister && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Your Full Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Maya Kapoor"
                          required={isRegister}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-indigo-600 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mobile Phone</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="e.g. +91 90000 00000"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-indigo-600 font-semibold"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. aijaz523@gmail.com"
                    required
                    className="w-full text-xs p-3 pl-11 rounded-xl border border-slate-200 focus:outline-indigo-600 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Secure Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full text-xs p-3 pl-11 rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs rounded-xl tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isRegister ? <UserPlus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {isRegister ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-black cursor-pointer uppercase tracking-wider"
              >
                {isRegister ? 'Already registered? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-semibold leading-tight max-w-sm mx-auto md:mx-0">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            Sign in with the Admin email <strong>aijaz523@gmail.com</strong> to unlock access to all configurations, settings, and user lists.
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import htm from 'htm';
import { Mail, Lock, User, AlertCircle, Brain, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { login, signup } from './db.js';

const html = htm.bind(React.createElement);

export default function AuthForm({ onAuthSuccess, apiFetch }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
  };

  const validate = () => {
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!isLogin) {
      if (!firstName || !lastName) {
        setError('Please fill in your first and last names.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        onAuthSuccess(user);
      } else {
        const user = await signup(firstName, lastName, email, password);
        onAuthSuccess(user);
      }
    } catch (err) {
      console.error("Authentication failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none opacity-40 dark:opacity-20 transition-opacity duration-1000">
        <div className="absolute -top-[10%] -left-[20%] w-[80%] h-[60%] rounded-full bg-gradient-to-br from-emerald-200 to-teal-100 blur-[130px] dark:from-emerald-900/30 dark:to-teal-900/10"></div>
        <div className="absolute bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-100 to-purple-200 blur-[130px] dark:from-indigo-950/20 dark:to-purple-900/20"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">

        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none animate-pulse-subtle">
            <${Brain} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">MindBridge</h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Privacy-First Student Mental Health Tracker</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg py-8 px-6 shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
          
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <${Sparkles} className="w-5 h-5 text-emerald-500" />
              <span>${isLogin ? 'Welcome Back' : 'Create Account'}</span>
            </h2>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
              ${isLogin ? 'Log in to update your wellness and check insights.' : 'Register to start tracking stress, sleep, and anxiety.'}
            </p>
          </div>


          ${error && html`
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3.5 flex items-start gap-2.5 animate-fade-in">
              <${AlertCircle} className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xxs font-semibold text-rose-800 dark:text-rose-400 leading-relaxed">${error}</p>
            </div>
          `}


          <form className="space-y-4" onSubmit=${handleSubmit}>
            
            ${!isLogin && html`
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">First Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <${User} className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value=${firstName}
                      onChange=${e => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <${User} className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value=${lastName}
                      onChange=${e => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            `}

            <div className="space-y-1">
              <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <${Mail} className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value=${email}
                  onChange=${e => setEmail(e.target.value)}
                  placeholder="alex.smith@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <${Lock} className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value=${password}
                  onChange=${e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 placeholder:text-slate-400"
                />
              </div>
            </div>

            ${!isLogin && html`
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <${Lock} className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value=${confirmPassword}
                    onChange=${e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 placeholder:text-slate-400"
                  />
                </div>
              </div>
            `}

            <div className="pt-2">
              <button
                type="submit"
                disabled=${loading}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 shadow-md shadow-emerald-100 dark:shadow-none hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 active:scale-98 disabled:opacity-80 disabled:scale-100 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
              >
                ${loading 
                  ? html`<span>Processing...</span>`
                  : isLogin 
                    ? html`
                        <${LogIn} className="w-4 h-4 text-white" />
                        <span>Sign In</span>
                      `
                    : html`
                        <${UserPlus} className="w-4 h-4 text-white" />
                        <span>Create Account</span>
                      `
                }
              </button>
            </div>

          </form>


          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick=${toggleMode}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-500 transition-colors"
            >
              ${isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

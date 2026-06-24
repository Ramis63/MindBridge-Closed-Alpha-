import React from 'react';
import htm from 'htm';
import { Brain, Calendar, BarChart2, Heart, Moon, Sun, LogOut } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function Header({ activeTab, setActiveTab, theme, toggleTheme, user, onLogout }) {
  const tabs = [
    { id: 'dashboard', label: 'Check-In', icon: Calendar },
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'support', label: 'Wellness', icon: Heart }
  ];

  return html`
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none animate-pulse-subtle">
              <${Brain} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">MindBridge</h1>
              <p className="text-xxs text-slate-400 dark:text-slate-400 font-medium">Student Wellness Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            ${user && html`
              <span className="text-xxs font-bold text-slate-500 dark:text-slate-400 mr-1 hidden xs:inline">
                Hi, ${user.firstName}
              </span>
            `}

            <button 
              onClick=${toggleTheme}
              className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-95 transition-all duration-200"
              aria-label="Toggle Dark Mode"
              id="theme-toggle-btn"
            >
              ${theme === 'light' 
                ? html`<${Moon} className="w-5 h-5 text-indigo-500 animate-spin-slow" />`
                : html`<${Sun} className="w-5 h-5 text-amber-400 animate-spin-slow" />`
              }
            </button>

            ${user && html`
              <button 
                onClick=${onLogout}
                className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all duration-200"
                aria-label="Log Out"
                title="Log Out"
                id="logout-btn"
              >
                <${LogOut} className="w-5 h-5" />
              </button>
            `}
          </div>
        </div>

        <nav className="flex justify-around pb-2 gap-1" aria-label="Main Navigation">
          ${tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return html`
              <button
                key=${tab.id}
                onClick=${() => setActiveTab(tab.id)}
                className="flex-1 py-3 px-2 flex flex-col items-center gap-1.5 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }"
                id="nav-tab-${tab.id}"
              >
                <span className="transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}">
                  <${tab.icon} className="w-5 h-5" />
                </span>
                <span className="text-xs tracking-wide">${tab.label}</span>
                ${isActive && html`
                  <span className="absolute bottom-0 left-4 right-4 h-0.75 bg-emerald-500 dark:bg-emerald-400 rounded-t-full animate-fade-in-width" />
                `}
              </button>
            `;
          })}
        </nav>
      </div>
    </header>
  `;
}

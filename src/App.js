import React, { useState, useEffect } from 'react';
import htm from 'htm';
import Header from './Header.js';
import CheckInForm from './CheckInForm.js';
import AnalyticsCharts from './AnalyticsCharts.js';
import ResourceHub from './ResourceHub.js';
import AuthForm from './AuthForm.js';
import OnboardingWizard from './OnboardingWizard.js';
import { getLogs, upsertLog, getSettings, saveSettings, getCurrentUser, logout } from './db.js';
import { ShieldAlert } from 'lucide-react';

const html = htm.bind(React.createElement);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ theme: 'light', anonymousSharing: false });

  // 1. Initial Load: Load session and fetch user logs/settings if logged in
  useEffect(() => {
    async function loadData() {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        try {
          const logsData = await getLogs();
          const settingsData = await getSettings();
          setLogs(logsData);
          setSettings(settingsData);
        } catch (error) {
          console.error("Failed to load initial data", error);
        }
      }
    }
    loadData();
  }, []);

  // 2. React to theme settings change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // 3. Callback on authentication success
  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    try {
      const logsData = await getLogs();
      const settingsData = await getSettings();
      setLogs(logsData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to load user data on login", error);
    }
  };

  // 4. Callback on log out
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setLogs([]);
    setSettings({ theme: 'light', anonymousSharing: false });
    setActiveTab('dashboard');
  };

  // 5. Callback when settings are modified
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleSettingsChange({ ...settings, theme: newTheme });
  };

  // 6. Callback when a daily log check-in is saved (asynchronous update)
  const handleLogSaved = async (newLog) => {
    const updatedLogs = await upsertLog(newLog);
    setLogs(updatedLogs);
  };

  // RENDER AUTHENTICATION VIEW IF UNLOGGED
  if (!currentUser) {
    return html`
      <${AuthForm} 
        onAuthSuccess=${handleAuthSuccess} 
      />
    `;
  }

  // RENDER ONBOARDING WIZARD IF LOGGED IN BUT NOT ONBOARDED
  if (currentUser && !settings.onboarded) {
    return html`
      <${OnboardingWizard} 
        settings=${settings} 
        onSave=${(newSettings) => handleSettingsChange({ ...newSettings, onboarded: true })}
      />
    `;
  }

  // RENDER MAIN APPLICATION VIEW IF LOGGED IN
  return html`
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      <${Header} 
        activeTab=${activeTab} 
        setActiveTab=${setActiveTab} 
        theme=${settings.theme} 
        toggleTheme=${toggleTheme} 
        user=${currentUser}
        onLogout=${handleLogout}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 pb-20">
        <div className="transition-all duration-300">
          ${activeTab === 'dashboard' && html`
            <${CheckInForm} logs=${logs} onLogSaved=${handleLogSaved} setActiveTab=${setActiveTab} />
          `}

          ${activeTab === 'analytics' && html`
            <${AnalyticsCharts} logs=${logs} />
          `}

          ${activeTab === 'support' && html`
            <${ResourceHub} logs=${logs} settings=${settings} onSettingsChange=${handleSettingsChange} />
          `}
        </div>
      </main>

      <footer className="w-full py-4 text-center border-t border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md text-xxs text-slate-400 dark:text-slate-500 font-semibold flex items-center justify-center gap-1.5 transition-colors duration-300">
        <${ShieldAlert} className="w-3.5 h-3.5 text-emerald-500/80 dark:text-emerald-400/80 shrink-0" />
        <span>MindBridge is 100% Client-Side. Your records are encrypted locally in your browser.</span>
      </footer>

    </div>
  `;
}

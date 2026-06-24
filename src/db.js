const SESSION_KEY = 'mindbridge_session';

const DEFAULT_SETTINGS = {
  theme: 'light',
  anonymousSharing: false,
  onboarded: false,
  goals: [],
  reminderTime: 'evening'
};

// Helper to retrieve current authenticated user
export function getCurrentUser() {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
}

// Helper to determine localized storage keys for active user
function getLogsKey() {
  const user = getCurrentUser();
  const suffix = user ? user.email.replace(/[@.]/g, '_') : 'anonymous';
  return `mindbridge_logs_${suffix}`;
}

function getSettingsKey() {
  const user = getCurrentUser();
  const suffix = user ? user.email.replace(/[@.]/g, '_') : 'anonymous';
  return `mindbridge_settings_${suffix}`;
}

// API Fetch Helper with automatic header injection
async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Inject active user identification header
  const user = getCurrentUser();
  if (user && user.email) {
    headers['X-User-Email'] = user.email;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// Authentication API: Sign Up
export async function signup(firstName, lastName, email, password) {
  const data = await apiFetch('/api/create-profile', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password })
  });
  
  if (data && data.user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  }
  throw new Error('Registration failed. Empty response.');
}

// Authentication API: Log In
export async function login(email, password) {
  const data = await apiFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (data && data.user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  }
  throw new Error('Login failed. Empty response.');
}

// Authentication: Log Out
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  console.log("User session cleared.");
}

// Retrieve all logs (asynchronous with cache fallback)
export async function getLogs() {
  try {
    const logs = await apiFetch('/api/logs');
    // Cache the fresh server logs under user space
    localStorage.setItem(getLogsKey(), JSON.stringify(logs));
    return logs;
  } catch (error) {
    console.warn("Backend database offline. Falling back to browser local cache.", error);
    const localData = localStorage.getItem(getLogsKey());
    if (!localData) {
      return [];
    }
    const logs = JSON.parse(localData);
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

// Retrieve settings (asynchronous with cache fallback)
export async function getSettings() {
  try {
    const settings = await apiFetch('/api/settings');
    localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
    return settings;
  } catch (error) {
    console.warn("Backend settings offline. Using local cache settings.", error);
    const localData = localStorage.getItem(getSettingsKey());
    return localData ? { ...DEFAULT_SETTINGS, ...JSON.parse(localData) } : DEFAULT_SETTINGS;
  }
}

// Save settings (asynchronous with cache mirror)
export async function saveSettings(settings) {
  // 1. Update local cache immediately
  localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
  
  // 2. Synchronize to SQLite server
  try {
    await apiFetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
    console.log("Settings synced to SQLite backend database.");
  } catch (error) {
    console.warn("Failed to sync settings to SQLite backend database.", error);
  }
}

// Add or update a single log entry (asynchronous with cache mirror)
export async function upsertLog(entry) {
  // 1. Update local storage first for instant feedback
  const localLogsKey = getLogsKey();
  const localData = localStorage.getItem(localLogsKey);
  const logs = localData ? JSON.parse(localData) : [];
  const index = logs.findIndex(log => log.date === entry.date);
  
  if (index !== -1) {
    logs[index] = { ...logs[index], ...entry };
  } else {
    logs.push(entry);
  }
  localStorage.setItem(localLogsKey, JSON.stringify(logs));
  
  // 2. Post update to SQLite backend
  try {
    await apiFetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    console.log("Log saved to SQLite database:", entry.date);
  } catch (error) {
    console.warn("Failed to sync log to SQLite backend. Retained locally.", error);
  }
  
  return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Zap, Moon, AlertTriangle, CheckCircle, Calendar, Hash, Save, X, Sparkles, Smile, ArrowRight } from 'lucide-react';

const html = htm.bind(React.createElement);

const MOODS = [
  { value: 1, label: 'Awful', emoji: '😭', activeColor: 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none scale-110', hoverColor: 'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 border-rose-200 dark:border-rose-900/40' },
  { value: 2, label: 'Bad', emoji: '😢', activeColor: 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none scale-110', hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-500 border-orange-200 dark:border-orange-900/40' },
  { value: 3, label: 'Okay', emoji: '😐', activeColor: 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none scale-110', hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 border-amber-200 dark:border-amber-900/40' },
  { value: 4, label: 'Good', emoji: '🙂', activeColor: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none scale-110', hoverColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-500 border-emerald-200 dark:border-emerald-900/40' },
  { value: 5, label: 'Rad', emoji: '😆', activeColor: 'bg-teal-500 text-white shadow-lg shadow-teal-200 dark:shadow-none scale-110', hoverColor: 'hover:bg-teal-50 dark:hover:bg-teal-950/20 text-teal-500 border-teal-200 dark:border-teal-900/40' }
];

const POPULAR_TAGS = ['#Exam', '#Social', '#SleepDeprived', '#RestDay', '#Exercise', '#LabWork', '#Caffeine', '#FamilyTime', '#PartTimeJob'];

export default function CheckInForm({ logs, onLogSaved, setActiveTab }) {
  const getLocalDateString = (d) => {
    return d.toLocaleDateString('sv-SE'); 
  };

  const todayStr = getLocalDateString(new Date());

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [date, setDate] = useState(todayStr);
  const [mood, setMood] = useState(4); 
  const [energy, setEnergy] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [stress, setStress] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if today has a logged entry to show on the dashboard summary card
  const todayLog = logs.find(log => log.date === todayStr);

  useEffect(() => {
    const existingLog = logs.find(log => log.date === date);
    if (existingLog) {
      setMood(existingLog.mood);
      setEnergy(existingLog.energy);
      setSleepHours(existingLog.sleepHours);
      setSleepQuality(existingLog.sleepQuality);
      setStress(existingLog.stress);
      setNotes(existingLog.notes || '');
      setSelectedTags(existingLog.tags || []);
      setIsUpdating(true);
    } else {
      setMood(4);
      setEnergy(3);
      setSleepHours(7);
      setSleepQuality('Good');
      setStress(2);
      setNotes('');
      setSelectedTags([]);
      setIsUpdating(false);
    }
  }, [date, logs]);

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLog = {
      date,
      mood,
      energy,
      sleepHours: parseFloat(sleepHours),
      sleepQuality,
      stress: parseInt(stress),
      notes,
      tags: selectedTags
    };

    onLogSaved(newLog);
    setShowModal(false);
    setShowSuccessModal(true);
  };

  const formatDateDisplay = (dateStr) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const parsedDate = new Date(dateStr + 'T00:00:00'); 
    return parsedDate.toLocaleDateString('en-US', options);
  };

  // Generate customized feedback for success screen
  const getSuccessFeedback = () => {
    if (stress >= 4) {
      return {
        title: 'Calming Practices Recommended',
        desc: 'We noticed your stress is quite high today. We highly recommend taking a 5-minute break to try the Box Breathing exercise.',
        actionText: 'Go to Breathing Pacer',
        targetTab: 'support'
      };
    }
    if (sleepHours < 6.0) {
      return {
        title: 'Sleep Focus Recommended',
        desc: 'You logged less than 6 hours of sleep. Try enabling a Screen-Free Wind Down 30 minutes before bed tonight to recover.',
        actionText: 'View Sleep Practices',
        targetTab: 'support'
      };
    }
    return {
      title: 'Log Recorded!',
      desc: 'Your daily check-in has been successfully synced and encrypted in your local SQLite database.',
      actionText: 'View Wellness Analytics',
      targetTab: 'analytics'
    };
  };

  const feedback = getSuccessFeedback();

  return html`
    <div className="space-y-6">
      
      <!-- 1. DASHBOARD STATUS CARD -->
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-100/50 dark:shadow-none transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[20%] w-[50%] h-[80%] rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 blur-3xl"></div>
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Today's Check-in</h2>
              <p className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${formatDateDisplay(todayStr)}</p>
            </div>
            <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400">
              <${Calendar} className="w-5 h-5" />
            </span>
          </div>

          ${todayLog ? html`
            <!-- Logged state -->
            <div className="p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 bg-emerald-50/20 dark:bg-emerald-950/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">${MOODS.find(m => m.value === todayLog.mood)?.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Mood: ${MOODS.find(m => m.value === todayLog.mood)?.label}</p>
                    <p className="text-xxs text-slate-400 dark:text-slate-500">Sleep: ${todayLog.sleepHours} hrs | Stress: ${todayLog.stress}/5</p>
                  </div>
                </div>
              </div>
              <span className="text-xxxs font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tracking-wider">Completed</span>
            </div>
          ` : html`
            <!-- Empty state -->
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 flex items-center gap-3.5">
              <span className="text-2xl select-none filter grayscale opacity-45">😐</span>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No log recorded yet</p>
                <p className="text-xxs text-slate-400 dark:text-slate-500">Take 30 seconds to reflect and track your stress, mood, and sleep.</p>
              </div>
            </div>
          `}

          <button
            onClick=${() => { setDate(todayStr); setShowModal(true); }}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 shadow-lg shadow-emerald-100 dark:shadow-none hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>${todayLog ? 'Update Today\'s Entry' : 'Start Daily Check-In'}</span>
            <${ArrowRight} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 2. CHECK-IN FORM MODAL OVERLAY -->
      ${showModal && html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-5 relative space-y-5 animate-scale-in">
            
            <!-- Close header -->
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Daily Wellness Log</h3>
              </div>
              <button
                onClick=${() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition"
                aria-label="Close modal"
              >
                <${X} className="w-4 h-4" />
              </button>
            </div>

            <!-- Date Picker Card -->
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500"><${Calendar} className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Log Date</p>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-semibold">${formatDateDisplay(date)}</p>
                </div>
              </div>
              <input
                type="date"
                value=${date}
                onChange=${(e) => setDate(e.target.value)}
                max=${todayStr}
                className="px-2.5 py-1.5 rounded-lg text-xxs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>

            ${isUpdating && html`
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-3 flex items-start gap-2.5">
                <${AlertTriangle} className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xxs font-semibold text-amber-800 dark:text-amber-400 leading-relaxed">
                  Editing mode: Saving will overwrite your existing log for ${date}.
                </p>
              </div>
            `}

            <!-- Form -->
            <form onSubmit=${handleSubmit} className="space-y-4">
              
              <!-- Mood -->
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>How is your mood?</span>
                  <span className="text-xxs font-extrabold text-emerald-500 dark:text-emerald-400 tracking-wider">
                    ${MOODS.find(m => m.value === mood)?.label}
                  </span>
                </label>
                <div className="flex justify-between gap-1 pt-0.5">
                  ${MOODS.map(m => {
                    const isActive = mood === m.value;
                    return html`
                      <button
                        key=${m.value}
                        type="button"
                        onClick=${() => setMood(m.value)}
                        className="flex-1 flex flex-col items-center py-2 rounded-lg transition-all duration-200 border border-transparent ${
                          isActive 
                            ? m.activeColor 
                            : `border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 ${m.hoverColor}`
                        }"
                      >
                        <span className="text-xl mb-0.5 select-none transition-transform hover:scale-120">${m.emoji}</span>
                        <span className="text-xxxs font-extrabold uppercase tracking-wider">${m.label}</span>
                      </button>
                    `;
                  })}
                </div>
              </div>

              <!-- Energy & Sleep -->
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Energy -->
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Energy</span>
                    <span className="text-xxs font-bold text-amber-500">
                      ${energy === 1 ? 'Exhaust' : energy === 2 ? 'Low' : energy === 3 ? 'Avg' : energy === 4 ? 'High' : 'Full'}
                    </span>
                  </label>
                  <div className="flex gap-1">
                    ${[1, 2, 3, 4, 5].map(level => {
                      const isActive = level <= energy;
                      return html`
                        <button
                          key=${level}
                          type="button"
                          onClick=${() => setEnergy(level)}
                          className="flex-1 h-9 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/40'
                              : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600'
                          }"
                        >
                          <${Zap} className="w-4 h-4 mx-auto ${isActive ? 'fill-amber-400 text-amber-500' : ''}" />
                        </button>
                      `;
                    })}
                  </div>
                </div>

                <!-- Sleep -->
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Sleep Duration</span>
                    <span className="text-xxs font-extrabold text-indigo-500 flex items-center gap-0.5">
                      <${Moon} className="w-3 h-3" />
                      <span>${sleepHours} hrs</span>
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value=${sleepHours}
                    onChange=${e => setSleepHours(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded appearance-none accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xxxs text-slate-400 font-bold">
                    <span>0h</span>
                    <span>8h (ideal)</span>
                    <span>16h</span>
                  </div>
                </div>

              </div>

              <!-- Sleep Quality & Stress -->
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Sleep Quality -->
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">Sleep Quality</label>
                  <div className="flex gap-1.5">
                    ${['Poor', 'Fair', 'Good'].map(quality => {
                      const isActive = sleepQuality === quality;
                      let activeStyle = '';
                      if (isActive) {
                        if (quality === 'Poor') activeStyle = 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/40';
                        if (quality === 'Fair') activeStyle = 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40';
                        if (quality === 'Good') activeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40';
                      }
                      return html`
                        <button
                          key=${quality}
                          type="button"
                          onClick=${() => setSleepQuality(quality)}
                          className="flex-1 py-1.5 rounded-lg border text-xxs font-semibold transition ${
                            isActive ? activeStyle : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400'
                          }"
                        >
                          ${quality}
                        </button>
                      `;
                    })}
                  </div>
                </div>

                <!-- Stress -->
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Stress Level</span>
                    <span className="text-xxs font-extrabold text-rose-500">Level ${stress}/5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value=${stress}
                    onChange=${e => setStress(parseInt(e.target.value))}
                    className="w-full h-1 rounded appearance-none cursor-pointer accent-rose-500 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                  />
                  <div className="flex justify-between text-xxxs text-slate-400 font-bold">
                    <span>1 (Calm)</span>
                    <span>3</span>
                    <span>5 (Burnout)</span>
                  </div>
                </div>

              </div>

              <!-- Notes & Tags -->
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <${Hash} className="w-4 h-4 text-emerald-500" />
                  <span>Notes & Tags</span>
                </label>
                <textarea
                  value=${notes}
                  onChange=${e => setNotes(e.target.value)}
                  placeholder="Notes about your lectures, stress triggers, or thoughts..."
                  className="w-full h-16 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 text-xxs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none placeholder:text-slate-400 resize-none"
                />
                <div className="space-y-1.5">
                  <p className="text-xxxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Add Tags</p>
                  <div className="flex flex-wrap gap-1">
                    ${POPULAR_TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return html`
                        <button
                          key=${tag}
                          type="button"
                          onClick=${() => handleTagToggle(tag)}
                          className="py-0.5 px-2 rounded-md text-xxxs font-bold border transition ${
                            isSelected 
                              ? 'bg-emerald-500 text-white border-transparent' 
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400'
                          }"
                        >
                          ${tag}
                        </button>
                      `;
                    })}
                  </div>
                </div>
              </div>

              <!-- Save button -->
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-1.5"
                >
                  <${Save} className="w-4 h-4 text-white" />
                  <span>${isUpdating ? 'Update Wellness Record' : 'Save Wellness Record'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      `}

      <!-- 3. SUCCESS SCREEN OVERLAY -->
      ${showSuccessModal && html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative text-center space-y-5 animate-scale-in">
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-100/50 dark:shadow-none">
                <${CheckCircle} className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight mt-1">Wellness Log Saved</h3>
              <p className="text-xxs font-medium text-slate-400 dark:text-slate-500">Your metrics are locked and encrypted locally.</p>
            </div>

            <!-- Recommendation Box -->
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-left space-y-2">
              <h4 className="text-xxs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <${Sparkles} className="w-3.5 h-3.5" />
                <span>${feedback.title}</span>
              </h4>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                ${feedback.desc}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick=${() => {
                  setShowSuccessModal(false);
                  setActiveTab(feedback.targetTab);
                }}
                className="w-full py-3 px-6 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 hover:from-emerald-600 hover:to-teal-700 transition"
              >
                ${feedback.actionText}
              </button>

              <button
                onClick=${() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-6 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      `}

    </div>
  `;
}

import React, { useState, useMemo, useEffect } from 'react';
import htm from 'htm';
import { ShieldCheck, Phone, Mail, Link, AlertTriangle, Sparkles, BookOpen, Clock, Heart, ToggleLeft, ToggleRight, Check, X, ShieldAlert, Calendar } from 'lucide-react';

const html = htm.bind(React.createElement);

// Self-care tip database
const SELF_CARE_TIPS = {
  burnout: [
    { title: 'Box Breathing (4-4-4-4)', desc: 'Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat 4 times to instantly soothe your nervous system.', duration: '5 mins', type: 'breathing' },
    { title: 'Digital Fasting', desc: 'Step away from social media, exams, and emails for the next 1 hour. Let your eyes and brain rest from light and notification stimulation.', duration: '1 hour', type: 'timer' },
    { title: 'Progressive Muscle Relaxation', desc: 'Tense each muscle group (shoulders, arms, legs) for 5 seconds, then release. Notice the physical sensation of stress leaving your body.', duration: '10 mins', type: 'timer' }
  ],
  sleep: [
    { title: 'Screen-Free Wind Down', desc: 'Avoid phones, tablets, or laptops for 30 minutes before bed. Blue light blocks melatonin, making sleep light and restless.', duration: '30 mins', type: 'timer' },
    { title: 'No Caffeine After 2 PM', desc: 'Caffeine has a half-life of 6 hours. Switch to herbal tea (chamomile or peppermint) in the afternoon to sleep deeper.', duration: 'Instant', type: 'tip' },
    { title: 'Cool & Dark Sleep Sanctuary', desc: 'Lower your room temperature slightly and cover any blinking LEDs. A cool, dark room tells your brain it is time for deep recovery.', duration: '5 mins', type: 'tip' }
  ],
  general: [
    { title: '15-Minute Campus Walk', desc: 'Step outside and walk around green campus spaces without looking at your phone. Fresh air and light exercise clear mental cobwebs.', duration: '15 mins', type: 'timer' },
    { title: 'Gratitude Reflection', desc: 'Write down three small things that went well today (even as simple as a nice coffee or a seat on the bus). Focuses your brain on positive rewards.', duration: '3 mins', type: 'timer' },
    { title: 'Reframe Negative Thoughts', desc: 'Is this exam a threat, or a challenge? Reframing stress as energy to help you succeed reduces the physical toll of anxiety.', duration: '5 mins', type: 'tip' }
  ]
};

export default function ResourceHub({ logs, settings, onSettingsChange }) {
  const latestLog = logs[0]; 

  const activeCategory = useMemo(() => {
    if (!latestLog) return 'general';
    if (latestLog.stress >= 4) return 'burnout';
    if (latestLog.sleepHours < 6.0) return 'sleep';
    return 'general';
  }, [latestLog]);

  const tipsToDisplay = SELF_CARE_TIPS[activeCategory];

  const handleSharingToggle = () => {
    onSettingsChange({
      ...settings,
      anonymousSharing: !settings.anonymousSharing
    });
  };

  // State for Suggested Tip Modal
  const [selectedTip, setSelectedTip] = useState(null);
  
  // Breathing Timer state
  const [pacerState, setPacerState] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [pacerCount, setPacerCount] = useState(4);
  const [sessionTimer, setSessionTimer] = useState(120); // 2 minutes practice
  const [isPacerActive, setIsPacerActive] = useState(false);

  // General Timer state
  const [generalTimer, setGeneralTimer] = useState(60);
  const [isGeneralTimerActive, setIsGeneralTimerActive] = useState(false);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:30 AM - 11:30 AM');
  const [bookingFocus, setBookingFocus] = useState('Stress/Anxiety Management');
  const [bookingCounselor, setBookingCounselor] = useState('Dr. Sarah Jenkins');
  const [bookingRef, setBookingRef] = useState(null);

  // 1. BREATH PACER CYCLE EFFECT
  useEffect(() => {
    let interval = null;
    if (isPacerActive && selectedTip && selectedTip.type === 'breathing') {
      interval = setInterval(() => {
        setPacerCount((prev) => {
          if (prev <= 1) {
            // Cycle breathing state
            setPacerState((state) => {
              if (state === 'Inhale') return 'Hold (Full)';
              if (state === 'Hold (Full)') return 'Exhale';
              if (state === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4; // Reset to 4s
          }
          return prev - 1;
        });

        // Reduce total session time
        setSessionTimer((time) => {
          if (time <= 1) {
            setIsPacerActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPacerActive, selectedTip]);

  // 2. GENERAL TIMER EFFECT
  useEffect(() => {
    let interval = null;
    if (isGeneralTimerActive && selectedTip && selectedTip.type === 'timer') {
      interval = setInterval(() => {
        setGeneralTimer((time) => {
          if (time <= 1) {
            setIsGeneralTimerActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGeneralTimerActive, selectedTip]);

  const handleStartPacer = () => {
    setIsPacerActive(true);
    setPacerState('Inhale');
    setPacerCount(4);
    setSessionTimer(120);
  };

  const handleStartGeneralTimer = (durationStr) => {
    const mins = parseInt(durationStr) || 5;
    setGeneralTimer(mins * 60);
    setIsGeneralTimerActive(true);
  };

  const handleTipClose = () => {
    setSelectedTip(null);
    setIsPacerActive(false);
    setIsGeneralTimerActive(false);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      alert("Please select a date.");
      return;
    }
    const randId = Math.floor(1000 + Math.random() * 9000);
    setBookingRef(`MB-${randId}-${bookingDate.replace(/-/g, '')}`);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
    setBookingRef(null);
    setBookingDate('');
  };

  return html`
    <div className="space-y-6">
      
      <!-- Privacy Toggle Card -->
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all duration-300 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <${ShieldCheck} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Privacy & Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your data remains in your control, always.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label htmlFor="sharing-toggle-btn" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                Anonymous Campus Data Sharing
              </label>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                Contribute your de-identified, aggregated mental health metrics to help university wellness officers improve campus support resources.
              </p>
            </div>
            
            <button
              onClick=${handleSharingToggle}
              className="focus:outline-none shrink-0 transition-transform active:scale-95"
              id="sharing-toggle-btn"
              aria-label="Toggle anonymous campus data sharing"
            >
              ${settings.anonymousSharing 
                ? html`<${ToggleRight} className="w-12 h-8 text-emerald-500" />`
                : html`<${ToggleLeft} className="w-12 h-8 text-slate-300 dark:text-slate-600" />`
              }
            </button>
          </div>

          ${settings.anonymousSharing ? html`
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3 flex items-start gap-2.5 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xxs">
                <${Check} className="w-3.5 h-3.5" />
              </div>
              <p className="text-xxs text-emerald-800 dark:text-emerald-400 leading-relaxed font-semibold">
                Sharing Enabled: Your aggregated, de-identified data is helping improve university-wide wellness initiatives.
              </p>
            </div>
          ` : html`
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 flex items-start gap-2 text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">Local Only Storage:</span>
              <span>All logs are strictly saved in your browser's localStorage. No tracking, no external databases, and zero data leaves your device.</span>
            </div>
          `}
        </div>
      </div>

      <!-- Wellness Suggestions Card -->
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <${Sparkles} className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Smart Wellness Suggestions</h2>
          </div>
          <span className="text-xxs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            Based on Latest Log
          </span>
        </div>

        <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800/60 pb-3 font-medium">
          ${activeCategory === 'burnout' && '⚠️ We noticed elevated stress levels. We highly recommend these stress and burnout-prevention practices:'}
          ${activeCategory === 'sleep' && '😴 Sleep duration was lower than normal. Try these tips to improve sleep depth and quality:'}
          ${activeCategory === 'general' && '✨ You seem to have a stable balance. Keep building healthy habits with these practices:'}
        </p>

        <div className="space-y-3.5 pt-1">
          ${tipsToDisplay.map((tip, idx) => html`
            <div 
              key=${idx} 
              onClick=${() => {
                setSelectedTip(tip);
                if (tip.type === 'timer') {
                  setGeneralTimer((parseInt(tip.duration) || 5) * 60);
                }
              }}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>${tip.title}</span>
                </h3>
                <span className="text-xxs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <${Clock} className="w-3.5 h-3.5" />
                  <span>${tip.duration}</span>
                </span>
              </div>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
                ${tip.desc}
              </p>
              ${tip.type !== 'tip' && html`
                <div className="pt-1 flex items-center gap-1 text-xxxs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                  <span>Start Practice</span>
                  <span>→</span>
                </div>
              `}
            </div>
          `)}
        </div>
      </div>

      <!-- Campus Directory Card -->
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all duration-300 space-y-4">
        <div className="flex items-center gap-2">
          <${BookOpen} className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Campus Support Directory</h2>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/30 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white">University Psychological Counseling</h3>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Free professional mental health consultations for all enrolled university students.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xxs font-bold">
              <a 
                href="mailto:counseling@university.edu" 
                className="flex items-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-800/60 transition"
              >
                <${Mail} className="w-4 h-4 text-emerald-500" />
                <span>counseling@university.edu</span>
              </a>
              <a 
                href="tel:+15550198234" 
                className="flex items-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-800/60 transition"
              >
                <${Phone} className="w-4 h-4 text-emerald-500" />
                <span>+1 (555) 019-8234</span>
              </a>
            </div>
            <button
              onClick=${() => setShowBookingModal(true)}
              className="inline-flex items-center gap-1 text-xxs font-bold text-indigo-500 hover:text-indigo-600 transition"
            >
              <${Link} className="w-3.5 h-3.5" />
              <span>Book Appointment Online</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/30 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white">Student Union Welfare Officer</h3>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Drop in for academic assistance, hardship support, housing issues, and welfare inquiries.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 text-xxs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <${Mail} className="w-3.5 h-3.5 text-slate-400" />
                <span>welfare.officer@studentunion.org</span>
              </span>
              <span>Student Center, Room 302</span>
            </div>
          </div>

          <!-- Emergency Crisis Card -->
          <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>24/7 Student Crisis Hotline</span>
              </h3>
              <p className="text-xxs text-rose-700/80 dark:text-rose-400/80 leading-relaxed max-w-sm">
                If you are experiencing a mental health emergency, please reach out. Safe, confidential, and completely free.
              </p>
            </div>
            <div className="flex gap-2 font-bold text-xs">
              <a 
                href="tel:988" 
                className="flex-1 sm:flex-none text-center text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl transition"
              >
                Call 988
              </a>
              <button 
                onClick=${() => { alert("Simulating Crisis SMS: Sent 'HOME' to 741741. A welfare counselor will connect shortly."); }} 
                className="flex-1 sm:flex-none text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 px-4 py-2 rounded-xl transition"
              >
                Text HOME
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- A. SUGGESTED ACTIVITY DETAILS / PACER OVERLAY -->
      ${selectedTip && html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md shadow-2xl p-6 relative space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white tracking-tight flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Self-Care Practice</span>
              </h3>
              <button
                onClick=${handleTipClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition"
              >
                <${X} className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">${selectedTip.title}</h4>
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-4">
                ${selectedTip.desc}
              </p>
            </div>

            <!-- BREATH PACER MOCK MODAL -->
            ${selectedTip.type === 'breathing' && html`
              <div className="py-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-6">
                
                <!-- Expanding breathing circle -->
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div 
                    className="absolute rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 transition-all duration-1000 ease-in-out border border-emerald-500/20"
                    style=${{
                      width: pacerState === 'Inhale' || pacerState === 'Hold (Full)' ? '100%' : '50%',
                      height: pacerState === 'Inhale' || pacerState === 'Hold (Full)' ? '100%' : '50%',
                      boxShadow: pacerState === 'Hold (Full)' ? '0 0 30px rgba(16,185,129,0.3)' : 'none'
                    }}
                  ></div>
                  <div 
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex flex-col items-center justify-center font-bold text-center select-none shadow-lg shadow-emerald-100 transition-all duration-1000 ease-in-out"
                    style=${{
                      transform: pacerState === 'Inhale' || pacerState === 'Hold (Full)' ? 'scale(1.15)' : 'scale(0.85)'
                    }}
                  >
                    <span className="text-xxs uppercase tracking-wider">${pacerState}</span>
                    <span className="text-lg mt-0.5">${pacerCount}s</span>
                  </div>
                </div>

                <div className="space-y-3 w-full px-6 text-center">
                  <div className="text-xxxs font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-center gap-1.5">
                    <${Clock} className="w-3.5 h-3.5" />
                    <span>Practice Timer: ${Math.floor(sessionTimer / 60)}:${String(sessionTimer % 60).padStart(2, '0')}</span>
                  </div>

                  <button
                    onClick=${isPacerActive ? () => setIsPacerActive(false) : handleStartPacer}
                    className="py-2.5 px-6 rounded-xl font-bold text-white text-xs bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 active:scale-98 transition shadow-sm w-36 mx-auto"
                  >
                    ${isPacerActive ? 'Pause Session' : 'Start Session'}
                  </button>
                </div>
              </div>
            `}

            <!-- GENERAL COUNTDOWN TIMER -->
            ${selectedTip.type === 'timer' && html`
              <div className="py-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-4">
                
                <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  ${Math.floor(generalTimer / 60)}:${String(generalTimer % 60).padStart(2, '0')}
                </div>
                <p className="text-xxxs font-bold text-slate-400 uppercase tracking-wider">Take this time to disconnect and practice</p>

                <div className="flex gap-2">
                  <button
                    onClick=${() => handleStartGeneralTimer(selectedTip.duration)}
                    className="py-2 px-4 rounded-xl font-bold text-white bg-slate-800 dark:bg-slate-700 text-xxs transition hover:bg-slate-900"
                  >
                    Reset Timer
                  </button>
                  <button
                    onClick=${() => setIsGeneralTimerActive(!isGeneralTimerActive)}
                    className="py-2 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xxs transition hover:bg-slate-50"
                  >
                    ${isGeneralTimerActive ? 'Pause' : 'Start'}
                  </button>
                </div>
              </div>
            `}

            <!-- FOOTER COMPLETED BUTTON -->
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick=${handleTipClose}
                className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xxs font-bold transition"
              >
                Close
              </button>

              <button
                onClick=${() => {
                  alert("Awesome! You completed your practice. Well done!");
                  handleTipClose();
                }}
                className="py-2.5 px-5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 text-xxs font-bold transition shadow-sm hover:from-emerald-600 hover:to-teal-700"
              >
                Practice Completed
              </button>
            </div>

          </div>
        </div>
      `}

      <!-- B. CAMPUS SCHEDULER OVERLAY MODAL -->
      ${showBookingModal && html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl w-full max-w-md shadow-2xl p-6 relative space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-855 dark:text-white tracking-tight flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500"><${Calendar} className="w-4 h-4" /></span>
                <span>Counseling Scheduler</span>
              </h3>
              <button
                onClick=${handleBookingClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition"
              >
                <${X} className="w-4 h-4" />
              </button>
            </div>

            ${bookingRef ? html`
              <!-- Confirmation Card -->
              <div className="text-center space-y-5 py-4 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
                  <${Check} className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Appointment Confirmed!</h4>
                  <p className="text-xxs text-slate-400 dark:text-slate-500">Your mock slot is locked in. Details sent to student email.</p>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-50 dark:border-indigo-900/30 bg-indigo-50/25 dark:bg-indigo-950/5 text-left text-xxs space-y-2.5 font-semibold">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Reference ID:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">${bookingRef}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Advisor:</span>
                    <span className="text-slate-700 dark:text-slate-300">${bookingCounselor}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Date/Time:</span>
                    <span className="text-slate-700 dark:text-slate-300">${bookingDate} @ ${bookingTime.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-700 dark:text-slate-300">Room 302, Student Center</span>
                  </div>
                </div>

                <button
                  onClick=${handleBookingClose}
                  className="w-full py-3 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 transition"
                >
                  Close Scheduler
                </button>
              </div>
            ` : html`
              <!-- Booking Form -->
              <form onSubmit=${handleBookAppointment} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <!-- Date -->
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      required
                      min=${getLocalDateString(new Date())}
                      value=${bookingDate}
                      onChange=${e => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 text-xxs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none"
                    />
                  </div>
                  
                  <!-- Time Slots -->
                  <div className="space-y-1">
                    <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time Slot</label>
                    <select
                      value=${bookingTime}
                      onChange=${e => setBookingTime(e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xxs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none"
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                      <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                      <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                      <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    </select>
                  </div>
                </div>

                <!-- Counselors -->
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Counselor / Advisor</label>
                  <select
                    value=${bookingCounselor}
                    onChange=${e => setBookingCounselor(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xxs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none"
                  >
                    <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Psychologist)</option>
                    <option value="Dr. Aaron Reynolds">Dr. Aaron Reynolds (Cognitive Therapist)</option>
                    <option value="Welfare Officer">Student Welfare Advisor</option>
                  </select>
                </div>

                <!-- Counseling Focus -->
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Session Focus</label>
                  <select
                    value=${bookingFocus}
                    onChange=${e => setBookingFocus(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-xxs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none"
                  >
                    <option value="Stress/Anxiety Management">Academic Stress & Anxiety</option>
                    <option value="Sleep/Insomnia Counseling">Sleep & Burnout Prevention</option>
                    <option value="Personal Well-Being">Personal & Emotional Counseling</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl font-bold text-white text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 shadow-md shadow-indigo-100 dark:shadow-none transition flex items-center justify-center gap-1.5"
                  >
                    <${Calendar} className="w-4 h-4 text-white" />
                    <span>Confirm Mock Appointment</span>
                  </button>
                </div>

              </form>
            `}
          </div>
        </div>
      `}

    </div>
  `;
}

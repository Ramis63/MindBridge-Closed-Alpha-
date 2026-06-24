import React, { useState } from 'react';
import htm from 'htm';
import { Sparkles, Brain, Check, ShieldAlert, ArrowRight, ArrowLeft, Sun, Moon, ToggleLeft, ToggleRight } from 'lucide-react';

const html = htm.bind(React.createElement);

const GOALS = [
  { id: 'stress', title: 'Stress Management', desc: 'Prevent academic burnout & manage exams.', emoji: '🧘‍♀️' },
  { id: 'sleep', title: 'Sleep Optimization', desc: 'Improve rest hours & wind-down habits.', emoji: '😴' },
  { id: 'energy', title: 'Energy & Mood Balance', desc: 'Track daily fatigue & emotional shifts.', emoji: '⚡' },
  { id: 'academic', title: 'Academic Balance', desc: 'Manage lecture workloads & study blocks.', emoji: '🎯' }
];

const REMINDERS = [
  { id: 'morning', title: 'Morning Check-In', desc: 'Log right after waking up to start your day.', emoji: '🌅' },
  { id: 'evening', title: 'Evening Reflection', desc: 'Recap sleep quality & daily stress before bed.', emoji: '🌌' },
  { id: 'self-paced', title: 'Self-Paced Logging', desc: 'Log manually without any schedule reminders.', emoji: '📴' }
];

export default function OnboardingWizard({ settings, onSave }) {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [reminder, setReminder] = useState('evening');
  const [theme, setTheme] = useState(settings.theme || 'light');
  const [sharing, setSharing] = useState(settings.anonymousSharing || false);

  const handleGoalToggle = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleSave = () => {
    onSave({
      theme,
      anonymousSharing: sharing,
      goals: selectedGoals,
      reminderTime: reminder
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return html`
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      
      <!-- Calming background bubbles -->
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none opacity-40 dark:opacity-20 transition-opacity duration-1000">
        <div className="absolute -top-[10%] -left-[20%] w-[80%] h-[60%] rounded-full bg-gradient-to-br from-emerald-200 to-teal-100 blur-[130px] dark:from-emerald-900/30 dark:to-teal-900/10"></div>
        <div className="absolute bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-100 to-purple-200 blur-[130px] dark:from-indigo-950/20 dark:to-purple-900/20"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <!-- Brand identity -->
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none animate-pulse-subtle">
            <${Brain} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Setup Preferences</h1>
            <p className="text-xxs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Step ${step} of 3</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg py-8 px-6 shadow-xl border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
          
          <!-- Progress bar -->
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1 rounded-full transition-all duration-500" 
              style=${{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <!-- STEP 1: GOALS -->
          ${step === 1 && html`
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <${Sparkles} className="w-4 h-4 text-emerald-500" />
                  <span>Choose your primary focus</span>
                </h2>
                <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-0.5">
                  Select one or more wellness topics you want to keep track of.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                ${GOALS.map(goal => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return html`
                    <button
                      key=${goal.id}
                      onClick=${() => handleGoalToggle(goal.id)}
                      className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }"
                    >
                      <span className="text-xl filter drop-shadow-sm select-none shrink-0">${goal.emoji}</span>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">${goal.title}</p>
                        <p className="text-xxs text-slate-400 dark:text-slate-500 leading-normal">${goal.desc}</p>
                      </div>
                      ${isSelected && html`
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <${Check} className="w-3.5 h-3.5" />
                        </div>
                      `}
                    </button>
                  `;
                })}
              </div>
            </div>
          `}

          <!-- STEP 2: REMINDERS -->
          ${step === 2 && html`
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <${Sparkles} className="w-4 h-4 text-emerald-500" />
                  <span>Choose check-in schedule</span>
                </h2>
                <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-0.5">
                  How would you prefer to build your consistency?
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                ${REMINDERS.map(rem => {
                  const isSelected = reminder === rem.id;
                  return html`
                    <button
                      key=${rem.id}
                      onClick=${() => setReminder(rem.id)}
                      className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }"
                    >
                      <span className="text-xl filter drop-shadow-sm select-none shrink-0">${rem.emoji}</span>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">${rem.title}</p>
                        <p className="text-xxs text-slate-400 dark:text-slate-500 leading-normal">${rem.desc}</p>
                      </div>
                      ${isSelected && html`
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <${Check} className="w-3.5 h-3.5" />
                        </div>
                      `}
                    </button>
                  `;
                })}
              </div>
            </div>
          `}

          <!-- STEP 3: THEME & PRIVACY -->
          ${step === 3 && html`
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <${Sparkles} className="w-4 h-4 text-emerald-500" />
                  <span>Theme & Privacy Control</span>
                </h2>
                <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-0.5">
                  Choose your interface visual theme and configure your data sharing privacy.
                </p>
              </div>

              <!-- Theme Toggles -->
              <div className="space-y-2.5 pt-1">
                <label className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interface Look</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick=${() => setTheme('light')}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                      theme === 'light' 
                        ? 'border-emerald-500/60 bg-emerald-50/20 text-emerald-600' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400'
                    }"
                  >
                    <${Sun} className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Light Mode</span>
                  </button>

                  <button
                    onClick=${() => setTheme('dark')}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-400' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400'
                    }"
                  >
                    <${Moon} className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Dark Mode</span>
                  </button>
                </div>
              </div>

              <!-- Privacy Toggle -->
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Anonymous Campus Sharing
                    </label>
                    <p className="text-xxs text-slate-400 dark:text-slate-500 leading-normal">
                      Help counselors allocate support programs by contributing de-identified mental wellness metrics.
                    </p>
                  </div>

                  <button
                    onClick=${() => setSharing(!sharing)}
                    className="focus:outline-none shrink-0 transition-transform active:scale-95 mt-0.5"
                  >
                    ${sharing 
                      ? html`<${ToggleRight} className="w-11 h-7 text-emerald-500" />`
                      : html`<${ToggleLeft} className="w-11 h-7 text-slate-300 dark:text-slate-600" />`
                    }
                  </button>
                </div>

                ${sharing 
                  ? html`
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-2.5 flex items-start gap-2">
                      <${Check} className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xxs font-semibold text-emerald-800 dark:text-emerald-400 leading-normal">
                        Sharing Enabled: Data is fully de-identified before aggregation.
                      </p>
                    </div>
                  `
                  : html`
                    <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-2.5 flex items-start gap-2">
                      <${ShieldAlert} className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xxs text-slate-500 dark:text-slate-400 leading-normal">
                        Strictly Local Storage: No metrics leave your web browser cache.
                      </p>
                    </div>
                  `
                }
              </div>
            </div>
          `}

          <!-- BUTTON BAR -->
          <div className="flex items-center justify-between pt-2">
            ${step > 1 
              ? html`
                <button
                  onClick=${prevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <${ArrowLeft} className="w-4 h-4" />
                  <span>Back</span>
                </button>
              `
              : html`<div></div>`
            }

            ${step < 3 
              ? html`
                <button
                  onClick=${nextStep}
                  className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-100 dark:shadow-none hover:from-emerald-600 hover:to-teal-700"
                >
                  <span>Continue</span>
                  <${ArrowRight} className="w-4 h-4" />
                </button>
              `
              : html`
                <button
                  onClick=${handleSave}
                  className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-100 dark:shadow-none hover:from-emerald-600 hover:to-teal-700"
                >
                  <${Check} className="w-4 h-4" />
                  <span>Finish Setup</span>
                </button>
              `
            }
          </div>

        </div>
      </div>
    </div>
  `;
}

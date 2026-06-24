import React, { useState, useMemo } from 'react';
import htm from 'htm';
import { AlertOctagon, TrendingUp, Info, HelpCircle, Activity, Battery, Moon } from 'lucide-react';

const html = htm.bind(React.createElement);

const MOOD_LABELS = { 1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Rad' };

export default function AnalyticsCharts({ logs }) {
  const [timeframe, setTimeframe] = useState('monthly'); // weekly, monthly, semester
  const [hoveredDay, setHoveredDay] = useState(null); // stores active hovered index for line chart
  const [svgWidth, setSvgWidth] = useState(500); // dynamic sizing safety

  // 1. Filter logs based on timeframe
  const filteredLogs = useMemo(() => {
    // Sort ascending for chronological chart drawing
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date();
    
    let daysToKeep = 30;
    if (timeframe === 'weekly') daysToKeep = 7;
    if (timeframe === 'semester') daysToKeep = 90; // approx semester view

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToKeep);

    return sorted.filter(log => new Date(log.date) >= cutoffDate);
  }, [logs, timeframe]);

  // 2. Check for Burnout Warning Signals (over ALL logs to be safe, sorted chronologically)
  const burnoutAlert = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortedLogs.length < 3) return null;

    // Check for 3 consecutive days of Stress >= 4 and Sleep < 5 hours
    for (let i = 0; i <= sortedLogs.length - 3; i++) {
      const day1 = sortedLogs[i];
      const day2 = sortedLogs[i + 1];
      const day3 = sortedLogs[i + 2];

      const isHighStress1 = day1.stress >= 4 && day1.sleepHours < 5.0;
      const isHighStress2 = day2.stress >= 4 && day2.sleepHours < 5.0;
      const isHighStress3 = day3.stress >= 4 && day3.sleepHours < 5.0;

      if (isHighStress1 && isHighStress2 && isHighStress3) {
        // Return details for the burnout period
        return {
          startDate: day1.date,
          endDate: day3.date,
          days: [day1, day2, day3]
        };
      }
    }
    return null;
  }, [logs]);

  // 3. Compute Sleep Quality vs Energy Level aggregations
  const sleepEnergyStats = useMemo(() => {
    const stats = {
      Poor: { energySum: 0, count: 0 },
      Fair: { energySum: 0, count: 0 },
      Good: { energySum: 0, count: 0 }
    };

    filteredLogs.forEach(log => {
      const q = log.sleepQuality || 'Good';
      if (stats[q]) {
        stats[q].energySum += log.energy;
        stats[q].count += 1;
      }
    });

    return Object.keys(stats).map(quality => ({
      quality,
      avgEnergy: stats[quality].count > 0 
        ? parseFloat((stats[quality].energySum / stats[quality].count).toFixed(1))
        : 0,
      count: stats[quality].count
    }));
  }, [filteredLogs]);

  // SVG Chart Config
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Render Line Chart elements
  const lineChartData = useMemo(() => {
    if (filteredLogs.length === 0) return null;

    const usableWidth = svgWidth - 2 * paddingX;
    const usableHeight = chartHeight - 2 * paddingY;
    const count = filteredLogs.length;

    // Generate points
    const pointsMood = [];
    const pointsStress = [];

    filteredLogs.forEach((log, index) => {
      // X maps from index 0 to count-1
      const x = count > 1 
        ? paddingX + (index * usableWidth) / (count - 1)
        : paddingX + usableWidth / 2;

      // Y maps from value 1-5 (where 5 is at top, 1 is at bottom)
      const yMood = paddingY + usableHeight - ((log.mood - 1) * usableHeight) / 4;
      const yStress = paddingY + usableHeight - ((log.stress - 1) * usableHeight) / 4;

      pointsMood.push({ x, y: yMood, log, index });
      pointsStress.push({ x, y: yStress, log, index });
    });

    // Generate path commands
    let pathMood = '';
    let pathStress = '';

    if (pointsMood.length > 0) {
      pathMood = `M ${pointsMood[0].x} ${pointsMood[0].y} ` + 
        pointsMood.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      pathStress = `M ${pointsStress[0].x} ${pointsStress[0].y} ` + 
        pointsStress.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    }

    return { pointsMood, pointsStress, pathMood, pathStress };
  }, [filteredLogs, svgWidth]);

  // Handle line chart hover
  const handleMouseMove = (e) => {
    if (!lineChartData || filteredLogs.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // relative mouse X inside SVG
    
    // Find nearest point
    const points = lineChartData.pointsMood;
    let nearestIndex = 0;
    let minDist = Infinity;
    
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = idx;
      }
    });

    setHoveredDay(nearestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Format date for chart labels
  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Formats date nicely for tooltip
  const formatTooltipDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const usableHeight = chartHeight - 2 * paddingY;

  return html`
    <div className="space-y-6">
      
      ${burnoutAlert && html`
        <div className="bg-gradient-to-r from-rose-50 to-red-100/50 dark:from-red-950/20 dark:to-rose-950/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-4.5 shadow-sm animate-pulse-subtle flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
            <${AlertOctagon} className="w-6 h-6 animate-bounce-slow" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Burnout Warning Signal Detected</h3>
            <p className="text-xs text-red-700/90 dark:text-red-400/90 leading-relaxed">
              Our analysis shows <strong>3 consecutive days</strong> of high stress (stress rating ≥4) combined with low sleep (less than 5 hours) around <span className="font-semibold text-red-800 dark:text-red-200">${formatShortDate(burnoutAlert.startDate)} - ${formatShortDate(burnoutAlert.endDate)}</span>.
            </p>
            <p className="text-xxs text-red-600/80 dark:text-red-400/70 font-medium">
              Recommendation: Head over to the Wellness tab for breathing and stress relief resources immediately.
            </p>
          </div>
        </div>
      `}


      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <${TrendingUp} className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Trends Analytics</h2>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.75 rounded-xl gap-0.5">
          ${[
            { id: 'weekly', label: '7D' },
            { id: 'monthly', label: '30D' },
            { id: 'semester', label: '90D' }
          ].map(opt => html`
            <button
              key=${opt.id}
              onClick=${() => { setTimeframe(opt.id); setHoveredDay(null); }}
              className="px-3.5 py-1.5 rounded-lg text-xxs font-bold tracking-wider transition-all duration-200 ${
                timeframe === opt.id
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }"
              id="timeframe-btn-${opt.id}"
            >
              ${opt.label}
            </button>
          `)}
        </div>
      </div>

      ${filteredLogs.length === 0 ? html`
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-10 shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <${Info} className="w-8 h-8 text-slate-300" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No check-in logs found for the selected timeframe.</p>
        </div>
      ` : html`
        

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all duration-300 space-y-4 relative">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <${Activity} className="w-4 h-4 text-emerald-500" />
              <span>Mood vs. Stress Level</span>
            </h3>
            <div className="flex gap-4 mt-2 text-xxs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Mood (Higher is Better)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Stress (Lower is Better)</span>
              </div>
            </div>
          </div>


          <div className="relative pt-2">
            <svg 
              width="100%" 
              height=${chartHeight} 
              viewBox="0 0 500 220" 
              preserveAspectRatio="none"
              onMouseMove=${handleMouseMove}
              onMouseLeave=${handleMouseLeave}
              className="cursor-crosshair overflow-visible"
              id="mood-stress-svg-chart"
            >
              <defs>

                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>

                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0"/>
                </linearGradient>
              </defs>


              ${[0, 1, 2, 3, 4].map(val => {
                const y = paddingY + (val * usableHeight) / 4;
                const gridVal = 5 - val;
                return html`
                  <g key=${val} className="opacity-40 dark:opacity-20">
                    <line 
                      x1=${paddingX} 
                      y1=${y} 
                      x2=${500 - paddingX} 
                      y2=${y} 
                      stroke="#94a3b8" 
                      strokeWidth="0.5" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x=${paddingX - 10} 
                      y=${y + 4} 
                      textAnchor="end" 
                      className="text-xxs font-bold fill-slate-400 dark:fill-slate-500 font-sans"
                    >
                      ${gridVal}
                    </text>
                  </g>
                `;
              })}


              ${lineChartData && html`
                <g>

                  <path 
                    d=${lineChartData.pathMood} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  

                  <path 
                    d=${lineChartData.pathStress} 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </g>
              `}


              ${lineChartData && lineChartData.pointsMood.map((pt, idx) => {
                const totalPoints = lineChartData.pointsMood.length;
                let shouldLabel = false;
                if (timeframe === 'weekly') shouldLabel = true;
                else if (timeframe === 'monthly' && idx % 5 === 0) shouldLabel = true;
                else if (timeframe === 'semester' && idx % 14 === 0) shouldLabel = true;
                
                // Always draw last point label
                if (idx === totalPoints - 1) shouldLabel = true;

                if (!shouldLabel) return null;

                return html`
                  <text
                    key=${idx}
                    x=${pt.x}
                    y=${chartHeight - 10}
                    textAnchor="middle"
                    className="text-xxs font-bold fill-slate-400 dark:fill-slate-500 font-sans"
                  >
                    ${formatShortDate(pt.log.date)}
                  </text>
                `;
              })}


              ${hoveredDay !== null && lineChartData && html`
                <g>

                  <line
                    x1=${lineChartData.pointsMood[hoveredDay].x}
                    y1=${paddingY}
                    x2=${lineChartData.pointsMood[hoveredDay].x}
                    y2=${chartHeight - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="opacity-70 dark:opacity-50"
                  />

                  <circle
                    cx=${lineChartData.pointsMood[hoveredDay].x}
                    cy=${lineChartData.pointsMood[hoveredDay].y}
                    r="5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="shadow-sm"
                  />

                  <circle
                    cx=${lineChartData.pointsStress[hoveredDay].x}
                    cy=${lineChartData.pointsStress[hoveredDay].y}
                    r="5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="shadow-sm"
                  />
                </g>
              `}
            </svg>
          </div>


          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/40 min-h-12 flex flex-col justify-center">
            ${hoveredDay !== null && lineChartData ? html`
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <span className="text-xxs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Selected Log: ${formatTooltipDate(lineChartData.pointsMood[hoveredDay].log.date)}
                </span>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mood: <span className="text-emerald-500">${MOOD_LABELS[lineChartData.pointsMood[hoveredDay].log.mood]}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Stress: <span className="text-rose-500">${lineChartData.pointsMood[hoveredDay].log.stress}/5</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sleep: <span className="text-indigo-500">${lineChartData.pointsMood[hoveredDay].log.sleepHours}h</span>
                  </span>
                </div>
              </div>
              ${lineChartData.pointsMood[hoveredDay].log.notes && html`
                <p className="text-xxs text-slate-500 dark:text-slate-400 mt-1 border-t border-slate-200/40 dark:border-slate-800/40 pt-1 leading-relaxed italic">
                  "${lineChartData.pointsMood[hoveredDay].log.notes}"
                </p>
              `}
            ` : html`
              <p className="text-xxs text-slate-400 dark:text-slate-500 text-center font-medium flex items-center justify-center gap-1">
                <${HelpCircle} className="w-3.5 h-3.5" />
                <span>Hover or tap points on the chart to inspect daily details.</span>
              </p>
            `}
          </div>

        </div>


        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all duration-300 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <${Battery} className="w-4 h-4 text-amber-500" />
              <span>Sleep Quality Impact on Energy</span>
            </h3>
            <p className="text-xxs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Compares your average energy levels (1-5 scale) grouped by the quality of your sleep.
            </p>
          </div>


          <div className="pt-2 grid grid-cols-3 gap-4 items-end min-h-40 px-2 sm:px-6">
            ${sleepEnergyStats.map(stat => {
              const maxEnergy = 5;
              const barHeightPercent = (stat.avgEnergy / maxEnergy) * 100;
              
              let barColor = 'from-rose-400 to-rose-500 dark:from-rose-500 dark:to-rose-600';
              let textColor = 'text-rose-500';
              let badgeBg = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
              
              if (stat.quality === 'Fair') {
                barColor = 'from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600';
                textColor = 'text-amber-500';
                badgeBg = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
              } else if (stat.quality === 'Good') {
                barColor = 'from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600';
                textColor = 'text-emerald-500';
                badgeBg = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
              }

              return html`
                <div key=${stat.quality} className="flex flex-col items-center gap-2 group">

                  <span className="text-xxs font-bold text-slate-600 dark:text-slate-300">
                    ${stat.count > 0 ? `${stat.avgEnergy} / 5` : 'N/A'}
                  </span>
                  

                  <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-t-xl h-28 flex items-end overflow-hidden shadow-inner">
                    ${stat.count > 0 ? html`
                      <div 
                        style=${{ height: `${barHeightPercent}%` }}
                        className="w-full bg-gradient-to-t ${barColor} rounded-t-lg transition-all duration-1000 shadow-sm animate-grow-height"
                      />
                    ` : html`
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800" />
                    `}
                  </div>


                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">${stat.quality} Sleep</span>
                  

                  <span className="text-xxs font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeBg}">
                    ${stat.count} ${stat.count === 1 ? 'day' : 'days'}
                  </span>
                </div>
              `;
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/40 text-xxs text-slate-500 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
            <${Moon} className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong>Data Insight:</strong> If your energy level is significantly higher after a <strong>Good Sleep</strong>, it demonstrates a strong correlation. Consider maintaining a regular sleep schedule, especially on weekdays!
            </p>
          </div>
        </div>

      `}
    </div>
  `;
}

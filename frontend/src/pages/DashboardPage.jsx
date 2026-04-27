import React, { useContext } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Heart, Wind, AlertTriangle, Clock } from 'lucide-react'; // Removed Activity import here
import CircularProgress from '../components/CircularProgress';
import TelemetryLog from '../components/TelemetryLog';
import MiniFatigueGraph from '../components/MiniFatigueGraph';
import './DashboardPage.css';

export default function DashboardPage() {
  const { vitals, history, scenario, isRunning, elapsedTime, logs } = useContext(SimulationContext);

  const getStatus = () => {
    if (!isRunning) return { text: "System Offline", color: "var(--text-muted)", bg: "transparent" };
    if (vitals.hr > 185 || vitals.spo2 < 90 || vitals.fatigue.overall > 90) return { text: "Critical Load", color: "var(--danger)", bg: "rgba(239, 68, 68, 0.05)" };
    if (vitals.hr > 165 || vitals.spo2 < 94 || vitals.fatigue.overall > 70) return { text: "High Strain", color: "var(--warning)", bg: "rgba(245, 158, 11, 0.05)" };
    return { text: "Normal", color: "var(--success)", bg: "rgba(16, 185, 129, 0.05)" };
  };
  const status = getStatus();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="page-container hide-scrollbar">
      <div className="dash-header">
        <div className="dash-header-row">
          <h1 className="retro-heading dash-title">Live Dashboard</h1>
          {isRunning && (
            <div className="timer-badge">
              <Clock size={16} /> {formatTime(elapsedTime)}
            </div>
          )}
        </div>
        
        <div className="dash-header-row">
          {scenario !== 'Normal' && (
            <div className="btn hide-on-mobile" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', cursor: 'default' }}>
              <AlertTriangle size={16} /> Scenario: {scenario}
            </div>
          )}
          
          {/* Status Badge - Replaced logo icon with a clean glowing dot */}
          <div className="btn status-badge" style={{ borderColor: status.color, color: status.color, cursor: 'default', backgroundColor: status.bg }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, boxShadow: `0 0 6px ${status.color}` }} /> 
            {status.text}
          </div>

        </div>
      </div>

      <div className="grid-layout dash-grid">
        <div className="dash-col-main">
          
          <div className="card graph-card">
            <div className="graph-header">
              <h3 className="retro-heading graph-title">
                <Heart size={18} color="var(--danger)" /> Heart Rate
              </h3>
              <h2 className="retro-heading graph-val" style={{ color: 'var(--danger)' }}>
                {vitals.hr} <span className="graph-unit">BPM</span>
              </h2>
            </div>
            <div className="graph-body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" vertical={false} opacity={0.2} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 15', 'dataMax + 15']} stroke="var(--text-muted)" tick={{fontFamily: 'Space Mono', fontSize: 11}} width={55} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'var(--border-style)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                  <Area type="monotone" dataKey="hr" stroke="var(--danger)" fill="url(#colorHr)" strokeWidth={3} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card graph-card graph-card-small">
            <div className="graph-header">
              <h3 className="retro-heading graph-title">
                 <Wind size={18} color="var(--info)" /> Blood Oxygen
              </h3>
              <h2 className="retro-heading graph-val" style={{ color: 'var(--info)' }}>
                {vitals.spo2} <span className="graph-unit">%</span>
              </h2>
            </div>
            <div className="graph-body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                    <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" vertical={false} opacity={0.2} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[80, 100]} stroke="var(--text-muted)" tick={{fontFamily: 'Space Mono', fontSize: 11}} width={55} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'var(--border-style)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                  <Area type="monotone" dataKey="spo2" stroke="var(--info)" fill="url(#colorSpo2)" strokeWidth={3} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dash-col-side">
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="fatigue-header">
              <div>
                <h2 className="retro-heading fatigue-title">System Fatigue</h2>
                <p className="fatigue-subtitle">Exhaustion Levels</p>
              </div>
              <CircularProgress value={vitals.fatigue.overall} size={80} strokeWidth={6} />
            </div>

            <div className="fatigue-list">
              <MiniFatigueGraph title="Cardio Stress" data={history} dataKey="cardio" color="var(--danger)" value={vitals.fatigue.cardio} />
              <MiniFatigueGraph title="Muscular Load" data={history} dataKey="muscle" color="var(--warning)" value={vitals.fatigue.muscle} />
              <MiniFatigueGraph title="Lower Body Stress" data={history} dataKey="leg" color="var(--primary)" value={vitals.fatigue.leg} />
            </div>
          </div>

          <TelemetryLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
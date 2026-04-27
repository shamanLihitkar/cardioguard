import React from 'react';
import { Heart, Wind, Battery } from 'lucide-react';
import './VitalsPod.css';

export default function VitalsPod({ vitals }) {
  return (
    <div className="vitals-row">
      <div className="card vital-card">
        <Heart size={24} color="var(--danger)" />
        <div>
          <div className="vital-label">Heart Rate</div>
          <div className="vital-val">{vitals.hr}</div>
        </div>
      </div>

      <div className="card vital-card">
        <Wind size={24} color="var(--info)" />
        <div>
          <div className="vital-label">Blood O2</div>
          <div className="vital-val">{vitals.spo2}</div>
        </div>
      </div>

      <div className="card vital-card">
        <Battery size={24} color={vitals.fatigue.overall > 80 ? "var(--danger)" : "var(--warning)"} />
        <div>
          <div className="vital-label">Fatigue</div>
          <div className="vital-val">{vitals.fatigue.overall}</div>
        </div>
      </div>
    </div>
  );
}
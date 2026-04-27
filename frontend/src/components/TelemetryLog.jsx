import React from 'react';
import { Terminal } from 'lucide-react';
import './TelemetryLog.css';

export default function TelemetryLog({ logs }) {
  return (
    <div className="card log-card">
      <div className="log-header">
        <Terminal size={18} color="var(--primary)" />
        <h3 className="retro-heading log-title">Activity Monitor</h3>
      </div>
      
      <div className="log-container hide-scrollbar">
        {logs.length === 0 && <p className="log-empty">Awaiting system telemetry...</p>}
        
        {logs.map((log, index) => {
          let bgType = 'rgba(0,0,0,0.02)';
          let bdrColor = 'var(--text-muted)';
          if (log.type === 'danger') { bgType = 'rgba(239, 68, 68, 0.1)'; bdrColor = 'var(--danger)'; }
          if (log.type === 'warning') { bgType = 'rgba(245, 158, 11, 0.1)'; bdrColor = 'var(--warning)'; }
          if (log.type === 'success') { bgType = 'rgba(16, 185, 129, 0.1)'; bdrColor = 'var(--success)'; }
          if (log.type === 'info') { bgType = 'rgba(59, 130, 246, 0.05)'; bdrColor = 'var(--primary)'; }

          return (
            <div key={index} className="log-entry" style={{ backgroundColor: bgType, borderLeftColor: bdrColor }}>
              <span className="log-time">[{log.time}]</span>
              <span className={`log-msg text-main ${log.type === 'danger' || log.type === 'warning' ? 'msg-bold' : ''}`}>
                {log.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
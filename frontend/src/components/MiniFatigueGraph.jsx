import React from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import './MiniFatigueGraph.css';

export default function MiniFatigueGraph({ title, data, dataKey, color, value }) {
  return (
    <div className="mini-graph-wrapper" style={{ borderLeftColor: color }}>
      <div className="mini-graph-top">
        <span className="mini-graph-title">{title}</span>
        <span className="retro-heading mini-graph-val" style={{ color }}>{value}%</span>
      </div>
      <div className="mini-graph-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#color${dataKey})`} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
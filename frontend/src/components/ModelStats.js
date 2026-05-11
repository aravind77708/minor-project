import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b'];

export default function ModelStats({ info }) {
  if (!info?.all_accuracies) return null;

  const data = Object.entries(info.all_accuracies).map(([name, acc], i) => ({
    name: name.replace('Logistic Regression', 'Log. Reg.').replace('Random Forest', 'Rand. Forest'),
    accuracy: acc,
    best: name === info.best_model,
    color: COLORS[i % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-card2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 13
      }}>
        <div style={{ color: 'var(--text-dim)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{payload[0].value}%</div>
      </div>
    );
  };

  return (
    <section className="model-stats-section">
      <p className="stats-title">Model Comparison — Accuracy (%)</p>

      <div className="model-cards-grid" style={{ marginBottom: 28 }}>
        {Object.entries(info.all_accuracies).map(([name, acc]) => (
          <div key={name} className={`model-stat-card ${name === info.best_model ? 'best' : ''}`}>
            <div className="model-name">{name}</div>
            <div className="model-acc">{acc}%</div>
            {name === info.best_model && (
              <div className="model-best-badge">★ BEST</div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '24px', height: 240
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={36}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontFamily: 'Space Mono', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[70, 100]} tickCount={4}
              tick={{ fill: '#64748b', fontFamily: 'Space Mono', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.best ? '#3b82f6' : '#1e3a5f'}
                  stroke={entry.best ? '#3b82f6' : 'transparent'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
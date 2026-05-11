import React from 'react';

export default function ResultCard({ result }) {
  const isDelayed = result.delayed;

  return (
    <div className="result-card">
      {/* Banner */}
      <div className={`result-banner ${isDelayed ? 'delayed' : 'ontime'}`}>
        <span className="result-emoji">{isDelayed ? '⚠️' : '✅'}</span>
        <div className="result-text-group">
          <h2>{isDelayed ? 'DELIVERY DELAYED' : 'ON-TIME DELIVERY'}</h2>
          <p className="result-model">Model: {result.model_used}</p>
        </div>
        <div className="confidence-badge">
          <div className="conf-num">{result.confidence}%</div>
          <div className="conf-label">CONFIDENCE</div>
        </div>
      </div>

      {/* Details */}
      <div className="result-details">

        {/* Probability bars */}
        <div className="prob-bars">
          <label>Probability Breakdown</label>
          <div className="bar-row">
            <span className="bar-label">On-Time</span>
            <div className="bar-track">
              <div
                className="bar-fill ontime"
                style={{ width: `${result.probability.on_time}%` }}
              />
            </div>
            <span className="bar-pct">{result.probability.on_time}%</span>
          </div>
          <div className="bar-row">
            <span className="bar-label">Delayed</span>
            <div className="bar-track">
              <div
                className="bar-fill delayed"
                style={{ width: `${result.probability.delayed}%` }}
              />
            </div>
            <span className="bar-pct">{result.probability.delayed}%</span>
          </div>
        </div>

        {/* Risk factors */}
        <div className="risk-section">
          <label>Risk Factors Detected</label>
          {result.risk_factors && result.risk_factors.length > 0 ? (
            <div className="risk-tags">
              {result.risk_factors.map((r, i) => (
                <span className="risk-tag" key={i}>{r}</span>
              ))}
            </div>
          ) : (
            <p className="no-risk">✓ No major risk factors detected</p>
          )}
        </div>

        {/* Input summary */}
        <div className="risk-section">
          <label>Input Summary</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              ['Distance', `${result.input.distance_km} km`],
              ['Traffic',  result.input.traffic_level],
              ['Weather',  result.input.weather_condition],
              ['Vehicle',  result.input.vehicle_condition],
              ['Priority', result.input.delivery_priority],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: 'var(--bg)', borderRadius: 8, padding: '8px 12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
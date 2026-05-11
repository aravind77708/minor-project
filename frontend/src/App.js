import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import ModelStats from './components/ModelStats';
import Header from './components/Header';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [prediction, setPrediction]   = useState(null);
  const [modelInfo,  setModelInfo]    = useState(null);
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState('');
  const [history,    setHistory]      = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/model-info`)
      .then(res => setModelInfo(res.data))
      .catch(() => setModelInfo(null));
  }, []);

  const handlePredict = async (formData) => {
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const res = await axios.post(`${API_BASE}/predict`, formData);
      const result = { ...res.data, input: formData, timestamp: new Date().toLocaleTimeString() };
      setPrediction(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <Header modelInfo={modelInfo} />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Logistics Intelligence
          </div>
          <h1 className="hero-title">
            Predict Delivery<br />
            <span className="gradient-text">Delays Instantly</span>
          </h1>
          <p className="hero-sub">
            Enter shipment details below. Our machine learning engine analyzes
            distance, traffic, weather, vehicle condition and priority to predict
            whether your delivery arrives <strong>on time</strong> or faces a <strong>delay</strong>.
          </p>
        </section>

        <div className="workspace">
          <div className="form-column">
            <PredictionForm onSubmit={handlePredict} loading={loading} />
            {error && (
              <div className="error-banner" role="alert">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
          </div>

          <div className="result-column">
            {loading && (
              <div className="loading-card">
                <div className="spinner" />
                <p>Analyzing shipment data…</p>
              </div>
            )}
            {prediction && !loading && (
              <ResultCard result={prediction} />
            )}
            {!prediction && !loading && (
              <div className="placeholder-card">
                <div className="placeholder-icon">🚚</div>
                <p>Your prediction will appear here</p>
                <span>Fill out the form and click Predict</span>
              </div>
            )}

            {history.length > 1 && (
              <div className="history-section">
                <h3>Recent Predictions</h3>
                <div className="history-list">
                  {history.slice(1).map((h, i) => (
                    <div key={i} className={`history-item ${h.delayed ? 'delayed' : 'ontime'}`}>
                      <span className="history-badge">{h.delayed ? '⚠ Delayed' : '✓ On-Time'}</span>
                      <span className="history-meta">{h.input.distance_km}km • {h.input.traffic_level} traffic • {h.timestamp}</span>
                      <span className="history-conf">{h.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {modelInfo && <ModelStats info={modelInfo} />}

        <section className="info-grid">
          <div className="info-card">
            <div className="info-icon">🌱</div>
            <h3>Sustainability Impact</h3>
            <p>By predicting delays early, fleets can reroute efficiently, reducing fuel consumption up to 18% and cutting CO₂ emissions.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Fuel Optimization</h3>
            <p>Proactive delay detection enables route replanning before departure, minimizing idle time and reducing fleet energy spend.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔄</div>
            <h3>Circular Economy</h3>
            <p>Efficient logistics reduces waste from spoiled goods, supports reverse logistics for returns, and lowers packaging waste.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📈</div>
            <h3>Future Enhancements</h3>
            <p>Planned upgrades include real-time GPS, IoT vehicle telemetry, satellite weather feeds, and reinforcement learning routing.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with Python · Flask · Scikit-learn · React · Recharts</p>
        <p className="footer-sub">Deploy: Render (Backend) · Vercel (Frontend)</p>
      </footer>
    </div>
  );
}
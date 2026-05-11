import React, { useState } from 'react';

const DEFAULTS = {
  distance_km: 150,
  traffic_level: 'Medium',
  weather_condition: 'Clear',
  vehicle_condition: 'Good',
  delivery_priority: 'Medium',
};

const OPTIONS = {
  traffic_level: ['Low', 'Medium', 'High'],
  weather_condition: ['Clear', 'Rainy', 'Foggy', 'Stormy'],
  vehicle_condition: ['Good', 'Fair', 'Poor'],
  delivery_priority: ['Low', 'Medium', 'High'],
};

export default function PredictionForm({ onSubmit, loading }) {

  const [form, setForm] = useState(DEFAULTS);

  const update = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...form,
      distance_km: Number(form.distance_km)
    });
  };

  return (

    <form
      onSubmit={handleSubmit}
      style={{
        background: '#111c3a',
        padding: '25px',
        borderRadius: '15px',
        marginTop: '20px'
      }}
    >

      <h2 style={{ marginBottom: '25px' }}>
        Shipment Details
      </h2>

      {/* Distance */}
      <div style={{ marginBottom: '20px' }}>

        <label>Distance (km)</label>

        <input
          type="range"
          min="5"
          max="500"
          step="5"
          value={form.distance_km}
          onChange={(e) =>
            update('distance_km', e.target.value)
          }
          style={{ width: '100%' }}
        />

        <p>{form.distance_km} km</p>

      </div>

      {/* Dropdowns */}
      {Object.keys(OPTIONS).map((key) => (

        <div
          key={key}
          style={{ marginBottom: '20px' }}
        >

          <label>{key.replaceAll('_', ' ')}</label>

          <select
            value={form[key]}
            onChange={(e) =>
              update(key, e.target.value)
            }
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '8px',
              borderRadius: '8px'
            }}
          >

            {OPTIONS[key].map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>

      ))}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: '#38bdf8',
          border: 'none',
          borderRadius: '10px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >

        {loading
          ? 'Predicting...'
          : 'Predict Delivery Status'}

      </button>

    </form>

  );
}
"""
app.py  –  Flask REST API
=========================
Endpoints:
  GET  /            → health check
  POST /predict     → delivery delay prediction
  GET  /model-info  → model metadata & accuracies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import os

app = Flask(__name__)
CORS(app)   # Allow requests from React frontend (Vercel)

# ─────────────────────────────────────────
# LOAD SAVED ARTIFACTS AT STARTUP
# ─────────────────────────────────────────
BASE = os.path.dirname(__file__)

try:
    model    = joblib.load(os.path.join(BASE, 'best_model.pkl'))
    encoders = joblib.load(os.path.join(BASE, 'encoders.pkl'))
    with open(os.path.join(BASE, 'model_meta.json')) as f:
        meta = json.load(f)
    print(f"✓ Loaded model: {meta['best_model']}  ({meta['accuracy']}% accuracy)")
except FileNotFoundError:
    print("⚠  Model files not found. Run train_model.py first.")
    model = encoders = meta = None


# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────
@app.route('/')
def health():
    return jsonify({
        'status':  'running',
        'message': 'Delivery Delay Predictor API is live 🚚',
        'model':   meta['best_model'] if meta else 'not loaded'
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 500

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body received'}), 400

    required = ['distance_km', 'traffic_level', 'weather_condition',
                'vehicle_condition', 'delivery_priority']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        # Encode categorical features
        traffic_enc  = encoders['traffic_level'].transform([data['traffic_level']])[0]
        weather_enc  = encoders['weather_condition'].transform([data['weather_condition']])[0]
        vehicle_enc  = encoders['vehicle_condition'].transform([data['vehicle_condition']])[0]
        priority_enc = encoders['delivery_priority'].transform([data['delivery_priority']])[0]

        features = np.array([[
            float(data['distance_km']),
            traffic_enc,
            weather_enc,
            vehicle_enc,
            priority_enc
        ]])

        prediction   = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        confidence   = round(float(max(probabilities)) * 100, 1)

        result = 'Delayed' if prediction == 1 else 'On-Time'

        # Build human-readable risk factors
        risk_factors = []
        if float(data['distance_km']) > 300:
            risk_factors.append('Long distance route')
        if data['traffic_level'] == 'High':
            risk_factors.append('High traffic congestion')
        if data['weather_condition'] in ('Stormy', 'Foggy'):
            risk_factors.append(f"Adverse weather: {data['weather_condition']}")
        if data['vehicle_condition'] == 'Poor':
            risk_factors.append('Poor vehicle condition')
        if data['delivery_priority'] == 'Low':
            risk_factors.append('Low delivery priority')

        return jsonify({
            'prediction':   result,
            'delayed':      bool(prediction),
            'confidence':   confidence,
            'probability':  {
                'on_time': round(float(probabilities[0]) * 100, 1),
                'delayed': round(float(probabilities[1]) * 100, 1)
            },
            'risk_factors': risk_factors,
            'model_used':   meta['best_model']
        })

    except ValueError as e:
        return jsonify({'error': f'Invalid input value: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    if meta is None:
        return jsonify({'error': 'Model metadata not loaded'}), 500
    return jsonify(meta)


# ─────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

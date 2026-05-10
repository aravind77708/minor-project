"""
train_model.py
==============
Trains multiple ML models to predict delivery delays.
Models: Random Forest, Decision Tree, Logistic Regression, KNN
Saves best model as 'best_model.pkl'
"""

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ─────────────────────────────────────────
# 1. GENERATE SYNTHETIC DATASET
# ─────────────────────────────────────────
np.random.seed(42)
N = 2000

distance_km        = np.random.randint(5, 500, N)
traffic_level      = np.random.choice(['Low', 'Medium', 'High'], N)
weather_condition  = np.random.choice(['Clear', 'Rainy', 'Foggy', 'Stormy'], N)
vehicle_condition  = np.random.choice(['Good', 'Fair', 'Poor'], N)
delivery_priority  = np.random.choice(['Low', 'Medium', 'High'], N)

# Rule-based labeling (realistic logic)
def assign_delay(dist, traffic, weather, vehicle, priority):
    score = 0
    if dist > 300:           score += 2
    elif dist > 150:         score += 1
    if traffic == 'High':    score += 2
    elif traffic == 'Medium':score += 1
    if weather in ('Stormy','Foggy'): score += 2
    elif weather == 'Rainy': score += 1
    if vehicle == 'Poor':    score += 2
    elif vehicle == 'Fair':  score += 1
    if priority == 'Low':    score += 1
    # Add noise
    score += np.random.randint(-1, 2)
    return 1 if score >= 5 else 0

labels = [assign_delay(distance_km[i], traffic_level[i], weather_condition[i],
                       vehicle_condition[i], delivery_priority[i]) for i in range(N)]

df = pd.DataFrame({
    'distance_km':       distance_km,
    'traffic_level':     traffic_level,
    'weather_condition': weather_condition,
    'vehicle_condition': vehicle_condition,
    'delivery_priority': delivery_priority,
    'delayed':           labels
})

df.to_csv('dataset.csv', index=False)
print(f"Dataset created: {N} rows | Delayed: {sum(labels)} | On-time: {N-sum(labels)}")

# ─────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────
le = LabelEncoder()
cat_cols = ['traffic_level', 'weather_condition', 'vehicle_condition', 'delivery_priority']
encoders = {}

for col in cat_cols:
    le_col = LabelEncoder()
    df[col] = le_col.fit_transform(df[col])
    encoders[col] = le_col

X = df.drop('delayed', axis=1)
y = df['delayed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")

# ─────────────────────────────────────────
# 3. TRAIN MODELS
# ─────────────────────────────────────────
models = {
    'Random Forest':      RandomForestClassifier(n_estimators=100, random_state=42),
    'Decision Tree':      DecisionTreeClassifier(max_depth=8, random_state=42),
    'Logistic Regression':LogisticRegression(max_iter=1000, random_state=42),
    'KNN':                KNeighborsClassifier(n_neighbors=7)
}

results = {}
best_acc = 0
best_model = None
best_name = ''

print("\n" + "="*55)
print("MODEL EVALUATION RESULTS")
print("="*55)

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc   = accuracy_score(y_test, preds)
    results[name] = round(acc * 100, 2)

    print(f"\n{name}")
    print(f"  Accuracy : {acc*100:.2f}%")
    print(f"  Report   :\n{classification_report(y_test, preds, target_names=['On-Time','Delayed'])}")

    if acc > best_acc:
        best_acc   = acc
        best_model = model
        best_name  = name

print("="*55)
print(f"\n★  BEST MODEL: {best_name}  ({best_acc*100:.2f}%)")

# ─────────────────────────────────────────
# 4. SAVE ARTIFACTS
# ─────────────────────────────────────────
joblib.dump(best_model, 'best_model.pkl')
joblib.dump(encoders,   'encoders.pkl')

feature_names = list(X.columns)
with open('model_meta.json', 'w') as f:
    json.dump({
        'best_model':    best_name,
        'accuracy':      round(best_acc * 100, 2),
        'feature_names': feature_names,
        'all_accuracies': results,
        'encoders': {
            col: list(encoders[col].classes_) for col in cat_cols
        }
    }, f, indent=2)

print("\nSaved: best_model.pkl | encoders.pkl | model_meta.json | dataset.csv")
print("Training complete ✓")

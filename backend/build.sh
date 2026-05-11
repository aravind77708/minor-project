#!/bin/bash
pip install --upgrade pip
pip install pandas==2.0.3 --only-binary=:all:
pip install numpy==1.24.4 --only-binary=:all:
pip install scikit-learn==1.3.2 --only-binary=:all:
pip install flask==3.0.3
pip install flask-cors==4.0.1
pip install joblib==1.3.2
pip install gunicorn==21.2.0
pip list
python train_model.py
pip install --upgrade pip
pip install --only-binary=:all: scikit-learn==1.3.2
pip install --only-binary=:all: pandas==2.0.3
pip install --only-binary=:all: numpy==1.24.4
pip install flask==3.0.3
pip install flask-cors==4.0.1
pip install joblib==1.3.2
pip install gunicorn==21.2.0
python train_model.py
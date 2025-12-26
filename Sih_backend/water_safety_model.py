import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import random

def generate_water_safety_data():
    """Generate synthetic water quality data for training"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate realistic water quality parameters
    data = []
    
    for i in range(n_samples):
        # Generate base parameters
        temperature = np.random.normal(25, 5)  # 20-30°C range
        ph = np.random.normal(7.0, 0.8)  # 6.2-7.8 range
        turbidity = np.random.exponential(2)  # 0-20 NTU
        tds = np.random.normal(300, 100)  # 100-500 ppm
        
        # Determine safety based on WHO guidelines
        is_safe = True
        safety_score = 0
        
        # pH safety (6.5-8.5 is safe)
        if ph < 6.5 or ph > 8.5:
            is_safe = False
            safety_score += 2
        elif ph < 6.8 or ph > 8.2:
            safety_score += 1
            
        # Turbidity safety (< 5 NTU is safe)
        if turbidity > 10:
            is_safe = False
            safety_score += 2
        elif turbidity > 5:
            safety_score += 1
            
        # TDS safety (< 500 ppm is safe)
        if tds > 1000:
            is_safe = False
            safety_score += 2
        elif tds > 500:
            safety_score += 1
            
        # Temperature safety (15-30°C is safe)
        if temperature < 10 or temperature > 35:
            is_safe = False
            safety_score += 1
            
        # Add some noise to make it more realistic
        temperature += np.random.normal(0, 0.5)
        ph += np.random.normal(0, 0.1)
        turbidity += np.random.normal(0, 0.2)
        tds += np.random.normal(0, 10)
        
        # Ensure realistic bounds
        temperature = max(5, min(40, temperature))
        ph = max(4, min(10, ph))
        turbidity = max(0, min(50, turbidity))
        tds = max(50, min(2000, tds))
        
        data.append([temperature, ph, turbidity, tds, int(not is_safe), safety_score])
    
    return np.array(data)

def generate_disease_data():
    """Generate synthetic disease prediction data based on water quality"""
    np.random.seed(123)
    n_samples = 800
    
    diseases = [
        "No Disease",
        "Gastroenteritis", 
        "Cholera",
        "Typhoid",
        "Hepatitis A",
        "Dysentery",
        "Skin Infection"
    ]
    
    data = []
    
    for i in range(n_samples):
        # Generate water quality parameters
        temperature = np.random.normal(25, 5)
        ph = np.random.normal(7.0, 0.8)
        turbidity = np.random.exponential(2)
        tds = np.random.normal(300, 100)
        
        # Determine disease based on water quality
        disease_idx = 0  # No Disease by default
        
        # High turbidity and low pH -> Gastroenteritis
        if turbidity > 8 and ph < 6.5:
            disease_idx = 1
        # Very high turbidity and high temperature -> Cholera
        elif turbidity > 15 and temperature > 30:
            disease_idx = 2
        # High TDS and high temperature -> Typhoid
        elif tds > 800 and temperature > 28:
            disease_idx = 3
        # Low pH and high temperature -> Hepatitis A
        elif ph < 6.0 and temperature > 32:
            disease_idx = 4
        # High turbidity and high TDS -> Dysentery
        elif turbidity > 10 and tds > 600:
            disease_idx = 5
        # Extreme pH -> Skin Infection
        elif ph < 5.5 or ph > 9.0:
            disease_idx = 6
            
        # Add some randomness
        if np.random.random() < 0.1:  # 10% chance of random disease
            disease_idx = np.random.randint(1, len(diseases))
            
        data.append([temperature, ph, turbidity, tds, disease_idx])
    
    return np.array(data), diseases

def train_water_safety_model():
    """Train water safety prediction model"""
    print("Generating water safety training data...")
    data = generate_water_safety_data()
    
    X = data[:, :-2]  # Features: temperature, ph, turbidity, tds
    y = data[:, -2]   # Target: is_unsafe (0 or 1)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Water Safety Model - Train Score: {train_score:.3f}, Test Score: {test_score:.3f}")
    
    # Save model and scaler
    joblib.dump(model, 'water_safety_model.pkl')
    joblib.dump(scaler, 'water_safety_scaler.pkl')
    
    return model, scaler

def train_disease_prediction_model():
    """Train disease prediction model"""
    print("Generating disease prediction training data...")
    data, diseases = generate_disease_data()
    
    X = data[:, :-1]  # Features: temperature, ph, turbidity, tds
    y = data[:, -1]   # Target: disease index
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Disease Prediction Model - Train Score: {train_score:.3f}, Test Score: {test_score:.3f}")
    
    # Save model and scaler
    joblib.dump(model, 'disease_model.pkl')
    joblib.dump(scaler, 'disease_scaler.pkl')
    joblib.dump(diseases, 'disease_labels.pkl')
    
    return model, scaler, diseases

def predict_water_safety(temperature, ph, turbidity, tds):
    """Predict water safety using trained model"""
    try:
        model = joblib.load('water_safety_model.pkl')
        scaler = joblib.load('water_safety_scaler.pkl')
        
        # Prepare input
        X = np.array([[temperature, ph, turbidity, tds]])
        X_scaled = scaler.transform(X)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]
        
        is_safe = prediction == 0
        confidence = max(probabilities)
        
        return {
            'is_safe': bool(is_safe),
            'confidence': float(confidence),
            'risk_level': 'Low' if is_safe else 'High'
        }
    except Exception as e:
        print(f"Error in water safety prediction: {e}")
        # Fallback to rule-based prediction
        unsafe = ph < 6.5 or ph > 8.5 or turbidity > 10 or tds > 500
        return {
            'is_safe': not unsafe,
            'confidence': 0.85,
            'risk_level': 'Low' if not unsafe else 'High'
        }

def predict_disease(temperature, ph, turbidity, tds):
    """Predict potential diseases using trained model"""
    try:
        model = joblib.load('disease_model.pkl')
        scaler = joblib.load('disease_scaler.pkl')
        diseases = joblib.load('disease_labels.pkl')
        
        # Prepare input
        X = np.array([[temperature, ph, turbidity, tds]])
        X_scaled = scaler.transform(X)
        
        # Predict
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]
        
        disease = diseases[int(prediction)]
        confidence = max(probabilities)
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_predictions = [
            {
                'disease': diseases[idx],
                'probability': float(probabilities[idx])
            }
            for idx in top_indices
        ]
        
        return {
            'predicted_disease': disease,
            'confidence': float(confidence),
            'top_predictions': top_predictions
        }
    except Exception as e:
        print(f"Error in disease prediction: {e}")
        # Fallback to rule-based prediction
        if turbidity > 8 and ph < 6.5:
            disease = "Gastroenteritis"
        elif turbidity > 15 and temperature > 30:
            disease = "Cholera"
        elif tds > 800 and temperature > 28:
            disease = "Typhoid"
        elif ph < 6.0 and temperature > 32:
            disease = "Hepatitis A"
        elif turbidity > 10 and tds > 600:
            disease = "Dysentery"
        elif ph < 5.5 or ph > 9.0:
            disease = "Skin Infection"
        else:
            disease = "No Disease"
            
        return {
            'predicted_disease': disease,
            'confidence': 0.75,
            'top_predictions': [
                {'disease': disease, 'probability': 0.75},
                {'disease': 'No Disease', 'probability': 0.15},
                {'disease': 'Gastroenteritis', 'probability': 0.10}
            ]
        }

if __name__ == "__main__":
    print("Training ML models for water quality prediction...")
    
    # Train water safety model
    safety_model, safety_scaler = train_water_safety_model()
    
    # Train disease prediction model
    disease_model, disease_scaler, diseases = train_disease_prediction_model()
    
    print("Models trained and saved successfully!")
    
    # Test predictions
    print("\nTesting predictions...")
    test_data = [25.0, 7.2, 3.5, 280]  # temperature, ph, turbidity, tds
    
    safety_result = predict_water_safety(*test_data)
    disease_result = predict_disease(*test_data)
    
    print(f"Water Safety: {safety_result}")
    print(f"Disease Prediction: {disease_result}")

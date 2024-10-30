import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib

# Load the dataset
breast_cancer_data = load_breast_cancer()
X = pd.DataFrame(breast_cancer_data.data, columns=breast_cancer_data.feature_names)
y = breast_cancer_data.target

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the XGBoost classifier
xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')

# Train the model
xgb_model.fit(X_train, y_train)

# Make predictions
y_pred = xgb_model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
#print(f"Accuracy: {accuracy:.4f}")

# Confusion Matrix
conf_matrix = confusion_matrix(y_test, y_pred)
#print("\nConfusion Matrix:")
#print(conf_matrix)

# Classification Report
class_report = classification_report(y_test, y_pred)
#print("\nClassification Report:")
#print(class_report)

joblib.dump(xgb_model, 'xgboost_breast_cancer_model.joblib')
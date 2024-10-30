import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from imblearn.over_sampling import SMOTE  # For SMOTE oversampling
import joblib

# Step 1: Load the dataset (replace with your actual file path)
data = pd.read_csv('../datasets/survey lung cancer.csv')

# Step 2: Convert 'GENDER' column: 'M' -> 1, 'F' -> 0
data['GENDER'] = data['GENDER'].map({'M': 1, 'F': 0})

# Step 3: Convert all other columns: 2 -> 1, 1 -> 0 (except 'GENDER')
data.loc[:, data.columns != 'GENDER'] = data.loc[:, data.columns != 'GENDER'].replace({2: 1, 1: 0})

# Step 4: Convert 'LUNG_CANCER' column: 'YES' -> 1, 'NO' -> 0
data['LUNG_CANCER'] = data['LUNG_CANCER'].map({'YES': 1, 'NO': 0})

# Step 5: Separate features and target variable (as numpy arrays)
X = data.drop(columns=['LUNG_CANCER']).values  # Features as numpy array
y = data['LUNG_CANCER'].values  # Target as numpy array

# Step 6: Apply SMOTE to balance the classes
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Optional: Display the new class distribution after SMOTE
print("Class distribution after SMOTE:")
print(pd.Series(y_resampled).value_counts())

# Step 7: Split the resampled data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

# Step 8: Initialize and train the SVM model
svm_model = SVC(kernel='linear', class_weight='balanced', random_state=42)
svm_model.fit(X_train, y_train)

# Step 9: Make predictions on the test data
y_pred_test = svm_model.predict(X_test)

# Step 10: Evaluate the model on the test set
print("\nTest Set Evaluation:")
print(f"Accuracy: {accuracy_score(y_test, y_pred_test):.2f}")
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred_test))
print("Classification Report:")
print(classification_report(y_test, y_pred_test))

# Optional: Evaluate the model on the training set
# y_pred_train = svm_model.predict(X_train)
# print("\nTraining Set Evaluation:")
# print(f"Accuracy: {accuracy_score(y_train, y_pred_train):.2f}")
# print("Confusion Matrix:")
# print(confusion_matrix(y_train, y_pred_train))
# print("Classification Report:")
# print(classification_report(y_train, y_pred_train))

# Step 11: Save the trained model
joblib.dump(svm_model, 'lung_cancer_svm_smote_model.joblib')

# Optional: Confirm model saved
# print("\nModel saved successfully as 'lung_cancer_svm_smote_model.joblib'.")

import sys
import joblib
import numpy as np
import os


# Load the trained model (ensure the path to the model is correct)
#model_path = '../ML_models/lung_cancer_model.joblib'  # Update the path if needed
model_path = os.path.join(os.path.dirname(__file__), '../ML_models/lung_cancer_svm_smote_model.joblib')
svm_model = joblib.load(model_path)

# Get the input features from the command-line arguments
# The features will be passed as strings, so convert them to floats
input_features = np.array([float(x) for x in sys.argv[1:]]).reshape(1, -1)

# Make a prediction using the loaded model
prediction = svm_model.predict(input_features)

# Print the result (Node.js will capture this output)
print(prediction[0])  # Output only the predicted class label

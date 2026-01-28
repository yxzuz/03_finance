import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from keras.models import Sequential
from keras.layers import Dense
from keras.callbacks import EarlyStopping

import glob
import matplotlib.pyplot as plt
import seaborn as sns
# oversamples the minority class in the training set.
from imblearn.over_sampling import SMOTE
from collections import Counter

# Load and combine the datasets
df = pd.read_csv("../../data/creditcard.csv")
# Class (0=legit, 1=fraud).

# splitting the data before scaling
X = df.drop('Class', axis=1)
y = df["Class"]

# Critical to split before scaling/SMOTE to prevent data leakage.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)  # means y class imbalance

# Preprocessing
# Create copies to avoid SettingWithCopyWarning
X_train = X_train.copy()
X_test = X_test.copy()

scaler = StandardScaler()

# Fit and Transform the "Amount" col on training data
X_train['Amount'] = scaler.fit_transform(
    X_train['Amount'].values.reshape(-1, 1))
X_test['Amount'] = scaler.transform(X_test['Amount'].values.reshape(-1, 1))

# Refit and transform the "Time" col on training data
X_train['Time'] = scaler.fit_transform(X_train['Time'].values.reshape(-1, 1))
X_test['Time'] = scaler.transform(X_test['Time'].values.reshape(-1, 1))


# Balance the training data using SMOTE (only apply to training)
print("Before SMOTE:", Counter(y_train))
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print("After SMOTE:", Counter(y_train_resampled))

# Further split training data into training and validation sets
X_train_final, X_val, y_train_final, y_val = train_test_split(
    X_train_resampled, y_train_resampled, test_size=0.2, random_state=42, stratify=y_train_resampled)

print("Training set class distribution: ", Counter(y_train_final))
print("Validation set class distribution: ", Counter(y_val))
print("Test set class distribution: ", Counter(y_test))


# Model Building
model = Sequential()
model.add(Dense(30, activation='relu', input_shape=(
    X_train_final.shape[1],)))  # use 30 cols (features)
model.add(Dense(15, activation='relu'))  # hidden layer
# binary classification predict 0 or 1 for fraud
model.add(Dense(1, activation='sigmoid'))

print(model.summary())

# Model Compilation
model.compile(optimizer='adam', loss='binary_crossentropy',
              metrics=['accuracy'])

# Early Stopping
early_stopping = EarlyStopping(
    monitor='val_loss', patience=3, restore_best_weights=True)

# Model Training
history = model.fit(X_train_final, y_train_final,
                    epochs=50,
                    batch_size=2048,
                    validation_data=(X_val, y_val),
                    callbacks=[early_stopping], verbose=1)

# Model Evaluation
loss, accuracy = model.evaluate(X_test, y_test)
print("Loss:", loss)
print("Accuracy:", accuracy)

# Predictions
y_pred = model.predict(X_test)
y_pred = (y_pred > 0.5).astype(int)
print(classification_report(y_test, y_pred))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=[
            'No Fraud', 'Fraud'], yticklabels=['No Fraud', 'Fraud'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.savefig("../../outputs/confusion_matrix.png")
plt.show()

# calculate and print correct predictions
tn, fp, fn, tp = cm.ravel()
total_correct = tn + tp
total_samples = cm.sum()
print(f"Total Correct Predictions: {total_correct} out of {total_samples}")

# Save the model
model.save("../../models/fraud_detection_model.h5")

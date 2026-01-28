import os
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import glob
from sklearn.preprocessing import StandardScaler
from typing import List

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    features: List[float]


BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "fraud_detection_model.h5"
DATA_PATH = BASE_DIR / "data" / "creditcard.csv"

# Global variables to store the model and scaler
fraud_detection_model = None
credit_card_dat = None
scaler = None


def create_and_save_model():
    # Create a simple sequential model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(30,)),  # Assuming 30 features as input
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy',
                  metrics=['accuracy'])
    model.save(MODEL_PATH)
    return model


@app.on_event("startup")
async def load_resources():
    global fraud_detection_model, credit_card_data, scaler
    print("Loading AI model and data...")
    # Load or create the model
    if MODEL_PATH.exists():
        fraud_detection_model = tf.keras.models.load_model(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print("No trained model found. Please train the model first.")
        fraud_detection_model = create_and_save_model()

    # Load the credit card data
    if os.path.exists(DATA_PATH):
        try:
            credit_card_data = pd.read_csv(DATA_PATH)
            print(f"Credit card data loaded from {DATA_PATH}")
            print("Total records loaded:", len(credit_card_data))
        except Exception as e:
            print(f"Error loading credit card data: {e}")
            credit_card_data = None
    else:
        all_files = glob.glob(str(DATA_PATH))
        if all_files:
            try:
                list_df = []
                for file in all_files:
                    df = pd.read_csv(file)
                    list_df.append(df)
                credit_card_data = pd.concat(list_df, ignore_index=True)
                print(
                    f"Credit card data loaded from multiple files matching {DATA_PATH}")
                print("Total records loaded:", len(credit_card_data))
            except Exception as e:
                print(
                    f"Error loading credit card data from multiple files: {e}")
                credit_card_data = None
        else:
            print(f"No credit card data files found at {DATA_PATH}")
            credit_card_data = None

    # Initialize scaler
    if credit_card_data is not None:
        scaler = StandardScaler()
        scaler.fit(credit_card_data[['Amount', 'Time']])
        print("Scaler initialized.")


@app.get("/")
async def root():
    # Basic health check endpoint
    return {"message": "Fraud Detection API", "status": "running"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": fraud_detection_model is not None
    }


@app.get("/data-summary")
async def get_data_summary():
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    fraud_count = credit_card_data['Class'].sum()
    total_transactions = len(credit_card_data)
    non_fraud_count = total_transactions - fraud_count
    return {
        "total_transactions": total_transactions,
        "fraud_count": int(fraud_count),
        "non_fraud_count": int(non_fraud_count),
        "fraud_percentage": float(fraud_count / total_transactions * 100)
    }


@app.get("/time-series")
async def get_time_series_data():
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    # Group by time periods for time series (simplified)
    data = credit_card_data.copy()
    data['time_period'] = (data['Time'] // 3600).astype(int)  # Group by hours
    time_series = data.groupby('time_period').size().reset_index()
    time_series.columns = ['time_period', 'transaction_count']

    return {
        # Limit for performance
        "labels": time_series['time_period'].tolist()[:50],
        "data": time_series['transaction_count'].tolist()[:50]
    }


@app.get("/amount-distribution")
async def get_amount_distribution():
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    # Create amount distribution bins
    import numpy as np
    amounts = credit_card_data['Amount']
    bins = [0, 50, 100, 500, 1000, 5000, float('inf')]
    labels = ['0-50', '51-100', '101-500', '501-1000', '1001-5000', '5000+']

    distribution = pd.cut(amounts, bins=bins, labels=labels,
                          include_lowest=True).value_counts()

    return {
        "labels": labels,
        "data": distribution.tolist()
    }


@app.get("/fraud-time-series")
async def get_fraud_time_series():
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    # Get fraud transactions time series
    fraud_data = credit_card_data[credit_card_data['Class'] == 1].copy()
    fraud_data['time_period'] = (fraud_data['Time'] // 3600).astype(int)
    fraud_series = fraud_data.groupby('time_period').size().reset_index()
    fraud_series.columns = ['time_period', 'fraud_count']

    return {
        "labels": fraud_series['time_period'].tolist()[:50],
        "data": fraud_series['fraud_count'].tolist()[:50]
    }


@app.get("/fraud-amount-distribution")
async def get_fraud_amount_distribution():
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    # Amount distribution for fraud transactions only
    import numpy as np
    fraud_amounts = credit_card_data[credit_card_data['Class'] == 1]['Amount']
    bins = [0, 50, 100, 500, 1000, 5000, float('inf')]
    labels = ['0-50', '51-100', '101-500', '501-1000', '1001-5000', '5000+']

    distribution = pd.cut(fraud_amounts, bins=bins,
                          labels=labels, include_lowest=True).value_counts()

    return {
        "labels": labels,
        "data": distribution.tolist()
    }


@app.get("/transactions")
async def get_transactions(
    skip: int = 0,
    limit: int = 50,
    min_amount: float = None,
    max_amount: float = None,
    transaction_class: int = None,
    min_time: float = None,
    max_time: float = None,
):
    if credit_card_data is None:
        raise HTTPException(
            status_code=503, detail="Credit card data not loaded")

    filtered_data = credit_card_data.copy()

    # Apply filters
    if min_amount is not None:
        filtered_data = filtered_data[filtered_data['Amount'] >= min_amount]
    if max_amount is not None:
        filtered_data = filtered_data[filtered_data['Amount'] <= max_amount]
    if transaction_class is not None:
        filtered_data = filtered_data[filtered_data['Class']
                                      == transaction_class]
    if min_time is not None:
        filtered_data = filtered_data[filtered_data['Time'] >= min_time]
    if max_time is not None:
        filtered_data = filtered_data[filtered_data['Time'] <= max_time]

    total_filtered = len(filtered_data)
    paginated_data = filtered_data.iloc[skip: skip + limit]

    return {
        "transactions": paginated_data.to_dict('records'),
        "total": total_filtered,
        "skip": skip,
        "limit": limit
    }


@app.post("/predict")
async def predict_fraud(request: PredictionRequest):
    if fraud_detection_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        import numpy as np
        # Convert to numpy array and reshape
        data = np.array(request.features).reshape(1, -1)
        prediction = fraud_detection_model.predict(data)
        is_fraud = bool(prediction[0][0] > 0.5)
        confidence = float(prediction[0][0])

        return {
            "prediction": "Fraudulent" if is_fraud else "Legitimate",
            "probability": confidence,
            "is_fraud": is_fraud,
            "confidence": confidence,
            "prediction_score": confidence
        }
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

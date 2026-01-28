# 🏦 AI-Enabled Fraud Detection System

A modern, full-stack machine learning application for real-time credit card fraud detection featuring a neural network model, FastAPI backend, and React dashboard with interactive data visualizations.

## ✨ Features

- 🤖 **Advanced ML Model**: Neural network trained on credit card transaction data
- 📊 **Interactive Dashboard**: Real-time analytics with Chart.js visualizations
- 🔍 **Transaction Analysis**: Time series analysis and amount distribution insights
- 🎯 **Real-time Prediction**: Live fraud detection API with confidence scoring
- 📱 **Modern UI/UX**: Responsive React interface with professional styling
- 🔒 **Data Security**: Secure API endpoints with proper validation

## 🏗️ Project Architecture

```
03_finance/
├── src/
│   ├── backend/                 # FastAPI backend service
│   │   ├── main.py             # API endpoints & ML model serving
│   │   └── requirements.txt    # Python dependencies
│   ├── frontend/               # React frontend application
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── Dashboard.js      # Analytics dashboard
│   │   │   │   ├── PredictionForm.js # Fraud prediction form
│   │   │   │   └── TransactionList.js# Transaction browser
│   │   │   ├── App.js          # Main React app
│   │   │   ├── App.css         # Modern styling
│   │   │   └── api.js          # API client functions
│   │   ├── package.json        # Node.js dependencies
│   │   └── README.md           # React-specific docs
│   └── ml/                     # Machine learning pipeline
│       └── train.py            # Model training script
├── models/                     # Trained model artifacts
│   └── fraud_detection_model.h5
├── data/                       # Dataset files
│   └── creditcard.csv          # Credit card transactions dataset
└── env/                        # Python virtual environment
```

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### ⚠️ Important: Data Files Required

**You need to add data files yourself.** This repository does not include the dataset due to file size limitations.

**Required dataset:**

- Download the Credit Card Fraud Detection dataset from [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud/data)
- Place the `creditcard.csv` file in the `data/` directory
- See [data/README.md](data/README.md) for detailed instructions

### 1. Environment Setup

```bash
# Clone and navigate to project
cd 03_finance

# Activate Python virtual environment
source env/bin/activate

# Verify Python environment
python --version
```

### 2. Backend Setup & Launch

```bash
# Navigate to backend directory
cd src/backend

# Install Python dependencies (if not already installed)
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

Backend will be available at: **http://localhost:8000**

### 3. Frontend Setup & Launch

```bash
# Open new terminal and navigate to frontend
cd src/frontend

# Install Node.js dependencies (if not already installed)
npm install

# Start the React development server
npm start
```

Frontend will be available at: **http://localhost:3000**

## 🎯 Using the Application

### Dashboard Analytics

- **Transaction Overview**: View total, fraudulent, and legitimate transaction counts
- **Time Series Analysis**: Analyze transaction patterns over time
- **Amount Distribution**: Understand transaction amount patterns
- **Class Distribution**: Visual representation of fraud vs legitimate transactions

### Fraud Prediction

1. Navigate to the "Predict" tab
2. Fill in the 30 transaction features (Time, V1-V28, Amount)
3. Click "Predict Fraud" to get real-time fraud probability
4. View confidence score and prediction result

### Transaction Browser

- Browse and search through transaction records
- Filter by amount range, transaction class, and time period
- View detailed transaction features and classifications

## 🔧 API Endpoints

| Method | Endpoint                     | Description                   | Response                           |
| ------ | ---------------------------- | ----------------------------- | ---------------------------------- |
| `GET`  | `/`                          | API status check              | Basic API information              |
| `GET`  | `/health`                    | Health check                  | Service health status              |
| `GET`  | `/data-summary`              | Transaction summary stats     | Total, fraud, legitimate counts    |
| `GET`  | `/time-series`               | Hourly transaction data       | Time series for total transactions |
| `GET`  | `/fraud-time-series`         | Hourly fraud data             | Time series for fraud transactions |
| `GET`  | `/amount-distribution`       | Amount distribution data      | Histogram data for amounts         |
| `GET`  | `/fraud-amount-distribution` | Fraud amount distribution     | Histogram for fraud amounts        |
| `GET`  | `/transactions`              | Transaction list with filters | Paginated transaction records      |
| `POST` | `/predict`                   | Fraud prediction              | `{"features": [30 float values]}`  |

### Example API Usage

```bash
# Check API health
curl http://localhost:8000/health

# Get transaction summary
curl http://localhost:8000/data-summary

# Make fraud prediction
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"features": [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 149.62, 0]}'

# Get transaction list with filters
curl "http://localhost:8000/transactions?skip=0&limit=10&min_amount=100&max_amount=1000"
```

## 🤖 Machine Learning Model

### Model Architecture

- **Input Layer**: 30 features (Time, V1-V28 PCA components, Amount)
- **Hidden Layer**: 15 neurons with ReLU activation
- **Output Layer**: 1 neuron with sigmoid activation (binary classification)
- **Optimizer**: Adam with learning rate 0.001
- **Loss Function**: Binary crossentropy

### Data Preprocessing

- **Standardization**: StandardScaler applied to Amount and Time features
- **Class Balancing**: SMOTE (Synthetic Minority Oversampling Technique)
- **Feature Engineering**: PCA-transformed features (V1-V28) from original dataset

### Model Performance

- **Training Dataset**: 284,807 transactions
- **Class Distribution**: Highly imbalanced (0.17% fraud rate)
- **Evaluation Metrics**: Precision, Recall, F1-Score, Confusion Matrix

## 🛠️ Technology Stack

### Backend

- **Framework**: FastAPI (Python)
- **ML Libraries**: TensorFlow/Keras, Scikit-learn
- **Data Processing**: Pandas, NumPy
- **API Features**: CORS enabled, Pydantic validation
- **Model Serving**: Real-time inference

### Frontend

- **Framework**: React 18
- **UI Components**: React Bootstrap
- **Data Visualization**: Chart.js with react-chartjs-2
- **HTTP Client**: Fetch API
- **Styling**: Modern CSS with gradients and animations

### Development Tools

- **Environment**: Python virtual environment
- **Package Management**: pip (Python), npm (Node.js)
- **API Documentation**: FastAPI auto-generated OpenAPI docs

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**

```bash
# Ensure virtual environment is activated
source env/bin/activate

# Check if model file exists
ls models/fraud_detection_model.h5

# Verify dataset is present
ls data/creditcard.csv
```

**Frontend build errors:**

```bash
# Clear npm cache and reinstall
cd src/frontend
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**

- Ensure backend is running on port 8000
- Check that CORS is properly configured in FastAPI

**Model loading errors:**

- Verify TensorFlow/Keras version compatibility
- Ensure model file is not corrupted
- Check that all required dependencies are installed

---

For detailed API documentation, visit: http://localhost:8000/docs when the backend is running.

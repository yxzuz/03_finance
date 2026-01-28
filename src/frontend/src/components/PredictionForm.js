import React, {useState} from 'react';
import {Form, Button, Container, Row, Col, Card, Alert} from 'react-bootstrap';
import { postPrediction } from '../api';

const PredictionForm = () => {
    const [formData, setFormData] = useState({
        // Initializa dummy features; replace with actual features
        Time: 0, Amount: 0, V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: 0, V7: 0, V8: 0, V9: 0, V10: 0,
        V11: 0, V12: 0, V13: 0, V14: 0, V15: 0, V16: 0, V17: 0, V18: 0, V19: 0, V20: 0, V21: 0,
        V22: 0, V23: 0, V24: 0, V25: 0, V26: 0, V27: 0, V28: 0
    });
    const [predictionResult, setPredictionResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value === '' ? 0 : parseFloat(value) || 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPredictionResult(null);
        
        // Validate that all values are numbers and not NaN
        const cleanedData = {};
        for (const [key, value] of Object.entries(formData)) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                setError(`Invalid value for ${key}. Please enter a valid number.`);
                setLoading(false);
                return;
            }
            cleanedData[key] = numValue;
        }
        
        // Convert to the format expected by the backend
        // The model expects features in the order: Time, V1-V28, Amount
        const featuresArray = [
            cleanedData.Time,
            ...Array.from({length: 28}, (_, i) => cleanedData[`V${i + 1}`]),
            cleanedData.Amount
        ];
        
        try {
            const response = await postPrediction({ features: featuresArray });
            if (response) {
                setPredictionResult(response);
            } else {
                setError('No prediction result returned');
            }
        } catch (err) {
            console.error('Prediction error:', err);
            if (err.message) {
                setError(err.message);
            } else if (typeof err === 'object') {
                setError('Failed to get prediction. Please check your input values.');
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    };
     // Helper function to render form inputs
    const renderFormInputs = () => {
        const vFeatures = [];
        for (let i = 1; i <= 28; i++) {
            vFeatures.push(
                <Form.Group as={Col} md="3" className="mb-3" key={`V${i}`}>
                    <Form.Label>{`V${i}`}</Form.Label>
                    <Form.Control
                        type="number"
                        step="any"
                        name={`V${i}`}
                        value={formData[`V${i}`] || 0}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
            );
        }
        return vFeatures;
};

    return ( 
        <Container className="mt-4">
            <h2 className="mb-4">Fraud Prediction</h2>
            <Card className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                            <Form.Group controlId="formTime">
                                <Form.Label>Time (seconds since first transaction)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    name="Time"
                                    value={formData.Time || 0}
                                    onChange={handleChange}
                                    placeholder="Enter Time"
                                />
                            </Form.Group>
                            </Col>
                            <Col md={6}>
                            <Form.Group controlId="formAmount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    name="Amount"
                                    value={formData.Amount || 0}
                                    onChange={handleChange}
                                    placeholder="Enter Amount"
                                />
                            </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            {renderFormInputs()}
                        </Row>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Predicting...' : 'Predict Fraud'}
                        </Button>
                    </Form>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                {predictionResult && (
                    <Card className={`mt-3 p-3 ${predictionResult.prediction === "Fraudulent" ? 'border-danger' : 'border-success'}`}>
                        <Card.Body>
                            <Card.Title>Prediction Result: {predictionResult.prediction}</Card.Title>
                            <p className='text-center h4'>
                                Status: <span className={predictionResult.prediction === "Fraudulent" ? 'text-danger' : 'text-success'}>{predictionResult.prediction}</span>
                            </p>
                            <p className='text-center'></p>
                            <p>Probability of Fraud: <strong>{(predictionResult.probability * 100).toFixed(2)}%</strong></p>
                        </Card.Body>
                    </Card>
                )}
            </Card>
        </Container>
    );
};

export default PredictionForm;

                            

     
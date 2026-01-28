import React, {useEffect, useState} from 'react';
import {Card, Row, Col, Container} from 'react-bootstrap';
import {Pie, Line, Bar} from 'react-chartjs-2';
import {
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { fetchDataSummary, fetchTimeSeriesData, fetchAmountDistributionData, fetchFraudTimeSeriesData, fetchFraudAmountDistributionData } from '../api';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Filler
);


const Dashboard = () => {
    const [summary, setSummary] = useState({});
    const [timeSeriesData, setTimeSeriesData] = useState({});
    const [fraudTimeSeriesData, setFraudTimeSeriesData] = useState({});
    const [amountDistributionData, setAmountDistributionData] = useState({});
    const [fraudAmountDistributionData, setFraudAmountDistributionData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const getData = async () => {
            try {
                const summary = await fetchDataSummary();
                setSummary(summary);
                
                const tsData = await fetchTimeSeriesData();
                setTimeSeriesData(tsData);

                const fraudTsData = await fetchFraudTimeSeriesData();
                setFraudTimeSeriesData(fraudTsData);

                const amountData = await fetchAmountDistributionData();
                setAmountDistributionData(amountData);

                const fraudAmountData = await fetchFraudAmountDistributionData();
                setFraudAmountDistributionData(fraudAmountData);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        getData();
    }, []);
    if (loading) 
        return <Container className="mt-4">Loading Dashboard Data...</Container>;
    if (error) 
        return <Container className="mt-4">Error: {error}</Container>;
    
    if (!summary)
        return <Container className="mt-4">No summary data Available</Container>;

    const pieChartData ={
        labels: ['Non-Fraudulent', 'Fraudulent'],
        datasets: [{
            data: [summary.non_fraud_count, summary.fraud_count],
            backgroundColor: ['#3498db', '#e74c3c'],
            hoverBackgroundColor: ['#2980b9', '#c0392b'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const totalLineChartData = {
        labels: timeSeriesData ? timeSeriesData.labels.map(h => `${h}:00`) : [],
        datasets: [
            {
                label: 'Total Transactions per Hour',
                data: timeSeriesData ? timeSeriesData.data : [],
                fill: false,
                backgroundColor: 'hsla(204, 82%, 57%, 0.60)',
                borderColor: 'hsla(204, 82%, 57%, 0.60)',
                tension: 0.1,
            },
        ],
    };

    // fraud transaction counts per hour (only fraud subset).
    const fraudLineChartData = {
        labels: fraudTimeSeriesData ? fraudTimeSeriesData.labels.map(h => `${h}:00`) : [],
        datasets: [
            {
                label: 'Fraudulent Transactions per Hour',
                data: fraudTimeSeriesData ? fraudTimeSeriesData.data : [],
                fill: false,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 0.6)',
                tension: 0.1,
            },
        ],
    };

    const nonFraudBarChartData = {
        labels: amountDistributionData ? amountDistributionData.labels : [],
        datasets: [
            {
                label: 'Non-Fraudulent Transactions Amount Distribution',
                data: amountDistributionData && fraudAmountDistributionData ? amountDistributionData.data.map((total, index) => total - (fraudAmountDistributionData.data[index] || 0)) : [],
                backgroundColor: 'hsla(204, 82%, 57%, 0.60)',
            },
        ],
    };

    const fraudBarChartData = {
        labels: fraudAmountDistributionData ? fraudAmountDistributionData.labels : [],
        datasets: [
            {
                label: 'Fraudulent Transactions Amount Distribution',
                data: fraudAmountDistributionData ? fraudAmountDistributionData.data : [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
        ],
    };

    return (
        <Container className="mt-4">
            <h2 className="dashboard-title">Fraud Detection Dashboard</h2>
            <Row className="fade-in-up">
                <Col md={4}>
                    <Card className="stat-card text-center mb-4">
                        <Card.Body>
                            <Card.Title>Total Transactions</Card.Title>
                            <div className="stat-number">{summary.total_transactions}</div>
                        </Card.Body>
                    </Card>
                </Col>                
                <Col md={4}>
                    <Card className="stat-card text-center mb-4">
                        <Card.Body>
                            <Card.Title>Non-Fraudulent Transactions</Card.Title>
                            <div className="stat-number success">{summary.non_fraud_count}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="stat-card text-center mb-4">
                        <Card.Body>
                            <Card.Title>Fraudulent Transactions</Card.Title>
                            <div className="stat-number danger">{summary.fraud_count}</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="fade-in-up">
                <Col lg={5} md={6} className="mb-4">
                    <Card className="chart-card">
                        <Card.Body>
                            <h5 className="chart-title">Transaction Class Distribution</h5>
                            <div className="chart-container" style=
                            {{marginTop: "60px"}}>
                            <Pie key="pie-chart" data={pieChartData} options={{
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            padding: 20,
                                            usePointStyle: true
                                        }
                                    }
                                },
                                maintainAspectRatio: false
                            }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={7} md={6}>
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="chart-card">
                                <Card.Body>
                                    <h5 className="chart-title">Total Transactions Over Time</h5>
                                    <div className="chart-container-200" style={{margin: "auto"}}>
                                    <Line key="total-line-chart" data={totalLineChartData} options={{maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="chart-card">
                                <Card.Body>
                                    <h5 className="chart-title">Fraudulent Transactions Over Time</h5>
                                    <div className="chart-container-200" style={{margin: "auto"}}>
                                    <Line key="fraud-line-chart" data={fraudLineChartData} options={{maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="fade-in-up">
                <Col md={6}>
                    <Card className="chart-card">
                        <Card.Body>
                            <h5 className="chart-title">Non-Fraudulent Transaction Amount Distribution</h5>
                            <div className="chart-container">
                            <Bar key="non-fraud-bar-chart" data={nonFraudBarChartData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }},
                                scales: {
                                    y: { beginAtZero: true },
                                    x: { ticks: { maxRotation: 45 }}
                                }
                            }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="chart-card">
                        <Card.Body>
                            <h5 className="chart-title">Fraudulent Transaction Amount Distribution</h5>
                            <div className="chart-container">
                            <Bar key="fraud-bar-chart" data={fraudBarChartData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }},
                                scales: {
                                    y: { beginAtZero: true },
                                    x: { ticks: { maxRotation: 45 }}
                                }
                            }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

};
export default Dashboard;
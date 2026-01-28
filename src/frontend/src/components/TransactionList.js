import React, { useEffect, useState } from 'react';
import {Container, Table, Alert, Spinner, Form, Button, Row, Col} from 'react-bootstrap';
import {fetchTransactionList} from '../api';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);

    // state for pagination
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [transactionClass, setTransactionClass] = useState(''); // 0 for non-fraud, 1 for fraud, '' for all
    const [minTime, setMinTime] = useState('');
    const [maxTime, setMaxTime] = useState('');

     // Constants
     const transactionsLimit = 50;

     const getTransactions = async (filters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTransactionList(0, transactionsLimit, filters);    
            if ( data && data.transactions ) {
                setTransactions(data.transactions);
                setTotalResults(data.total);
            }
            else {
                setError('Failed to fetch transactions data');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTransactions({});
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const filters = {
            min_amount: minAmount !== '' ? parseFloat(minAmount) : null,
            max_amount: maxAmount !== '' ? parseFloat(maxAmount) : null,
            transaction_class: transactionClass !== '' ? parseInt(transactionClass) : null,
            min_time: minTime !== '' ? parseInt(minTime) : null,
            max_time: maxTime !== '' ? parseInt(maxTime) : null
        };
        getTransactions(filters);
    };
    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }
    if (error) {
        return <Container className="mt-4"><Alert variant="danger">Error: {error}</Alert></Container>;
    }
    return (
        <Container className="mt-4">
            <h2 className="mb-4">Transaction List</h2>
            <Form onSubmit={handleSearch} className="mb-4">
                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group controlId="MinAmount"> 
                        <Form.Label>Min Amount</Form.Label> 
                        <Form.Control
                            type="number"
                            step="any"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="Min Amount"
                        />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="MaxAmount"> 
                        <Form.Label>Max Amount</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            placeholder="Max Amount"
                        />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="minTime"> 
                        <Form.Label>Min Time(Seconds)</Form.Label>
                        <Form.Control
                            type="number"
                            value={minTime}
                            onChange={(e) => setMinTime(e.target.value)}
                            placeholder="Min Time"
                        />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="maxTime"> 
                        <Form.Label>Max Time(Seconds)</Form.Label>
                        <Form.Control
                            type="number"
                            value={maxTime}
                            onChange={(e) => setMaxTime(e.target.value)}
                            placeholder="Max Time"
                        />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="TransactionClass"> 
                        <Form.Label>Transaction Class</Form.Label>
                        <Form.Select
                            value={transactionClass}
                            onChange={(e) => setTransactionClass(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="0">Non-Fraudulent</option>
                            <option value="1">Fraudulent</option>
                        </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                        <Button variant="primary" type="submit">
                            Search
                        </Button>
                    </Col>
                        </Row>
                    </Form>
        
                    {totalResults > 0 && (
                       <Alert variant="info">
                            Total Transactions Found: {totalResults} Displaying {Math.min(transactions.length, transactionsLimit)} results.
                       </Alert>
                    )}
                    {transactions.length === 0 ? (
                        <Alert variant="warning">No transactions found.</Alert>
                    ) : (
          transactions.length > 0 && (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Amount</th>

              {/* Dynamically render V* feature headers */}
              {Object.keys(transactions[0])
                .filter((key) => key.startsWith("V"))
                .map((key) => (
                  <th key={key}>{key}</th>
                ))}

              <th>Class</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className={transaction.Class === 1 ? "table-danger" : ""}
              >
                <td>{index + 1}</td>
                <td>{transaction.Time}</td>
                <td>{transaction.Amount}</td>

                {/* Dynamically render V* feature data */}
                {Object.keys(transactions[0])
                  .filter((key) => key.startsWith("V"))
                  .map((key) => (
                    <td key={key}>
                      {transaction[key].toFixed(2)}
                    </td>
                  ))}

                <td>
                  {transaction.Class === 1 ? "Fraud" : "Legitimate"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ))}
    </Container>
  );
};

export default TransactionList;
    
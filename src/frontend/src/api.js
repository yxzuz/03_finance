const API_BASE_URL = 'http://localhost:8000'; // backend URL

export const fetchDataSummary= async() => {
    try {
    const response = await fetch(`${API_BASE_URL}/data-summary`);
    if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
    }
    const data = await response.json();
    return data;
    } catch (error) {
    console.error('Error fetching data summary:', error);
    throw error;
    }
};

export const postPrediction = async (transactionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) {
            let errorMessage = `HTTP error ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(err => 
                            `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
                        ).join(', ');
                    } else if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else {
                        errorMessage = JSON.stringify(errorData.detail);
                    }
                }
            } catch (parseError) {
                // If we can't parse the error response, use the status
                console.error('Could not parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error posting prediction:', error);
        throw error;
    }
};

export const fetchTransactionList = async (skip=0, limit=50, filters={}) => {
    try {
        const params = new URLSearchParams({ skip, limit});
        for (const key in filters) {
            if (filters[key] != null && filters[key] !== '' && filters[key] !== undefined) {
                params.append(key, filters[key]);
            }
        }
        const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`);
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching transaction list:', error);
        throw error;
    }
};

export const fetchTimeSeriesData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/time-series`);
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching time series data:', error);
        throw error;
    }
}

export const fetchAmountDistributionData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/amount-distribution`);
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching amount distribution data:', error);
        throw error;
    }
};

export const fetchFraudTimeSeriesData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/fraud-time-series`);
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fraud time series data:', error);
        throw error;
    }
};

export const fetchFraudAmountDistributionData = async () => {
    // histogram data for fraud transactions
    try {
        const response = await fetch(`${API_BASE_URL}/fraud-amount-distribution`);
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fraud amount distribution data:', error);
        throw error;
    }
};
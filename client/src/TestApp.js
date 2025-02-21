import React, { useState } from 'react';

function TestApp() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = 'http://localhost:3002/api';

    const testGet = async () => {
        setLoading(true);
        setResult('Loading...');
        try {
            console.log('Sending GET request to:', `${API_URL}/flights`);
            const response = await fetch(`${API_URL}/flights`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            console.log('GET response status:', response.status);
            const data = await response.json();
            setResult('GET success: ' + JSON.stringify(data));
        } catch (error) {
            console.error('GET error details:', error);
            setResult('GET error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const testPost = async () => {
        setLoading(true);
        setResult('Loading...');
        try {
            console.log('Sending POST request to:', `${API_URL}/flights`);
            const response = await fetch(`${API_URL}/flights`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    time: '1200',
                    callsign: 'TEST',
                    type: 'PPL',
                    destination: 'TEST'
                })
            });
            console.log('POST response status:', response.status);
            const data = await response.json();
            setResult('POST success: ' + JSON.stringify(data));
        } catch (error) {
            console.error('POST error details:', error);
            setResult('POST error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>API Test</h1>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testGet} 
                    disabled={loading}
                    style={{ marginRight: '10px' }}
                >
                    Test GET
                </button>
                <button 
                    onClick={testPost} 
                    disabled={loading}
                >
                    Test POST
                </button>
            </div>
            <pre style={{ 
                padding: '10px', 
                background: '#f5f5f5', 
                border: '1px solid #ddd' 
            }}>
                {result}
            </pre>
        </div>
    );
}

export default TestApp;

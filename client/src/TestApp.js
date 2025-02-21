import React, { useState } from 'react';

function TestApp() {
    const [result, setResult] = useState('');
    const API_URL = 'http://localhost:3002/api';

    const testGet = async () => {
        try {
            const response = await fetch(`${API_URL}/flights`);
            const data = await response.json();
            setResult('GET success: ' + JSON.stringify(data));
        } catch (error) {
            setResult('GET error: ' + error.message);
        }
    };

    const testPost = async () => {
        try {
            const response = await fetch(`${API_URL}/flights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time: '1200',
                    callsign: 'TEST',
                    type: 'PPL',
                    destination: 'TEST'
                })
            });
            const data = await response.json();
            setResult('POST success: ' + JSON.stringify(data));
        } catch (error) {
            setResult('POST error: ' + error.message);
        }
    };

    return (
        <div>
            <h1>API Test</h1>
            <button onClick={testGet}>Test GET</button>
            <button onClick={testPost}>Test POST</button>
            <pre>{result}</pre>
        </div>
    );
}

export default TestApp;

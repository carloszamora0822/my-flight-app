import 'dotenv/config';

export async function updateVestaboard(matrix) {
    const apiKey = process.env.VESTA_API_KEY;
    
    if (!apiKey) {
        throw new Error('VESTA_API_KEY not configured');
    }

    try {
        // Send the raw matrix directly
        const response = await fetch('https://rw.vestaboard.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Vestaboard-Read-Write-Key': apiKey
            },
            body: JSON.stringify(matrix)  // Send matrix directly without wrapping
        });

        const data = await response.json();
        console.log('Vestaboard response:', data);
        return data;
    } catch (error) {
        console.error('Vestaboard error:', error);
        throw error;
    }
}

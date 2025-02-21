import 'dotenv/config';

export async function updateVestaboard(matrix) {
    console.log('[VESTA] Starting Vestaboard update...');
    const apiKey = process.env.VESTA_API_KEY;
    
    if (!apiKey) {
        throw new Error('VESTA_API_KEY not configured');
    }

    // Validate matrix format
    if (!Array.isArray(matrix) || matrix.length !== 6 || 
        !matrix.every(row => Array.isArray(row) && row.length === 22)) {
        throw new Error('Invalid matrix format - must be 6x22');
    }

    // Ensure all values are valid Vestaboard codes (0-70)
    const flatMatrix = matrix.flat();
    if (!flatMatrix.every(code => Number.isInteger(code) && code >= 0 && code <= 70)) {
        throw new Error('Invalid character codes - must be integers 0-70');
    }

    try {
        const response = await fetch('https://rw.vestaboard.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Vestaboard-Read-Write-Key': apiKey
            },
            body: JSON.stringify({
                characters: matrix.map(row => 
                    row.map(code => Math.min(Math.max(0, code), 70))
                )
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Vestaboard API error: ${response.status} - ${error}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[VESTA] Error:', error);
        throw error;
    }
}

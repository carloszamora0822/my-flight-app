import 'dotenv/config';

export async function updateVestaboard(matrix) {
    console.log('[VESTA] Starting Vestaboard update...');
    console.log('[VESTA] Environment check:', {
        hasVestaKey: !!process.env.VESTA_API_KEY,
        hasVestaboardKey: !!process.env.VESTABOARD_API_KEY,
        env: process.env.NODE_ENV
    });
    
    // Use VESTA_API_KEY instead of VESTABOARD_API_KEY
    const apiKey = process.env.VESTA_API_KEY;
    
    if (!apiKey) {
        console.error('[VESTA] API Key missing. Available env vars:', Object.keys(process.env));
        throw new Error('VESTA_API_KEY not configured');
    }
    console.log('[VESTA] API Key configured:', apiKey.substring(0, 4) + '...');

    try {
        console.log('[VESTA] Preparing API request...');
        const requestBody = { characters: matrix };
        console.log('[VESTA] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://rw.vestaboard.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Vestaboard-Read-Write-Key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        console.log('[VESTA] API Response status:', response.status);
        console.log('[VESTA] API Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[VESTA] API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Vestaboard API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[VESTA] API Success:', data);
        return data;
    } catch (error) {
        console.error('[VESTA] Error:', {
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack
        });
        throw error;
    }
}

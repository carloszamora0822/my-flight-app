import 'dotenv/config';

export async function updateVestaboard(matrix) {
    console.log('Updating Vestaboard with matrix:', matrix);

    try {
        const response = await fetch('https://rw.vestaboard.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Vestaboard-Read-Write-Key': process.env.VESTABOARD_API_KEY
            },
            body: JSON.stringify({ characters: matrix })
        });

        if (!response.ok) {
            throw new Error(`Vestaboard API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Vestaboard update successful:', data);
        return data;
    } catch (error) {
        console.error('Vestaboard update failed:', error);
        throw error;
    }
}

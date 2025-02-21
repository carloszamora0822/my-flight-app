const VESTA_CHARS = {
    ' ': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7,
    'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15,
    'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23,
    'X': 24, 'Y': 25, 'Z': 26, '1': 27, '2': 28, '3': 29, '4': 30, '5': 31,
    '6': 32, '7': 33, '8': 34, '9': 35, '0': 36, '!': 37, '@': 38, '#': 39,
    '$': 40, '(': 41, ')': 42, '-': 44, '+': 46, '&': 47, '=': 48, ';': 49,
    ':': 50, "'": 52
};

function padString(str, length) {
    return (str + ' '.repeat(length)).slice(0, length);
}

function stringToVestaboard(str) {
    return str.toUpperCase().split('').map(char => VESTA_CHARS[char] || VESTA_CHARS[' ']);
}

function getFormattedDate() {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${month}${day}`;
}

function createHeaderRow() {
    // Create header: CHECKRIDE MMDD
    const date = getFormattedDate();
    const headerText = `CHECKRIDE ${date}`;
    
    // Pad to 22 characters with spaces
    const paddedHeader = (headerText + ' '.repeat(22)).slice(0, 22);
    
    console.log('[MATRIX] Header string:', paddedHeader);
    return stringToVestaboard(paddedHeader);
}

function createFlightRow(flight) {
    // Format each field with specific widths
    const rowParts = [
        padString(flight.time, 6),           // 6 chars for time
        padString(flight.callsign, 8),       // 8 chars for callsign
        padString(flight.type, 4),           // 4 chars for type
        padString(flight.destination, 4)      // 4 chars for destination
    ];
    
    const rowString = rowParts.join('');
    console.log('[MATRIX] Flight row string:', rowString);
    return stringToVestaboard(rowString);
}

export function createVestaMatrix(flights) {
    console.log('[MATRIX] Creating matrix for flights:', flights);

    // Create 6x22 matrix filled with spaces (code 0)
    const matrix = Array(6).fill().map(() => Array(22).fill(0));
    
    try {
        // Set header row
        const header = createHeaderRow();
        matrix[0] = header.slice(0, 22);
        
        // Add flight rows (up to 5 flights)
        flights.slice(0, 5).forEach((flight, index) => {
            const row = createFlightRow(flight);
            matrix[index + 1] = row.slice(0, 22);
        });

        // Log the final matrix in a readable format
        console.log('[MATRIX] Final matrix rows:');
        matrix.forEach((row, i) => {
            console.log(`Row ${i}:`, row.map(code => 
                Object.entries(VESTA_CHARS).find(([char, val]) => val === code)?.[0] || ' '
            ).join(''));
        });

        return matrix;
    } catch (error) {
        console.error('[MATRIX] Error:', error);
        throw error;
    }
}

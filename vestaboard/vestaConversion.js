const VESTA_CHARS = {
    ' ': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7,
    'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15,
    'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23,
    'X': 24, 'Y': 25, 'Z': 26, '1': 27, '2': 28, '3': 29, '4': 30, '5': 31,
    '6': 32, '7': 33, '8': 34, '9': 35, '0': 36, '!': 37, '@': 38, '#': 39,
    '$': 40, '(': 41, ')': 42, '-': 44, '+': 46, '&': 47, '=': 48, ';': 49,
    ':': 50, "'": 52
};

function createHeaderRow() {
    // Create header: TIME | CALLSIGN | TYPE | DEST
    const header = 'TIME CALLSIGN TYPE DEST'.split('')
        .map(char => VESTA_CHARS[char] || VESTA_CHARS[' ']);
    console.log('[MATRIX] Header created:', header);
    return header;
}

function formatFlightData(flight) {
    // Format: [TIME] [CALLSIGN] [TYPE] [DEST]
    const time = flight.time.padEnd(4);           // 4 chars for time
    const callsign = flight.callsign.padEnd(8);   // 8 chars for callsign
    const type = flight.type.padEnd(4);           // 4 chars for type
    const dest = flight.destination.padEnd(6);    // 6 chars for destination

    const formatted = `${time} ${callsign} ${type} ${dest}`;
    console.log('[MATRIX] Formatted flight data:', formatted);
    return formatted;
}

function createFlightRow(flight) {
    console.log('[MATRIX] Creating row for flight:', flight);
    
    const formattedData = formatFlightData(flight);
    const row = formattedData
        .split('')
        .map(char => {
            const code = VESTA_CHARS[char.toUpperCase()];
            if (code === undefined) {
                console.warn(`Invalid char "${char}", using space`);
                return VESTA_CHARS[' '];
            }
            return code;
        });

    console.log('[MATRIX] Created row:', row);
    return row;
}

export function createVestaMatrix(flights) {
    console.log('[MATRIX] Creating matrix for flights:', flights);

    // Initialize 6x22 matrix with spaces
    const matrix = Array(6).fill().map(() => Array(22).fill(VESTA_CHARS[' ']));
    
    try {
        // Set header row
        matrix[0] = createHeaderRow();
        
        // Add flight rows
        flights.slice(0, 5).forEach((flight, index) => {
            matrix[index + 1] = createFlightRow(flight);
        });

        console.log('[MATRIX] Final matrix:', matrix);
        return matrix;
    } catch (error) {
        console.error('[MATRIX] Error:', error);
        throw error;
    }
}

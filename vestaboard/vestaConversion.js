const VESTA_CHARS = {
    ' ': 0,
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
    'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25,
    'Z': 26, '1': 27, '2': 28, '3': 29, '4': 30, '5': 31, '6': 32, '7': 33,
    '8': 34, '9': 35, '0': 36
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
    const date = getFormattedDate();
    const header = ('CHECKRIDE ' + date).padEnd(22);
    return stringToVestaboard(header);
}

function createFlightRow(flight) {
    // Format with exact spaces for alignment
    const formatted = [
        flight.time.padEnd(5),      // 5 chars
        ' ',                        // 1 space
        flight.callsign.padEnd(7),  // 7 chars
        ' ',                        // 1 space
        flight.type.padEnd(4),      // 4 chars
        ' ',                        // 1 space
        flight.destination.padEnd(3) // 3 chars (remaining space)
    ].join('');

    // Ensure exactly 22 characters
    return stringToVestaboard(formatted.slice(0, 22));
}

export function createVestaMatrix(flights) {
    // Initialize 6x22 matrix with zeros
    const matrix = [
        Array(22).fill(0),  // Header row
        Array(22).fill(0),  // Flight 1
        Array(22).fill(0),  // Flight 2
        Array(22).fill(0),  // Flight 3
        Array(22).fill(0),  // Flight 4
        Array(22).fill(0)   // Flight 5
    ];

    // Create header
    const header = 'CHECKRIDE'.split('').map(char => VESTA_CHARS[char.toUpperCase()] || 0);
    matrix[0].splice(0, header.length, ...header);

    // Add flights
    flights.slice(0, 5).forEach((flight, index) => {
        const rowIndex = index + 1;
        const flightInfo = [
            ...flight.time.split('').map(c => VESTA_CHARS[c] || 0),
            0, 0,  // spaces
            ...flight.callsign.toUpperCase().split('').map(c => VESTA_CHARS[c] || 0),
            0, 0,  // spaces
            ...flight.type.toUpperCase().split('').map(c => VESTA_CHARS[c] || 0),
            0, 0,  // spaces
            ...flight.destination.toUpperCase().split('').map(c => VESTA_CHARS[c] || 0)
        ];
        matrix[rowIndex].splice(0, flightInfo.length, ...flightInfo);
    });

    console.log('Generated matrix:', matrix);
    return matrix;
}

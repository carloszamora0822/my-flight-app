const VESTA_CHARS = {
    ' ': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7,
    'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15,
    'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23,
    'X': 24, 'Y': 25, 'Z': 26, '1': 27, '2': 28, '3': 29, '4': 30, '5': 31,
    '6': 32, '7': 33, '8': 34, '9': 35, '0': 36, '!': 37, '@': 38, '#': 39,
    '$': 40, '(': 41, ')': 42, '-': 44, '+': 46, '&': 47, '=': 48, ';': 49,
    ':': 50, "'": 52
};

function convertToVestaCode(text) {
    return text.toString()
        .toUpperCase()
        .split('')
        .map(char => VESTA_CHARS[char] || VESTA_CHARS[' ']);
}

function createFlightRow(flight) {
    const time = convertToVestaCode(flight.time.padEnd(5));
    const callsign = convertToVestaCode(flight.callsign.padEnd(7));
    const type = convertToVestaCode(flight.type.padEnd(4));
    const destination = convertToVestaCode(flight.destination.padEnd(6));
    
    return [...time, ...callsign, ...type, ...destination];
}

function createVestaMatrix(flights) {
    // Create empty 6x22 matrix filled with spaces
    const matrix = Array(6).fill().map(() => Array(22).fill(0));
    
    // Fill with flight data (up to 6 flights)
    flights.slice(0, 6).forEach((flight, index) => {
        const row = createFlightRow(flight);
        matrix[index] = row;
    });
    
    return matrix;
}

module.exports = { createVestaMatrix };

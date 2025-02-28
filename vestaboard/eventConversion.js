/**
 * This file handles converting event data into a format suitable for the Vestaboard display.
 * The Vestaboard has 6 rows and 22 columns, and uses special character codes.
 */

// Character map for Vestaboard
// 0-26 for A-Z, 27-36 for 0-9, then special characters
const CHAR_MAP = {
  ' ': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 
  'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 
  'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26, 
  '0': 27, '1': 28, '2': 29, '3': 30, '4': 31, '5': 32, '6': 33, '7': 34, '8': 35, '9': 36,
  '!': 37, '@': 38, '#': 39, '$': 40, '(': 41, ')': 42, '-': 44, '+': 43, '&': 45,
  '=': 46, ';': 47, ':': 48, "'": 49, '"': 50, '%': 51, ',': 52, '.': 53, '/': 54,
  '?': 55, '°': 56, '|': 94, '≠': 95, '~': 96 // Others exist but these are most useful
};

// Create a 6x22 matrix filled with spaces (code 0)
function createEmptyMatrix() {
  return Array(6).fill().map(() => Array(22).fill(0));
}

/**
 * Converts a character to its corresponding Vestaboard code
 * @param {string} char - The character to convert
 * @returns {number} - The Vestaboard code
 */
function charToVestaCode(char) {
  const upperChar = char.toUpperCase();
  return CHAR_MAP[upperChar] !== undefined ? CHAR_MAP[upperChar] : 0;
}

/**
 * Convert a string to an array of Vestaboard character codes
 * @param {string} str - The string to convert
 * @returns {number[]} - Array of Vestaboard character codes
 */
function stringToVestaCodes(str) {
  return str.split('').map(charToVestaCode);
}

/**
 * Generate a Vestaboard matrix for displaying events
 * @param {Array} events - Array of event objects with date, time, and description
 * @returns {number[][]} - 6x22 matrix of Vestaboard character codes
 */
export function createEventMatrix(events) {
  console.log('Creating event matrix with events:', events);
  
  // Create empty matrix
  const matrix = createEmptyMatrix();
  
  // Add title
  const titleCodes = stringToVestaCodes('UPCOMING EVENTS');
  for (let i = 0; i < titleCodes.length; i++) {
    if (i < 22) matrix[0][i + 3] = titleCodes[i];
  }
  
  // Add divider line
  for (let i = 0; i < 22; i++) {
    matrix[1][i] = CHAR_MAP['-'];
  }
  
  // Add events (up to 5)
  const eventsToShow = events.slice(0, 5);
  for (let i = 0; i < eventsToShow.length; i++) {
    const event = eventsToShow[i];
    const rowIndex = i + 2; // Start at row 2 (0-indexed)
    
    if (rowIndex >= 6) break; // Don't exceed the matrix bounds
    
    // Format event line: "MM/DD HH:MM Description"
    let eventLine = `${event.date} ${event.time} ${event.description}`;
    eventLine = eventLine.padEnd(22, ' ').substring(0, 22); // Ensure it fits
    
    const eventCodes = stringToVestaCodes(eventLine);
    for (let j = 0; j < eventCodes.length; j++) {
      if (j < 22) matrix[rowIndex][j] = eventCodes[j];
    }
  }
  
  console.log('Created event matrix:', matrix);
  return matrix;
}

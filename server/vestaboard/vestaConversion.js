// server/vestaboard/vestaConversion.js

// Vestaboard character code mapping from the official table.
const vestaboardMap = {
    " ": 0,      // Blank
    "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9,
    "J": 10, "K": 11, "L": 12, "M": 13, "N": 14, "O": 15, "P": 16, "Q": 17,
    "R": 18, "S": 19, "T": 20, "U": 21, "V": 22, "W": 23, "X": 24, "Y": 25, "Z": 26,
    "1": 27, "2": 28, "3": 29, "4": 30, "5": 31, "6": 32, "7": 33, "8": 34, "9": 35,
    "0": 36, "!": 37, "@": 38, "#": 39, "$": 40, "(": 41, ")": 42, "-": 44, "+": 46,
    "&": 47, "=": 48, ";": 49, ":": 50, "'": 52, "\"": 53, "%": 54, ",": 55,
    ".": 56, "/": 59, "?": 60, "°": 62
  };
  
  function charToVestaCode(char) {
    const upper = String(char).toUpperCase();
    return vestaboardMap.hasOwnProperty(upper) ? vestaboardMap[upper] : 0;
  }
  
  // Convert a string to an array of Vestaboard codes of fixed length (22 characters).
  // Force input to be a string; if too short, pad with padChar; if too long, truncate.
  function convertStringToVestaCodes(str, length = 22, padChar = ' ') {
    str = String(str || '');
    if (str.length < length) {
      str = str.padEnd(length, padChar);
    } else {
      str = str.substring(0, length);
    }
    return str.split('').map(charToVestaCode);
  }
  
  // Convert the flights array into a 6×22 matrix.
  // - Row 0: Header ("Checkrides {todays date}") padded to 22 characters.
  // - Rows 1–5: Each row is built from a flight object formatted as 
  //         "time callsign type destination" (with a space between each field).
  //   If fewer than 5 flights exist, the remaining rows are filled with 22 zeros.
  function convertFlightsToMatrix(flights) {
    const today = new Date().toLocaleDateString();
    const headerStr = `Checkrides ${today}`;
    const headerRow = convertStringToVestaCodes(headerStr, 22, ' ');
  
    const flightRows = flights.slice(-5).map(flight => {
      const rowStr = `${flight.time} ${flight.callsign} ${flight.type} ${flight.destination}`;
      return convertStringToVestaCodes(rowStr, 22, ' ');
    });
  
    while (flightRows.length < 5) {
      flightRows.push(convertStringToVestaCodes('0'.repeat(22), 22, '0'));
    }
  
    return [headerRow, ...flightRows];
  }
  
  module.exports = { convertFlightsToMatrix };
  
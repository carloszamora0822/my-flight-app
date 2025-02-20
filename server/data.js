// server/data.js

// In-memory storage for flight data
const flights = [];

/**
 * Returns the current list of flights.
 */
function getFlights() {
  return flights;
}

/**
 * Adds a new flight to the list.
 * Automatically removes the oldest flight if the list exceeds 5 items.
 * @param {Object} flight - The flight object to add.
 * @returns {Array} - The updated list of flights.
 */
function addFlight(flight) {
  flights.push(flight);
  // Keep only the last 5 flights
  while (flights.length > 5) {
    flights.shift();
  }
  return flights;
}

/**
 * Deletes a flight by its index.
 * @param {number} index - The index of the flight to delete.
 * @returns {Array} - The updated list of flights.
 * @throws {Error} - If the index is invalid.
 */
function deleteFlight(index) {
  if (index < 0 || index >= flights.length) {
    throw new Error('Invalid flight index.');
  }
  flights.splice(index, 1);
  return flights;
}

module.exports = { getFlights, addFlight, deleteFlight };

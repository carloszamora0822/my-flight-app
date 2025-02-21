const flights = [];

// Add error handling for array operations
const safePush = (flight) => {
  if (!Array.isArray(flights)) {
    console.error('flights is not an array');
    throw new Error('Invalid flights data structure');
  }
  flights.push(flight);
};

const safeGet = () => {
  if (!Array.isArray(flights)) {
    console.error('flights is not an array');
    return [];
  }
  return flights;
};

module.exports = { 
  flights,
  safePush,
  safeGet
};

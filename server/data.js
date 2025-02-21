let flights = [];

const safePush = (flight) => {
    console.log('SafePush called with:', flight);
    if (!Array.isArray(flights)) {
        flights = [];
    }
    flights.push(flight);
    console.log('Current flights after push:', flights);
};

const safeGet = () => {
    console.log('SafeGet called, current flights:', flights);
    if (!Array.isArray(flights)) {
        flights = [];
    }
    return [...flights];
};

module.exports = { 
    flights,
    safePush,
    safeGet
};

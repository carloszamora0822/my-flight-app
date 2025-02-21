// In-memory storage (note: this will reset on serverless function cold starts)
let flights = [];

const safePush = (flight) => {
    try {
        console.log('SafePush: Current flights:', flights);
        if (!Array.isArray(flights)) {
            flights = [];
        }
        flights.push(flight);
        console.log('SafePush: Updated flights:', flights);
        return true;
    } catch (error) {
        console.error('SafePush Error:', error);
        flights = [flight]; // Reset and add new flight
        return true;
    }
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

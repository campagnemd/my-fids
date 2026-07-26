export const buildDisplayFlights = (flights, showCodeshare, multilineCodeshare) => {
  if (!showCodeshare || !multilineCodeshare) return flights;

  return flights.flatMap((flight) => {
    const flightIds = [flight.flightId, ...(flight.codeshareList || [])];
    const schedule = flight.scheduleDatetime || flight.scheduleDateTime || "unknown";
    return Array.from(
      { length: Math.ceil(flightIds.length / 2) },
      (_, pairIndex) => ({
        ...flight,
        displayFlightIds: flightIds.slice(pairIndex * 2, pairIndex * 2 + 2),
        displayRowKey: `${flight.flightId}-${schedule}-${pairIndex}`
      })
    );
  });
};

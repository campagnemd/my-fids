const getSchedule = (flight) => (
  flight?.scheduleDatetime || flight?.scheduleDateTime || ""
);

const getEstimatedSchedule = (flight) => (
  flight?.estimatedDatetime || flight?.estimatedDateTime || ""
);

const getMasterFlightId = (flight) => String(
  flight?.masterflightid || flight?.masterFlightId || ""
).trim();

const isCodeshareRecord = (flight) => {
  const value = flight?.codeshare;
  return value === true || ["Y", "TRUE"].includes(String(value || "").toUpperCase());
};

const isMasterCandidate = (flight) => {
  const masterFlightId = getMasterFlightId(flight);
  return (!masterFlightId || masterFlightId === String(flight?.flightId || ""))
    && !isCodeshareRecord(flight);
};

const getLegacyFingerprint = (flight) => [
  getSchedule(flight),
  flight?.airport || "",
  getEstimatedSchedule(flight),
  flight?.gateNumber || "nogate"
].join("_");

export const mergeFlightDatasets = (datasets) => {
  const mergedItems = [];
  const seenKeys = new Set();

  datasets.flat().forEach((item) => {
    const schedule = getSchedule(item);
    if (!item || !item.flightId || !schedule) return;

    const uniqueKey = `${item.flightId}_${schedule}`;
    if (seenKeys.has(uniqueKey)) return;

    seenKeys.add(uniqueKey);
    mergedItems.push({ ...item });
  });

  return mergedItems;
};

export const groupCodeshareFlights = (flights) => {
  const masterCandidates = flights.filter(isMasterCandidate);
  const masterSchedules = new Map(
    masterCandidates.map((flight) => [String(flight.flightId), getSchedule(flight)])
  );
  const groups = new Map();

  flights.forEach((flight) => {
    const flightId = String(flight.flightId);
    const masterFlightId = getMasterFlightId(flight);
    let groupFlightId = masterFlightId || flightId;
    let groupSchedule = masterFlightId
      ? masterSchedules.get(masterFlightId) || getSchedule(flight)
      : getSchedule(flight);

    if (!masterFlightId && isCodeshareRecord(flight)) {
      const fingerprint = getLegacyFingerprint(flight);
      const candidates = masterCandidates.filter((candidate) => (
        getLegacyFingerprint(candidate) === fingerprint
      ));

      if (candidates.length === 1) {
        groupFlightId = String(candidates[0].flightId);
        groupSchedule = getSchedule(candidates[0]);
      }
    }

    const groupKey = `${groupSchedule}_${groupFlightId}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { groupFlightId, flights: [] });
    }
    groups.get(groupKey).flights.push(flight);
  });

  return [...groups.values()].map(({ groupFlightId, flights: group }) => {
    const master = group.find((flight) => String(flight.flightId) === groupFlightId)
      || group.find(isMasterCandidate)
      || group[0];
    const codeshareList = [...new Set(
      group
        .filter((flight) => flight !== master)
        .map((flight) => flight.flightId)
        .filter(Boolean)
    )];

    return { ...master, codeshareList };
  });
};

export const combineDailyFlightResults = (results) => {
  const isComplete = results.every((result) => result.status !== "unavailable");
  const usableResults = results.filter((result) => result.status !== "unavailable");
  const mergedItems = mergeFlightDatasets(usableResults.map((result) => result.items));

  return {
    isComplete,
    items: groupCodeshareFlights(mergedItems)
  };
};

import test from "node:test";
import assert from "node:assert/strict";
import {
  combineDailyFlightResults,
  groupCodeshareFlights,
  mergeFlightDatasets
} from "../src/flightData.js";

const flight = (overrides = {}) => ({
  flightId: "KE101",
  scheduleDatetime: "202608030900",
  airport: "도쿄/나리타",
  airportCode: "NRT",
  gateNumber: "12",
  ...overrides
});

test("정상 빈 응답은 완전한 최신 결과로 처리한다", () => {
  const result = combineDailyFlightResults([
    { status: "network-success", items: [] },
    { status: "network-success", items: [] }
  ]);

  assert.equal(result.isComplete, true);
  assert.deepEqual(result.items, []);
});

test("캐시도 없는 실패가 포함되면 기존 화면을 교체하지 않는다", () => {
  const result = combineDailyFlightResults([
    { status: "network-success", items: [flight()] },
    { status: "unavailable", items: [] }
  ]);

  assert.equal(result.isComplete, false);
  assert.equal(result.items.length, 1);
});

test("실패했어도 캐시가 있으면 완전한 결과로 처리한다", () => {
  const result = combineDailyFlightResults([
    { status: "network-success", items: [] },
    { status: "cache-fallback", items: [flight()] }
  ]);

  assert.equal(result.isComplete, true);
  assert.equal(result.items.length, 1);
});

test("masterflightid가 같으면 게이트와 예상시간이 달라도 코드셰어로 묶는다", () => {
  const master = flight();
  const codeshare = flight({
    flightId: "DL9010",
    masterflightid: "KE101",
    codeshare: "Y",
    gateNumber: "13",
    estimatedDatetime: "202608030930"
  });
  const result = groupCodeshareFlights([master, codeshare]);

  assert.equal(result.length, 1);
  assert.equal(result[0].flightId, "KE101");
  assert.deepEqual(result[0].codeshareList, ["DL9010"]);
});

test("마스터가 자신의 masterflightid를 가져도 변경된 예정시각의 코드셰어를 연결한다", () => {
  const master = flight({ masterflightid: "KE101" });
  const codeshare = flight({
    flightId: "DL9010",
    masterflightid: "KE101",
    codeshare: "Y",
    scheduleDatetime: "202608030905"
  });
  const result = groupCodeshareFlights([master, codeshare]);

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].codeshareList, ["DL9010"]);
});

test("관계 정보가 없는 독립 항공편은 fingerprint가 같아도 합치지 않는다", () => {
  const result = groupCodeshareFlights([
    flight(),
    flight({ flightId: "OZ201" })
  ]);

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((item) => item.codeshareList), [[], []]);
});

test("명시적 코드셰어 레코드는 유일한 기존 fingerprint 마스터에 연결한다", () => {
  const result = groupCodeshareFlights([
    flight(),
    flight({ flightId: "AF7001", codeshare: "Y" })
  ]);

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].codeshareList, ["AF7001"]);
});

test("병합과 그룹화는 입력 객체를 변경하거나 중복 편명을 만들지 않는다", () => {
  const master = flight();
  const codeshare = flight({ flightId: "DL9010", masterflightid: "KE101", codeshare: "Y" });
  const original = structuredClone([master, codeshare]);
  const merged = mergeFlightDatasets([[master, codeshare], [codeshare]]);
  const result = groupCodeshareFlights(merged);

  assert.deepEqual([master, codeshare], original);
  assert.equal(merged.length, 2);
  assert.deepEqual(result[0].codeshareList, ["DL9010"]);
});

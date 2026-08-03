import test from "node:test";
import assert from "node:assert/strict";
import departuresHandler, { isAllowedSearchDate } from "../api/departures.js";

const getKoreanDate = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${values.month}${values.day}`;
};

test("실제 날짜와 공식 조회 범위 D-3~D+6만 허용한다", () => {
  const now = new Date("2026-08-03T03:00:00Z");

  assert.equal(isAllowedSearchDate("20260731", now), true);
  assert.equal(isAllowedSearchDate("20260809", now), true);
  assert.equal(isAllowedSearchDate("20260730", now), false);
  assert.equal(isAllowedSearchDate("20260810", now), false);
  assert.equal(isAllowedSearchDate("20260230", now), false);
});

test("searchDate 이외의 쿼리 파라미터를 거부한다", async () => {
  const response = await departuresHandler.fetch(new Request(
    `https://example.com/api/departures?searchDate=${getKoreanDate()}&bypass=1`
  ));

  assert.equal(response.status, 400);
});

test("성공 응답은 정책 B 캐시 헤더와 원본 조회 시각을 포함한다", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalServiceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalServiceKey === undefined) delete process.env.DATA_GO_KR_SERVICE_KEY;
    else process.env.DATA_GO_KR_SERVICE_KEY = originalServiceKey;
  });
  process.env.DATA_GO_KR_SERVICE_KEY = "test-key";
  globalThis.fetch = async () => Response.json({
    response: {
      header: { resultCode: "00" },
      body: { items: [] }
    }
  });

  const response = await departuresHandler.fetch(new Request(
    `https://example.com/api/departures?searchDate=${getKoreanDate()}`
  ));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(
    response.headers.get("Vercel-CDN-Cache-Control"),
    "public, max-age=300"
  );
  assert.match(response.headers.get("X-FIDS-Fetched-At"), /^\d+$/);
});

test("원본 API 오류 응답은 CDN 캐시 헤더를 포함하지 않는다", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalServiceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalServiceKey === undefined) delete process.env.DATA_GO_KR_SERVICE_KEY;
    else process.env.DATA_GO_KR_SERVICE_KEY = originalServiceKey;
  });
  process.env.DATA_GO_KR_SERVICE_KEY = "test-key";
  globalThis.fetch = async () => new Response("failure", { status: 502 });

  const response = await departuresHandler.fetch(new Request(
    `https://example.com/api/departures?searchDate=${getKoreanDate()}`
  ));

  assert.equal(response.status, 502);
  assert.equal(response.headers.has("Vercel-CDN-Cache-Control"), false);
});

test("공공데이터 API의 업무 오류 응답도 CDN에 캐시하지 않는다", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalServiceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalServiceKey === undefined) delete process.env.DATA_GO_KR_SERVICE_KEY;
    else process.env.DATA_GO_KR_SERVICE_KEY = originalServiceKey;
  });
  process.env.DATA_GO_KR_SERVICE_KEY = "test-key";
  globalThis.fetch = async () => Response.json({
    response: {
      header: { resultCode: "99" },
      body: { items: [] }
    }
  });

  const response = await departuresHandler.fetch(new Request(
    `https://example.com/api/departures?searchDate=${getKoreanDate()}`
  ));

  assert.equal(response.status, 502);
  assert.equal(response.headers.has("Vercel-CDN-Cache-Control"), false);
});

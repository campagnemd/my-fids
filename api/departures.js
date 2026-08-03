const DEPARTURES_API_URL =
    "https://apis.data.go.kr/B551177/statusOfAllFltDeOdp/getFltDeparturesDeOdp";

const CACHE_SECONDS = 5 * 60;
const KOREA_TIME_ZONE = "Asia/Seoul";

const formatDateParts = (date, timeZone = KOREA_TIME_ZONE) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}${values.month}${values.day}`;
};

const addDays = (dateStr, days) => {
    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(4, 6));
    const day = Number(dateStr.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0")
    ].join("");
};

const isRealDate = (dateStr) => {
    if (!/^\d{8}$/.test(dateStr || "")) return false;
    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(4, 6));
    const day = Number(dateStr.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
};

export const isAllowedSearchDate = (dateStr, now = new Date()) => {
    if (!isRealDate(dateStr)) return false;
    const today = formatDateParts(now);
    return dateStr >= addDays(today, -3) && dateStr <= addDays(today, 6);
};

export default {
    async fetch(request) {
        if (request.method !== "GET") {
            return Response.json(
                { error: "Method not allowed" },
                {
                    status: 405,
                    headers: { Allow: "GET" }
                }
            );
        }

        const requestUrl = new URL(request.url);
        const searchDate = requestUrl.searchParams.get("searchDate");
        const searchParams = [...requestUrl.searchParams.keys()];

        if (
            searchParams.length !== 1
            || searchParams[0] !== "searchDate"
            || !isAllowedSearchDate(searchDate)
        ) {
            return Response.json(
                { error: "올바른 조회 날짜가 필요합니다." },
                { status: 400 }
            );
        }

        const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;

        if (!serviceKey) {
            console.error("DATA_GO_KR_SERVICE_KEY 환경변수가 설정되지 않았습니다.");
            return Response.json(
                { error: "서버 설정 오류가 발생했습니다." },
                { status: 500 }
            );
        }

        const params = new URLSearchParams({
            serviceKey,
            type: "json",
            numOfRows: "1500",
            pageNo: "1",
            searchDate,
            searchdtCode: "S",
            passengerOrCargo: "P"
        });

        try {
            const apiResponse = await fetch(
                `${DEPARTURES_API_URL}?${params.toString()}`,
                {
                    headers: { Accept: "application/json" }
                }
            );

            if (!apiResponse.ok) {
                console.error("공공데이터 API 오류:", apiResponse.status);
                return Response.json(
                    { error: "항공편 데이터를 불러오지 못했습니다." },
                    { status: 502 }
                );
            }

            const data = await apiResponse.json();
            if (data?.response?.header?.resultCode !== "00") {
                console.error("공공데이터 API 데이터 오류:", data?.response?.header?.resultCode);
                return Response.json(
                    { error: "항공편 데이터를 불러오지 못했습니다." },
                    { status: 502 }
                );
            }

            const fetchedAt = Date.now();
            return Response.json(data, {
                headers: {
                    "Cache-Control": "no-store",
                    "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_SECONDS}`,
                    "X-FIDS-Fetched-At": String(fetchedAt)
                }
            });
        } catch (error) {
            console.error("출발편 API 처리 오류:", error);
            return Response.json(
                { error: "서버 내부 오류가 발생했습니다." },
                { status: 500 }
            );
        }
    }
};

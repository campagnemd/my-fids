const DEPARTURES_API_URL =
    "https://apis.data.go.kr/B551177/statusOfAllFltDeOdp/getFltDeparturesDeOdp";

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

        if (!/^\d{8}$/.test(searchDate || "")) {
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
            return Response.json(data, {
                headers: { "Cache-Control": "no-store" }
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

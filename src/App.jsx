import React, { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, loadUserSettings, saveUserSettings, clearUserSettings } from "./settings";
import AirlineLogo from "./AirlineLogo";

const getShortTimeString = (dateObj) => {
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const getFormattedDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
};

const formatAirportName = (airport) => (
    typeof airport === "string"
        ? airport
            .replace(/\s*\([^)]*\)/g, "")
            .trim()
            .replace(/\s*\/\s*/g, "/")
        : airport
);

const SETTINGS_CATEGORIES = [
    { id: "time", title: "시간 및 동기화" },
    { id: "size", title: "화면 크기" },
    { id: "pages", title: "페이지 전환" },
    { id: "visibility", title: "표시 항목" },
    { id: "colors", title: "화면 색상" },
    { id: "highlight", title: "정보 강조" },
    { id: "widths", title: "열 너비" }
];

function SettingsSection({ id, isOpen, children }) {
    const panelId = `settings-panel-${id}`;

    if (!isOpen) return null;

    return (
        <section id={panelId}>
            {children}
        </section>
    );
}

function App() {
    const [initialSettings] = useState(loadUserSettings);

    // 🛠️ 0. 시작 경고문구 동의 상태
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [flights, setFlights] = useState([]);
    const [filteredFlights, setFilteredFlights] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const [showConfig, setShowConfig] = useState(false);
    const [openConfigSection, setOpenConfigSection] = useState("time");
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [showApiError, setShowApiError] = useState(false);
    
    // 1. 디스플레이 제어
    const [itemsPerPage, setItemsPerPage] = useState(initialSettings.itemsPerPage);
    const [rowHeight, setRowHeight] = useState(initialSettings.rowHeight);
    const [fontSize, setFontSize] = useState(initialSettings.fontSize);
    
    // 2. 시간/타이머/페이드 제어
    const [pastHours, setPastHours] = useState(initialSettings.pastHours);
    const [futureHours, setFutureHours] = useState(initialSettings.futureHours);
    const [apiSyncInterval, setApiSyncInterval] = useState(initialSettings.apiSyncInterval);
    const [flipInterval, setFlipInterval] = useState(initialSettings.flipInterval);
    const [maxPages, setMaxPages] = useState(initialSettings.maxPages);
    const [smoothTransition, setSmoothTransition] = useState(initialSettings.smoothTransition);
    const [isFading, setIsFading] = useState(false); 
    
    // 3. 항목 토글 제어
    const [showLogo, setShowLogo] = useState(initialSettings.showLogo);
    const [showTerminal, setShowTerminal] = useState(initialSettings.showTerminal);
    const [showCheckin, setShowCheckin] = useState(initialSettings.showCheckin);
    const [showCodeshare, setShowCodeshare] = useState(initialSettings.showCodeshare);
    const [showDeparted, setShowDeparted] = useState(initialSettings.showDeparted);
    const [showHeader, setShowHeader] = useState(initialSettings.showHeader);
    const [flightFirst, setFlightFirst] = useState(initialSettings.flightFirst);

    // 3-1. 색상 강조 토글
    const [highlightChange, setHighlightChange] = useState(initialSettings.highlightChange);
    const [highlightTerminal, setHighlightTerminal] = useState(initialSettings.highlightTerminal);
    const [highlightCheckin, setHighlightCheckin] = useState(initialSettings.highlightCheckin);
    const [highlightGate, setHighlightGate] = useState(initialSettings.highlightGate);

    // 3-2. 코드쉐어 회전 간격 (초)
    const [codeshareFlipInterval, setCodeshareFlipInterval] = useState(initialSettings.codeshareFlipInterval);
    const [codeshareIndex, setCodeshareIndex] = useState(0); 
    const [isCodeshareFading, setIsCodeshareFading] = useState(false); 

    // 4. 색상 제어
    const [headerColor, setHeaderColor] = useState(initialSettings.headerColor);
    const [tableHeaderColor, setTableHeaderColor] = useState(initialSettings.tableHeaderColor);
    const [footerColor, setFooterColor] = useState(initialSettings.footerColor);
    const [oddRowColor, setOddRowColor] = useState(initialSettings.oddRowColor);
    const [evenRowColor, setEvenRowColor] = useState(initialSettings.evenRowColor);

    // 5. 각 열 가로 비율/너비 제어
    const [wTime, setWTime] = useState(initialSettings.wTime);
    const [wChange, setWChange] = useState(initialSettings.wChange);
    const [wActualLogo, setWActualLogo] = useState(initialSettings.wActualLogo);
    const [wActualNum, setWActualNum] = useState(initialSettings.wActualNum);
    const [wCodeLogo, setWCodeLogo] = useState(initialSettings.wCodeLogo);
    const [wCodeNum, setWCodeNum] = useState(initialSettings.wCodeNum);
    const [wDest, setWDest] = useState(initialSettings.wDest);
    const [wTerminal, setWTerminal] = useState(initialSettings.wTerminal);
    const [wCheckin, setWCheckin] = useState(initialSettings.wCheckin);
    const [wGate, setWGate] = useState(initialSettings.wGate);
    const [wStatus, setWStatus] = useState(initialSettings.wStatus);

    useEffect(() => {
        saveUserSettings({
            itemsPerPage,
            rowHeight,
            fontSize,
            pastHours,
            futureHours,
            apiSyncInterval,
            flipInterval,
            maxPages,
            smoothTransition,
            showLogo,
            showTerminal,
            showCheckin,
            showCodeshare,
            showDeparted,
            showHeader,
            flightFirst,
            highlightChange,
            highlightTerminal,
            highlightCheckin,
            highlightGate,
            codeshareFlipInterval,
            headerColor,
            tableHeaderColor,
            footerColor,
            oddRowColor,
            evenRowColor,
            wTime,
            wChange,
            wActualLogo,
            wActualNum,
            wCodeLogo,
            wCodeNum,
            wDest,
            wTerminal,
            wCheckin,
            wGate,
            wStatus
        });
    }, [
        itemsPerPage, rowHeight, fontSize, pastHours, futureHours, apiSyncInterval,
        flipInterval, maxPages, smoothTransition, showLogo, showTerminal,
        showCheckin, showCodeshare, showDeparted, showHeader, flightFirst,
        highlightChange, highlightTerminal, highlightCheckin, highlightGate,
        codeshareFlipInterval, headerColor, tableHeaderColor, footerColor,
        oddRowColor, evenRowColor, wTime, wChange, wActualLogo, wActualNum,
        wCodeLogo, wCodeNum, wDest, wTerminal, wCheckin, wGate, wStatus
    ]);

    const resetUserSettings = () => {
        if (!window.confirm("설정을 기본값으로 초기화하시겠습니까?")) return;

        clearUserSettings();
        setItemsPerPage(DEFAULT_SETTINGS.itemsPerPage);
        setRowHeight(DEFAULT_SETTINGS.rowHeight);
        setFontSize(DEFAULT_SETTINGS.fontSize);
        setPastHours(DEFAULT_SETTINGS.pastHours);
        setFutureHours(DEFAULT_SETTINGS.futureHours);
        setApiSyncInterval(DEFAULT_SETTINGS.apiSyncInterval);
        setFlipInterval(DEFAULT_SETTINGS.flipInterval);
        setMaxPages(DEFAULT_SETTINGS.maxPages);
        setSmoothTransition(DEFAULT_SETTINGS.smoothTransition);
        setShowLogo(DEFAULT_SETTINGS.showLogo);
        setShowTerminal(DEFAULT_SETTINGS.showTerminal);
        setShowCheckin(DEFAULT_SETTINGS.showCheckin);
        setShowCodeshare(DEFAULT_SETTINGS.showCodeshare);
        setShowDeparted(DEFAULT_SETTINGS.showDeparted);
        setShowHeader(DEFAULT_SETTINGS.showHeader);
        setFlightFirst(DEFAULT_SETTINGS.flightFirst);
        setHighlightChange(DEFAULT_SETTINGS.highlightChange);
        setHighlightTerminal(DEFAULT_SETTINGS.highlightTerminal);
        setHighlightCheckin(DEFAULT_SETTINGS.highlightCheckin);
        setHighlightGate(DEFAULT_SETTINGS.highlightGate);
        setCodeshareFlipInterval(DEFAULT_SETTINGS.codeshareFlipInterval);
        setHeaderColor(DEFAULT_SETTINGS.headerColor);
        setTableHeaderColor(DEFAULT_SETTINGS.tableHeaderColor);
        setFooterColor(DEFAULT_SETTINGS.footerColor);
        setOddRowColor(DEFAULT_SETTINGS.oddRowColor);
        setEvenRowColor(DEFAULT_SETTINGS.evenRowColor);
        setWTime(DEFAULT_SETTINGS.wTime);
        setWChange(DEFAULT_SETTINGS.wChange);
        setWActualLogo(DEFAULT_SETTINGS.wActualLogo);
        setWActualNum(DEFAULT_SETTINGS.wActualNum);
        setWCodeLogo(DEFAULT_SETTINGS.wCodeLogo);
        setWCodeNum(DEFAULT_SETTINGS.wCodeNum);
        setWDest(DEFAULT_SETTINGS.wDest);
        setWTerminal(DEFAULT_SETTINGS.wTerminal);
        setWCheckin(DEFAULT_SETTINGS.wCheckin);
        setWGate(DEFAULT_SETTINGS.wGate);
        setWStatus(DEFAULT_SETTINGS.wStatus);
        setCurrentPage(0);
    };

    const filteredFlightsRef = useRef([]);
    const apiRetryTimerRef = useRef(null);
    useEffect(() => {
        filteredFlightsRef.current = filteredFlights;
    }, [filteredFlights]);

    useEffect(() => {
        const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clockTimer);
    }, []);

    useEffect(() => {
        if (!showConfig) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setShowConfig(false);
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [showConfig]);

    useEffect(() => {
        if (showDisclaimer) return; // 약관 동의 전에는 페이지 전환을 하지 않음
        const pageTimer = setInterval(() => {
            const totalItems = filteredFlightsRef.current.length;
            if (totalItems > 0) {
                const actualMaxPage = Math.ceil(totalItems / itemsPerPage);
                const maxPageLimit = Math.min(actualMaxPage, maxPages); 
                
                if (smoothTransition) {
                    setIsFading(true);
                    setTimeout(() => {
                        setCurrentPage(p => (p + 1) % (maxPageLimit || 1));
                        setIsFading(false);
                    }, 500); 
                } else {
                    setCurrentPage(p => (p + 1) % (maxPageLimit || 1));
                }
            }
        }, flipInterval * 1000); 

        return () => clearInterval(pageTimer);
    }, [itemsPerPage, maxPages, flipInterval, smoothTransition, showDisclaimer]);

    useEffect(() => {
        if (showDisclaimer) return; 
        const codeshareTimer = setInterval(() => {
            if (smoothTransition) {
                setIsCodeshareFading(true);
                setTimeout(() => {
                    setCodeshareIndex(i => i + 1);
                    setIsCodeshareFading(false);
                }, 300);
            } else {
                setCodeshareIndex(i => i + 1);
            }
        }, codeshareFlipInterval * 1000);

        return () => clearInterval(codeshareTimer);
    }, [codeshareFlipInterval, smoothTransition, showDisclaimer]);

    const fetchSingleDayData = useCallback(async (dateStr, forceRefresh) => {
        const cacheKey = `fids_raw_data_${dateStr}`;
        const cachedTimeKey = `fids_raw_time_${dateStr}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cachedTimeKey);
        const cachedTimestamp = Number(cachedTime);
        const nowTimestamp = Date.now();
        const cacheDuration = apiSyncInterval * 60 * 1000;

        if (!forceRefresh && cachedData && Number.isFinite(cachedTimestamp) && (nowTimestamp - cachedTimestamp < cacheDuration)) {
            try {
                const parsed = JSON.parse(cachedData);
                if (Array.isArray(parsed)) {
                    return {
                        items: parsed,
                        networkAttempted: false,
                        networkSucceeded: false,
                        lastSuccessfulFetchAt: cachedTimestamp
                    };
                }
            } catch {}
        }

        try {
            const params = new URLSearchParams({
                searchDate: dateStr
            });
            const targetUrl = `/api/departures?${params.toString()}`;
            const response = await fetch(targetUrl);
            if (!response.ok) throw new Error("API Network Error");
            
            const data = await response.json();
            if (data?.response?.header?.resultCode !== "00") throw new Error("API Data Error");
            
            const rawItems = data?.response?.body?.items || [];
            const itemList = Array.isArray(rawItems) ? rawItems : [];
            const successfulFetchAt = Date.now();

            localStorage.setItem(cacheKey, JSON.stringify(itemList));
            localStorage.setItem(cachedTimeKey, successfulFetchAt.toString());

            return {
                items: itemList,
                networkAttempted: true,
                networkSucceeded: true,
                lastSuccessfulFetchAt: successfulFetchAt
            };
        } catch (err) {
            console.error(`데이터 호출 실패 (${dateStr}):`, err);
            try {
                const backup = JSON.parse(cachedData);
                if (Array.isArray(backup)) {
                    return {
                        items: backup,
                        networkAttempted: true,
                        networkSucceeded: false,
                        lastSuccessfulFetchAt: Number.isFinite(cachedTimestamp) ? cachedTimestamp : null
                    };
                }
            } catch {}
            return {
                items: [],
                networkAttempted: true,
                networkSucceeded: false,
                lastSuccessfulFetchAt: null
            };
        }
    }, [apiSyncInterval]);

    const fetchFlightData = useCallback(async function refreshFlightData(forceRefresh = false, isRetry = false) {
        const handleRefreshFailure = () => {
            if (isRetry) {
                setShowApiError(true);
                return;
            }

            if (apiRetryTimerRef.current) return;
            apiRetryTimerRef.current = window.setTimeout(() => {
                apiRetryTimerRef.current = null;
                refreshFlightData(true, true);
            }, 60 * 1000);
        };

        const now = new Date();
        const pastDate = new Date(now.getTime() - (pastHours * 60 * 60 * 1000));
        const futureDate = new Date(now.getTime() + (futureHours * 60 * 60 * 1000));
        
        const todayStr = getFormattedDate(now);
        const pastStr = getFormattedDate(pastDate);
        const futureStr = getFormattedDate(futureDate);

        let targetDates = [todayStr];
        if (pastStr !== todayStr) targetDates.unshift(pastStr);
        if (futureStr !== todayStr && !targetDates.includes(futureStr)) targetDates.push(futureStr);

        try {
            const fetchResults = [];
            for (const date of targetDates) {
                const result = await fetchSingleDayData(date, forceRefresh);
                fetchResults.push(result);
            }
            const datasets = fetchResults.map(result => result.items);
            
            const mergedItems = [];
            const seenKeys = new Set();
            const seenSchedules = new Set(); 
            
            if (datasets && Array.isArray(datasets)) {
                datasets.flat().forEach(item => {
                    const sched = item.scheduleDatetime || item.scheduleDateTime;
                    if (!item || !item.flightId || !sched) return;
                    
                    const uniqueKey = `${item.flightId}_${sched}`;
                    if (!seenKeys.has(uniqueKey)) {
                        seenKeys.add(uniqueKey);
                        
                        let isSlave = false;
                        if (item.codeshare === 'Y' || item.codeshare === 'True') isSlave = true;
                        if (item.masterflightid && item.masterflightid !== item.flightId) isSlave = true;
                        
                        if (!isSlave) {
                            const est = item.estimatedDatetime || item.estimatedDateTime || "";
                            const fingerprint = `${sched}_${item.airport}_${est}_${item.gateNumber || 'nogate'}`;
                            
                            if (seenSchedules.has(fingerprint)) {
                                isSlave = true; 
                            } else {
                                seenSchedules.add(fingerprint);
                            }
                        }
                        item.isCodeshare = isSlave;
                        mergedItems.push(item);
                    }
                });
            }

            if (mergedItems.length > 0) {
                setFlights(mergedItems);
            }

            const networkResults = fetchResults.filter(result => result.networkAttempted);
            const networkRefreshSucceeded = networkResults.length > 0 && networkResults.every(result => result.networkSucceeded);
            const latestSuccessfulFetchAt = Math.max(
                ...fetchResults
                    .map(result => result.lastSuccessfulFetchAt)
                    .filter(timestamp => Number.isFinite(timestamp))
            );

            if (networkRefreshSucceeded && Number.isFinite(latestSuccessfulFetchAt)) {
                if (apiRetryTimerRef.current) {
                    window.clearTimeout(apiRetryTimerRef.current);
                    apiRetryTimerRef.current = null;
                }
                setLastUpdatedAt(latestSuccessfulFetchAt);
                setShowApiError(false);
            } else if (Number.isFinite(latestSuccessfulFetchAt)) {
                setLastUpdatedAt(previous => Number.isFinite(previous) ? previous : latestSuccessfulFetchAt);
            }

            if (networkResults.length > 0 && !networkRefreshSucceeded) {
                handleRefreshFailure();
            }
        } catch (err) {
            console.error("데이터 병합 코어 에러:", err);
            handleRefreshFailure();
        }
    }, [fetchSingleDayData, futureHours, pastHours]);

    useEffect(() => {
        fetchFlightData(false);
        const autoRefresh = setInterval(() => fetchFlightData(true), apiSyncInterval * 60 * 1000);
        return () => {
            clearInterval(autoRefresh);
            if (apiRetryTimerRef.current) {
                clearTimeout(apiRetryTimerRef.current);
                apiRetryTimerRef.current = null;
            }
        };
    }, [fetchFlightData, apiSyncInterval]);

    const currentMinute = Math.floor(currentTime.getTime() / 60000);
    useEffect(() => {
        if (!flights || flights.length === 0) return;

        const nowTimestamp = currentMinute * 60000;
        const startBoundary = nowTimestamp - (pastHours * 60 * 60 * 1000);   
        const endBoundary = nowTimestamp + (futureHours * 60 * 60 * 1000);  

        const groups = {};
        flights.forEach(item => {
            const sched = String(item.scheduleDatetime || item.scheduleDateTime || '');
            const est = item.estimatedDatetime || item.estimatedDateTime || "";
            const fp = `${sched}_${item.airport}_${est}_${item.gateNumber || 'nogate'}`;
            if (!groups[fp]) groups[fp] = [];
            groups[fp].push(item);
        });

        const masterFlights = Object.values(groups).map(group => {
            const master = group.find(g => !g.isCodeshare) || group[0];
            const slaves = group.filter(g => g !== master);
            const codeshareList = slaves.map(s => s.flightId).filter(Boolean);
            return { ...master, codeshareList };
        });

        const processed = masterFlights.filter(flight => {
            const sched = String(flight.scheduleDatetime || flight.scheduleDateTime || '');
            if (sched.length < 12) return false;

            const year = parseInt(sched.slice(0, 4));
            const month = parseInt(sched.slice(4, 6)) - 1;
            const day = parseInt(sched.slice(6, 8));
            const hours = parseInt(sched.slice(8, 10));
            const minutes = parseInt(sched.slice(10, 12));
            
            const flightDate = new Date(year, month, day, hours, minutes);
            const flightTimestamp = flightDate.getTime();

            const remark = flight.remark ? String(flight.remark) : "";
            const isCompleted = remark.includes("출발") || remark.includes("이륙") || remark.includes("종료");

            if (flightTimestamp >= startBoundary && flightTimestamp <= endBoundary) {
                if (!showDeparted && isCompleted) return false;
                
                if (flightTimestamp < nowTimestamp) {
                    if (showDeparted) return true; 
                    
                    if (remark.includes("지연") || remark.includes("결항") || remark.includes("마감") || remark.includes("최종") || remark.includes("탑승중") || remark.includes("준비") || remark.includes("대기")) {
                        return true;
                    }
                    return false; 
                }
                return true; 
            }
            return false;
        });

        processed.sort((a, b) => {
            const schedA = String(a.scheduleDatetime || a.scheduleDateTime || '');
            const schedB = String(b.scheduleDatetime || b.scheduleDateTime || '');
            return schedA.localeCompare(schedB);
        });

        setFilteredFlights(prev => {
            if (JSON.stringify(prev) === JSON.stringify(processed)) return prev;
            setCurrentPage(0); 
            return processed;
        });
    }, [currentMinute, flights, showDeparted, pastHours, futureHours]);

    const pageData = filteredFlights.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const totalPages = Math.min(Math.ceil(filteredFlights.length / itemsPerPage), maxPages);

    const formatTime = (timeStr) => {
        if (!timeStr) return "--:--";
        const cleanStr = String(timeStr);
        if (cleanStr.length >= 12) {
            const timePart = cleanStr.slice(8, 12);
            return `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
        }
        return cleanStr;
    };

    const parseFlightId = (id) => {
        if (!id) return { code: "---", num: "" };
        const match = id.match(/^([A-Za-z0-9]{2})(\d+.*)$/); 
        if (match) {
            return { code: match[1].toUpperCase(), num: match[2] };
        }
        return { code: id.toUpperCase(), num: "" };
    };

    const getTerminalInfo = (gateNumber, terminalId) => {
        if (!gateNumber) return terminalId || "T1";
        const gate = parseInt(gateNumber, 10);
        if (isNaN(gate)) return terminalId || "T1";
        if (gate >= 1 && gate <= 199) return "T1";
        if (gate >= 200 && gate <= 299) return "T2";
        return terminalId || "T1";
    };

    const renderStatusAndStyle = (remark) => {
        const status = remark || "정시";
        const baseClass = "w-full h-full flex items-center justify-center font-black text-center ";
        
        if (status.includes("탑승중")) {
            return <div className={`${baseClass} text-white animate-pulse`}>탑승중</div>;
        } else if (status.includes("준비") || status.includes("대기")) {
            return <div className={`${baseClass} text-white`}>탑승준비</div>;
        } else if (status.includes("마감") || status.includes("최종")) {
            return <div className={`${baseClass} text-[#FFD700] animate-pulse`}>마감예정</div>;
        } else if (status.includes("지연")) {
            return <div className={`${baseClass} bg-[#FF6D00] text-white`}>지연</div>;
        } else if (status.includes("결항")) {
            return <div className={`${baseClass} bg-[#D50000] text-white`}>결항</div>;
        } else if (status.includes("출발") || status.includes("이륙") || status.includes("종료")) {
            return <div className={`${baseClass} text-slate-400`}>{status}</div>;
        }
        return <div className={baseClass}></div>;
    };

    const renderEstimatedTime = (flight) => {
        const isDelayed = flight.remark && flight.remark.includes("지연");
        if (!isDelayed) return ""; 
        const est = flight.estimatedDatetime || flight.estimatedDateTime || flight.scheduleDatetime || flight.scheduleDateTime;
        return formatTime(est);
    };

    const zoomScale = rowHeight / 55;
    const scalePx = (base) => Math.round(base * zoomScale);

    const timeColWidth = scalePx(wTime);
    const changeColWidth = scalePx(wChange);
    const terminalColWidth = scalePx(wTerminal);
    const checkinColWidth = scalePx(wCheckin);
    const gateColWidth = scalePx(wGate);
    const statusColWidth = scalePx(wStatus);

    const scaledActualLogo = scalePx(wActualLogo);
    const scaledActualNum = scalePx(wActualNum);
    const scaledCodeLogo = scalePx(wCodeLogo);
    const scaledCodeNum = scalePx(wCodeNum);

    const actualColWidth = (showLogo ? scaledActualLogo : 0) + scaledActualNum;
    const codeshareColWidth = showCodeshare ? ((showLogo ? scaledCodeLogo : 0) + scaledCodeNum) : 0;
    const flightColWidth = actualColWidth + codeshareColWidth;

    const destWidthStr = wDest === 0 ? 'minmax(40px, 1fr)' : `${scalePx(wDest)}px`;

    let gridColsStructure = flightFirst
        ? `${timeColWidth}px ${changeColWidth}px ${flightColWidth}px ${destWidthStr}`
        : `${timeColWidth}px ${changeColWidth}px ${destWidthStr} ${flightColWidth}px`;
    
    if (showTerminal) gridColsStructure += ` ${terminalColWidth}px`;
    if (showCheckin) gridColsStructure += ` ${checkinColWidth}px`;
    gridColsStructure += ` ${gateColWidth}px ${statusColWidth}px`;

    const dynamicGridStyle = {
        display: "grid",
        gridTemplateColumns: gridColsStructure,
        alignItems: "stretch", 
        height: `${rowHeight}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${rowHeight}px`
    };
    const minutesSinceLastUpdate = Number.isFinite(lastUpdatedAt)
        ? Math.max(0, Math.floor((currentTime.getTime() - lastUpdatedAt) / 60000))
        : null;
    const lastUpdateLabel = minutesSinceLastUpdate === null
        ? "업데이트 기록 없음"
        : minutesSinceLastUpdate === 0
            ? "방금 전"
            : `${minutesSinceLastUpdate}분 전`;

    return (
        <div className="min-h-screen bg-[#051126] text-[#F8FAFC] flex flex-col justify-between select-none overflow-hidden relative">
            
            {/* 🛠️ 시작 경고문구 (Disclaimer Modal) */}
            {showDisclaimer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4">
                    <div className="bg-[#030b1a] border border-[#162e58] rounded-xl shadow-2xl p-8 max-w-2xl w-full text-slate-300 transform transition-all">
                        <h2 className="text-2xl font-black text-white mb-5 flex items-center tracking-wide">
                            <span className="text-[#FF6D00] mr-3">⚠️</span> 
                            서비스 이용 안내 및 면책 조항
                        </h2>
                        <div className="space-y-4 text-sm leading-relaxed mb-8 font-sans font-normal tracking-wide">
                            <p>
                                본 서비스는 <strong className="text-white">인천국제공항의 공식 서비스가 아니며</strong>,
                                공공데이터포털 Open API를 활용한 비상업적 웹 애플리케이션입니다.
                            </p>
                            <p>
                                표시되는 정보는 네트워크 및 데이터 제공처의 상황에 따라 지연·누락되거나 실제 운항 정보와 다를 수 있습니다.
                                중요한 일정은 반드시 해당 항공사 또는 인천국제공항의 공식 채널에서 확인해 주세요.
                            </p>
                            <p>
                                본 서비스의 정보 이용으로 발생한 손해에 대해서 개발자는 책임을 지지 않습니다.
                            </p>
                            <div className="mt-4 p-4 bg-[#162e58]/30 rounded-lg border border-[#162e58]/50">
                                <span className="text-[#4AF2A1] font-bold">💡 이용 팁</span>
                                <p className="mt-1">
                                    화면 하단의 <strong className="text-white">3줄 메뉴 아이콘</strong>을 클릭하여 화면 구성, 글자 크기, 표시 항목 등
                                    세부적인 전광판 설정을 직접 제어하실 수 있습니다.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowDisclaimer(false)} 
                            className="w-full bg-[#3065bb] hover:bg-[#458cff] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 font-sans tracking-widest text-lg"
                        >
                            동의
                        </button>
                    </div>
                </div>
            )}

            {!showDisclaimer && showApiError && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div role="alertdialog" aria-modal="true" aria-labelledby="api-error-title" className="w-full max-w-md rounded-xl border border-[#D50000]/60 bg-[#030b1a] p-6 text-slate-300 shadow-2xl">
                        <h2 id="api-error-title" className="text-xl tracking-wide text-white">
                            <span className="mr-2 text-[#FF6D00]" aria-hidden="true">⚠️</span>
                            데이터 업데이트 실패
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed tracking-wide">
                            항공편 데이터를 불러오지 못해 1분 후 다시 시도했지만 연결에 실패했습니다.
                            현재 화면에는 마지막으로 저장된 데이터가 계속 표시될 수 있습니다.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowApiError(false)}
                            className="mt-6 w-full rounded-lg bg-[#3065bb] px-4 py-3 text-white hover:bg-[#458cff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AF2A1]"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            <div>
                {showHeader && (
                    <header className="relative flex items-center shadow-md z-10 px-6 transition-colors duration-300" style={{ height: `${rowHeight}px`, backgroundColor: headerColor }}>
                        <div className="absolute left-6 flex items-center h-full">
                            <img src="/departure-white.png" alt="출발 비행기" style={{ width: `${rowHeight * 0.62}px`, height: `${rowHeight * 0.62}px` }} className="object-contain" />
                        </div>

                        <div className="w-full text-center h-full flex items-center justify-center">
                            <span className="text-white tracking-wide" style={{ fontSize: `${fontSize}px` }}>
                                출발
                            </span>
                        </div>
                    </header>
                )}

                <div className="w-full overflow-x-auto overscroll-x-contain" aria-label="출발 항공편 전광판">
                    <div style={{...dynamicGridStyle, backgroundColor: tableHeaderColor}} className="border-b border-[#1b2d4a] text-white uppercase tracking-wider text-center">
                        <div className="flex items-center justify-center">시간</div>
                        <div className="flex items-center justify-center">변경</div>
                        {flightFirst ? (
                            <React.Fragment>
                                <div className="flex items-center justify-center">편명</div>
                                <div className="text-center flex items-center justify-center">도착지</div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <div className="text-center flex items-center justify-center">도착지</div>
                                <div className="flex items-center justify-center">편명</div>
                            </React.Fragment>
                        )}
                        
                        {showTerminal && <div className="text-white flex items-center justify-center">터미널</div>}
                        {showCheckin && <div className="text-white flex items-center justify-center">체크인</div>}
                        
                        <div className="flex items-center justify-center">탑승구</div>
                        <div className="flex items-center justify-center">현황</div>
                    </div>

                    <div className="divide-y divide-[#162e58]/20">
                        {pageData.length > 0 ? (
                            pageData.map((flight, idx) => {
                                const currentRowBg = idx % 2 === 0 ? oddRowColor : evenRowColor;
                                const fltInfo = parseFlightId(flight.flightId);
                                const schedTime = formatTime(flight.scheduleDatetime || flight.scheduleDateTime);
                                const codeshareList = flight.codeshareList || [];
                                const currentCodeshareId = codeshareList.length > 0 ? codeshareList[codeshareIndex % codeshareList.length] : null;
                                const currentCodeshareInfo = currentCodeshareId ? parseFlightId(currentCodeshareId) : null;

                                const destinationCell = (
                                    <div className="text-left pl-14 text-[#FFFFFF] truncate tracking-wide flex items-center">
                                        {formatAirportName(flight.airport) || "---"}
                                    </div>
                                );

                                // 🛠️ 2. 코드쉐어 부분의 세로줄(border-l) CSS 제거
                                const flightCell = (
                                    <div className="flex items-center justify-start h-full w-full">
                                        {/* 실제 운항편 영역 */}
                                        <div className="flex items-center h-full overflow-hidden" style={{ width: `${actualColWidth}px` }}>
                                            {showLogo && (
                                                <div className="shrink-0 flex items-center justify-start h-full py-[2px] pl-2" style={{ width: `${scaledActualLogo}px` }}>
                                                    <AirlineLogo flightId={flight.flightId} rowHeight={rowHeight} slotWidth={scaledActualLogo} />
                                                </div>
                                            )}
                                            <div className="flex items-center shrink-0 overflow-hidden pl-2" style={{ width: `${scaledActualNum}px` }}>
                                                <span className="text-white font-black text-left">{fltInfo.code}</span>
                                                <span className="text-white text-left font-black whitespace-nowrap" style={{ marginLeft: '1ch' }}>{fltInfo.num}</span>
                                            </div>
                                        </div>

                                        {/* 공동 운항편 영역 (세로줄 제거됨) */}
                                        {showCodeshare && (
                                            <div className="flex items-center justify-start h-full overflow-hidden" style={{ width: `${codeshareColWidth}px` }}>
                                                {currentCodeshareInfo && (
                                                    <React.Fragment>
                                                        {showLogo && (
                                                            <div className={`shrink-0 flex items-center justify-start h-full py-[2px] pl-2 transition-opacity duration-300 ${isCodeshareFading ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${scaledCodeLogo}px` }}>
                                                                <AirlineLogo flightId={currentCodeshareId} rowHeight={rowHeight} slotWidth={scaledCodeLogo} />
                                                            </div>
                                                        )}
                                                        <div className={`flex items-center shrink-0 overflow-hidden pl-2 transition-opacity duration-300 ${isCodeshareFading ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${scaledCodeNum}px` }}>
                                                            <span className="text-white font-black">{currentCodeshareInfo.code}</span>
                                                            <span className="text-white font-black whitespace-nowrap" style={{ marginLeft: '1ch' }}>{currentCodeshareInfo.num}</span>
                                                        </div>
                                                    </React.Fragment>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                                
                                return (
                                    <div key={idx} style={{ ...dynamicGridStyle, backgroundColor: currentRowBg }} className={`text-center items-center transition-colors duration-300 fade-content ${isFading ? 'is-fading' : ''}`}>
                                        
                                        <div className="text-[#FFFFFF] text-center flex items-center justify-center">{schedTime}</div>
                                        
                                        <div className={`text-center flex items-center justify-center ${highlightChange ? 'text-[#FACC15]' : 'text-white'}`}>
                                            {renderEstimatedTime(flight)}
                                        </div>
                                        
                                        {flightFirst ? (
                                            <React.Fragment>
                                                {flightCell}
                                                {destinationCell}
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment>
                                                {destinationCell}
                                                {flightCell}
                                            </React.Fragment>
                                        )}
                                        
                                        {showTerminal && (
                                            <div className={`tracking-wide text-center flex items-center justify-center ${highlightTerminal ? 'text-[#FACC15]' : 'text-white'}`}>
                                                {getTerminalInfo(flight.gateNumber, flight.terminalId)}
                                            </div>
                                        )}
                                        
                                        {showCheckin && (
                                            <div className={`tracking-wide text-center flex items-center justify-center ${highlightCheckin ? 'text-[#FACC15]' : 'text-white'}`}>
                                                {flight.chkinRange || "—"}
                                            </div>
                                        )}
                                        
                                        <div className={`text-center flex items-center justify-center ${highlightGate ? 'text-[#FACC15]' : 'text-white'}`}>{flight.gateNumber || "—"}</div>
                                        
                                        <div className="h-full w-full flex items-center justify-center">
                                            {renderStatusAndStyle(flight.remark)}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={`text-center text-[#458cff] tracking-widest uppercase bg-[#134dab]/20 flex items-center justify-center transition-colors duration-300 fade-content ${isFading ? 'is-fading' : ''}`} style={{ height: `${rowHeight * 5}px`, fontSize: `${fontSize}px`, backgroundColor: oddRowColor }}>
                                <span>조건에 맞는 비행 데이터가 없거나 불러오는 중입니다...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🎛️ 화면 설정 모달 */}
            {!showDisclaimer && showConfig && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setShowConfig(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="settings-dialog-title"
                        className="flex h-[90vh] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[#162e58] bg-[#030b1a] shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-[#162e58] px-5 py-4 sm:px-7">
                            <div>
                                <h2 id="settings-dialog-title" className="text-base tracking-[0.18em] text-white">설정</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfig(false)}
                                aria-label="설정 닫기"
                                className="flex h-10 w-10 items-center justify-center rounded text-2xl text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AF2A1]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                            <nav aria-label="설정 범주" className="flex shrink-0 flex-col border-b border-[#162e58] bg-[#041027] p-3 md:w-64 md:border-b-0 md:border-r md:p-4">
                                <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
                                    {SETTINGS_CATEGORIES.map((category) => {
                                        const isSelected = openConfigSection === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => setOpenConfigSection(category.id)}
                                                aria-current={isSelected ? "page" : undefined}
                                                className={`min-w-[150px] border-l-2 px-4 py-3 text-left transition-colors md:min-w-0 ${
                                                    isSelected
                                                        ? "border-[#4AF2A1] bg-[#0a234d] text-white"
                                                        : "border-transparent text-slate-400 hover:bg-[#071a38] hover:text-white"
                                                }`}
                                            >
                                                <span className="block text-[12px] tracking-wider">{category.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={resetUserSettings}
                                    className="mt-3 shrink-0 px-4 py-3 text-left text-[11px] tracking-wider text-[#FF8A80] hover:bg-[#D50000]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A80] md:mt-auto"
                                >
                                    설정 초기화
                                </button>
                            </nav>

                            <div className="min-h-0 flex-1 overflow-y-auto bg-[#041430] px-4 py-5 text-sm text-slate-300 sm:px-7 sm:py-6">
                                <div className="space-y-2">
                            {/* 1열: 시간 및 동기화 */}
                            <SettingsSection
                                id="time"
                                isOpen={openConfigSection === "time"}
                            >
                                <div className="mb-5 flex items-center justify-between rounded border border-[#162e58] bg-[#051126]/70 px-4 py-3">
                                    <span className="text-[11px] tracking-wide text-slate-400">마지막 데이터 업데이트</span>
                                    <span className="text-[12px] tracking-wider text-[#4AF2A1]">{lastUpdateLabel}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <div className="flex justify-between">
                                            <span>과거 항공편 표시 범위</span>
                                            <span className="text-[#4AF2A1]">- {pastHours} 시간</span>
                                        </div>
                                        <input type="range" min="1" max="24" value={pastHours} onChange={(e) => setPastHours(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between">
                                            <span>미래 항공편 표시 범위</span>
                                            <span className="text-[#4AF2A1]">+ {futureHours} 시간</span>
                                        </div>
                                        <input type="range" min="1" max="24" value={futureHours} onChange={(e) => setFutureHours(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between">
                                            <span>API 갱신 주기</span>
                                            <span className="text-[#4AF2A1]">{apiSyncInterval} 분</span>
                                        </div>
                                        <input type="range" min="5" max="30" value={apiSyncInterval} onChange={(e) => setApiSyncInterval(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                </div>
                            </SettingsSection>

                            {/* 2열: 레이아웃 크기 */}
                            <SettingsSection
                                id="size"
                                isOpen={openConfigSection === "size"}
                            >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <div className="flex justify-between">
                                        <span>페이지당 줄 개수</span>
                                        <span className="text-[#4AF2A1]">{itemsPerPage} 행</span>
                                    </div>
                                    <input type="range" min="5" max="20" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between">
                                        <span>행 높이</span>
                                        <span className="text-[#4AF2A1]">{rowHeight}px</span>
                                    </div>
                                    <input type="range" min="40" max="95" value={rowHeight} onChange={(e) => setRowHeight(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between">
                                        <span>글자 크기</span>
                                        <span className="text-[#4AF2A1]">{fontSize}px</span>
                                    </div>
                                    <input type="range" min="14" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </div>
                            </SettingsSection>

                            {/* 3열: 페이지 및 전환 */}
                            <SettingsSection
                                id="pages"
                                isOpen={openConfigSection === "pages"}
                            >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <div className="flex justify-between">
                                        <span>페이지 전환 간격</span>
                                        <span className="text-[#4AF2A1]">{flipInterval} 초</span>
                                    </div>
                                    <input type="range" min="5" max="60" value={flipInterval} onChange={(e) => setFlipInterval(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between">
                                        <span>최대 생성 페이지</span>
                                        <span className="text-[#4AF2A1]">{maxPages} P</span>
                                    </div>
                                    <input type="range" min="1" max="30" value={maxPages} onChange={(e) => setMaxPages(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between">
                                        <span>공동운항 표기 전환 간격</span>
                                        <span className="text-[#4AF2A1]">{codeshareFlipInterval} 초</span>
                                    </div>
                                    <input type="range" min="1" max="10" value={codeshareFlipInterval} onChange={(e) => setCodeshareFlipInterval(parseInt(e.target.value))} className="w-full mt-1 accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </div>
                            </SettingsSection>

                            {/* 4열: 항목 토글 */}
                            <SettingsSection
                                id="visibility"
                                isOpen={openConfigSection === "visibility"}
                            >
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={!flightFirst} onChange={() => setFlightFirst(!flightFirst)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${!flightFirst ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${!flightFirst ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${!flightFirst ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>편명 우측 표기</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showHeader} onChange={() => setShowHeader(!showHeader)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showHeader ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showHeader ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showHeader ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>메인 헤더</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={smoothTransition} onChange={() => setSmoothTransition(!smoothTransition)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${smoothTransition ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${smoothTransition ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${smoothTransition ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>부드러운 전환</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showLogo} onChange={() => setShowLogo(!showLogo)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showLogo ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showLogo ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showLogo ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>항공사 로고</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showTerminal} onChange={() => setShowTerminal(!showTerminal)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showTerminal ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showTerminal ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showTerminal ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>터미널</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showCheckin} onChange={() => setShowCheckin(!showCheckin)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showCheckin ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showCheckin ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showCheckin ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>체크인 카운터</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showCodeshare} onChange={() => setShowCodeshare(!showCodeshare)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showCodeshare ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showCodeshare ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showCodeshare ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>코드쉐어편</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showDeparted} onChange={() => setShowDeparted(!showDeparted)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showDeparted ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showDeparted ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showDeparted ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>출발완료편</span>
                                </label>
                            </div>
                            </SettingsSection>

                            {/* 5열: 색상 */}
                            <SettingsSection
                                id="colors"
                                isOpen={openConfigSection === "colors"}
                            >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">메인 헤더</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} />
                                        <input type="text" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="w-[60px] bg-[#051126] text-white text-[10px] font-mono text-center border border-[#162e58] rounded py-1 uppercase outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">테이블 헤더</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={tableHeaderColor} onChange={(e)=>setTableHeaderColor(e.target.value)} />
                                        <input type="text" value={tableHeaderColor} onChange={(e)=>setTableHeaderColor(e.target.value)} className="w-[60px] bg-[#051126] text-white text-[10px] font-mono text-center border border-[#162e58] rounded py-1"/>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">홀수행</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={oddRowColor} onChange={(e) => setOddRowColor(e.target.value)} />
                                        <input type="text" value={oddRowColor} onChange={(e) => setOddRowColor(e.target.value)} className="w-[60px] bg-[#051126] text-white text-[10px] font-mono text-center border border-[#162e58] rounded py-1 uppercase outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">짝수행</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={evenRowColor} onChange={(e) => setEvenRowColor(e.target.value)} />
                                        <input type="text" value={evenRowColor} onChange={(e) => setEvenRowColor(e.target.value)} className="w-[60px] bg-[#051126] text-white text-[10px] font-mono text-center border border-[#162e58] rounded py-1 uppercase outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">페이지 바</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={footerColor} onChange={(e)=>setFooterColor(e.target.value)} />
                                        <input type="text" value={footerColor} onChange={(e)=>setFooterColor(e.target.value)} className="w-[60px] bg-[#051126] text-white text-[10px] font-mono text-center border border-[#162e58] rounded py-1"/>
                                    </div>
                                </div>
                            </div>
                            </SettingsSection>

                            {/* 6열: 색상 강조 토글 */}
                            <SettingsSection
                                id="highlight"
                                isOpen={openConfigSection === "highlight"}
                            >
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={highlightChange} onChange={() => setHighlightChange(!highlightChange)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${highlightChange ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${highlightChange ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${highlightChange ? 'text-[#FACC15]' : 'text-slate-400'}`}>변경 강조</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={highlightTerminal} onChange={() => setHighlightTerminal(!highlightTerminal)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${highlightTerminal ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${highlightTerminal ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${highlightTerminal ? 'text-[#FACC15]' : 'text-slate-400'}`}>터미널 강조</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={highlightCheckin} onChange={() => setHighlightCheckin(!highlightCheckin)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${highlightCheckin ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${highlightCheckin ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${highlightCheckin ? 'text-[#FACC15]' : 'text-slate-400'}`}>체크인 강조</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={highlightGate} onChange={() => setHighlightGate(!highlightGate)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${highlightGate ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${highlightGate ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${highlightGate ? 'text-[#FACC15]' : 'text-slate-400'}`}>탑승구 강조</span>
                                </label>
                            </div>
                            </SettingsSection>

                        {/* 7. 가로 너비/비율 세밀 조정 */}
                        <div className="mt-2">
                        <SettingsSection
                            id="widths"
                            isOpen={openConfigSection === "widths"}
                        >
                            <p className="mb-4 text-[10px] tracking-wide text-slate-400">도착지를 0으로 설정하면 남은 공간을 자동으로 채웁니다.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs text-slate-300">
                                <div>
                                    <div className="flex justify-between mb-1"><span>시간</span><span className="text-[#4AF2A1]">{wTime}px</span></div>
                                    <input type="range" min="30" max="300" value={wTime} onChange={(e) => setWTime(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>변경 시간</span><span className="text-[#4AF2A1]">{wChange}px</span></div>
                                    <input type="range" min="30" max="300" value={wChange} onChange={(e) => setWChange(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>실제운항 로고</span><span className="text-[#4AF2A1]">{wActualLogo}px</span></div>
                                    <input type="range" min="20" max="150" value={wActualLogo} onChange={(e) => setWActualLogo(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>실제운항 편명</span><span className="text-[#4AF2A1]">{wActualNum}px</span></div>
                                    <input type="range" min="30" max="300" value={wActualNum} onChange={(e) => setWActualNum(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>공동운항 로고</span><span className="text-[#4AF2A1]">{wCodeLogo}px</span></div>
                                    <input type="range" min="20" max="150" value={wCodeLogo} onChange={(e) => setWCodeLogo(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>공동운항 편명</span><span className="text-[#4AF2A1]">{wCodeNum}px</span></div>
                                    <input type="range" min="30" max="300" value={wCodeNum} onChange={(e) => setWCodeNum(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>도착지</span><span className="text-[#4AF2A1]">{wDest === 0 ? '자동(1fr)' : `${wDest}px`}</span></div>
                                    <input type="range" min="0" max="800" value={wDest} onChange={(e) => setWDest(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>터미널</span><span className="text-[#4AF2A1]">{wTerminal}px</span></div>
                                    <input type="range" min="30" max="300" value={wTerminal} onChange={(e) => setWTerminal(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>체크인</span><span className="text-[#4AF2A1]">{wCheckin}px</span></div>
                                    <input type="range" min="30" max="400" value={wCheckin} onChange={(e) => setWCheckin(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>탑승구</span><span className="text-[#4AF2A1]">{wGate}px</span></div>
                                    <input type="range" min="30" max="300" value={wGate} onChange={(e) => setWGate(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span>현황</span><span className="text-[#4AF2A1]">{wStatus}px</span></div>
                                    <input type="range" min="30" max="400" value={wStatus} onChange={(e) => setWStatus(parseInt(e.target.value))} className="w-full accent-[#458cff] bg-[#051126] h-2 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </div>
                        </SettingsSection>
                        </div>

                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 하단 상태 바 */}
            <div className="relative z-20 flex flex-col bg-[#030b1a]/95 shadow-2xl">
                <footer className="relative flex items-center border-t border-[#162e58]/50" style={{ height: `${rowHeight}px`, backgroundColor: footerColor }}>
                    <div className="z-10 flex h-full items-center pl-2">
                        <button
                            type="button"
                            onClick={() => setShowConfig(!showConfig)}
                            aria-label={showConfig ? "설정 패널 닫기" : "설정 패널 열기"}
                            aria-expanded={showConfig}
                            title={showConfig ? "설정 닫기" : "설정 열기"}
                            className="flex h-11 w-12 items-center justify-center bg-transparent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AF2A1]"
                        >
                            <svg viewBox="0 0 24 24" width="31" height="31" aria-hidden="true" focusable="false">
                                <path d="M3 5.5h18M3 12h18M3 18.5h18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                            </svg>
                        </button>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 text-white tracking-widest h-full flex items-center pointer-events-none" style={{ fontSize: `${fontSize}px` }}>
                            {currentPage + 1}
                        </div>
                    )}

                    <div className="absolute right-3 sm:right-6 top-0 h-full flex items-center text-white tracking-wider pointer-events-none" style={{ fontSize: `${fontSize}px` }}>
                        {getShortTimeString(currentTime)}
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;

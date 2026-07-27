import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    DEFAULT_SETTINGS,
    FONT_OPTIONS,
    clearUserSettings,
    getAutoLayoutSettings,
    getFontFamily,
    loadUserSettings,
    saveUserSettings
} from "./settings";
import AirlineLogo from "./AirlineLogo";
import { buildDisplayFlights } from "./displayFlights";
import {
    getDestinationName,
    getStatusKey,
    getStatusText
} from "./flightTranslations";

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

const getFlightTerminal = (gateNumber, terminalId) => {
    const normalizedTerminal = String(terminalId || "").trim().toUpperCase();
    const terminalFromId = ["T2", "P02", "2"].includes(normalizedTerminal)
        ? "T2"
        : ["T1", "P01", "1"].includes(normalizedTerminal)
            ? "T1"
            : null;
    if (!gateNumber) return terminalFromId || "T1";
    const gate = parseInt(gateNumber, 10);
    if (Number.isNaN(gate)) return terminalFromId || "T1";
    if (gate >= 1 && gate <= 199) return "T1";
    if (gate >= 200 && gate <= 299) return "T2";
    return terminalFromId || "T1";
};

const SETTINGS_CATEGORIES = [
    { id: "time", title: "시간 및 동기화" },
    { id: "size", title: "화면 및 글꼴" },
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

function NumericRange({ label, value, onChange, min, max, unit = "px", displayValue }) {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
        setDraft(String(value));
    }, [value]);

    const commitDraft = () => {
        const parsed = Number(draft);
        const nextValue = Number.isFinite(parsed)
            ? Math.min(max, Math.max(min, Math.round(parsed)))
            : value;
        onChange(nextValue);
        setDraft(String(nextValue));
    };

    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-2">
                <span>{label}</span>
                <label className="flex items-center gap-1 text-[#4AF2A1]">
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={draft}
                        onChange={(event) => {
                            const nextDraft = event.target.value;
                            setDraft(nextDraft);
                            const parsed = Number(nextDraft);
                            if (nextDraft !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                                onChange(Math.round(parsed));
                            }
                        }}
                        onBlur={commitDraft}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        aria-label={`${label} 직접 입력`}
                        className="w-16 rounded border border-[#162e58] bg-[#051126] px-1 py-1 text-right text-[11px] text-[#4AF2A1] outline-none focus:border-[#458cff]"
                    />
                    <span>{unit}</span>
                </label>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(parseInt(event.target.value, 10))}
                aria-label={`${label} 슬라이더`}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#051126] accent-[#458cff]"
            />
            {displayValue && <div className="mt-1 text-right text-[10px] text-slate-400">{displayValue}</div>}
        </div>
    );
}

function OverflowText({ text, align = "center", className = "" }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const textElement = textRef.current;
        if (!container || !textElement) return undefined;
        let isDisposed = false;

        const checkOverflow = () => {
            if (isDisposed) return;
            const textWidth = Math.ceil(textElement.getBoundingClientRect().width);
            setIsOverflowing(textWidth > container.clientWidth + 1);
        };

        checkOverflow();
        const resizeObserver = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(checkOverflow);
        resizeObserver?.observe(container);
        resizeObserver?.observe(textElement);
        window.addEventListener("resize", checkOverflow);
        document.fonts?.ready.then(checkOverflow);

        return () => {
            isDisposed = true;
            resizeObserver?.disconnect();
            window.removeEventListener("resize", checkOverflow);
        };
    }, [text]);

    const duration = Math.max(6, String(text).length * 0.45);

    return (
        <div
            ref={containerRef}
            className={`marquee-viewport ${align === "left" ? "is-left-aligned" : ""} ${isOverflowing ? "is-overflowing" : ""} ${className}`}
        >
            <div
                className={isOverflowing ? "marquee-track" : "marquee-static"}
                style={isOverflowing ? { "--marquee-duration": `${duration}s` } : undefined}
            >
                <span className={isOverflowing ? "marquee-copy" : "marquee-copy-static"}>
                    <span ref={textRef}>{text}</span>
                </span>
            </div>
        </div>
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
    const boardRef = useRef(null);
    const [boardWidth, setBoardWidth] = useState(() => (
        typeof window === "undefined" ? 1920 : window.innerWidth
    ));
    
    // 1. 디스플레이 제어
    const [itemsPerPage, setItemsPerPage] = useState(initialSettings.itemsPerPage);
    const [rowHeight, setRowHeight] = useState(initialSettings.rowHeight);
    const [fontSize, setFontSize] = useState(initialSettings.fontSize);
    const [fontFamily, setFontFamily] = useState(initialSettings.fontFamily);
    const [boldFont, setBoldFont] = useState(initialSettings.boldFont);
    const [logoSize, setLogoSize] = useState(initialSettings.logoSize);
    
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
    const [multilineCodeshare, setMultilineCodeshare] = useState(initialSettings.multilineCodeshare);
    const [showEnglish, setShowEnglish] = useState(initialSettings.showEnglish);
    const [showDestinationLanguage, setShowDestinationLanguage] = useState(initialSettings.showDestinationLanguage);
    const [showDeparted, setShowDeparted] = useState(initialSettings.showDeparted);
    const [showHeader, setShowHeader] = useState(initialSettings.showHeader);
    const [flightFirst, setFlightFirst] = useState(initialSettings.flightFirst);
    const [attachFooterToRows, setAttachFooterToRows] = useState(initialSettings.attachFooterToRows);
    const [terminalFilter, setTerminalFilter] = useState(initialSettings.terminalFilter);
    const [displayLanguage, setDisplayLanguage] = useState("ko");

    // 3-1. 색상 강조 토글
    const [highlightChange, setHighlightChange] = useState(initialSettings.highlightChange);
    const [highlightTerminal, setHighlightTerminal] = useState(initialSettings.highlightTerminal);
    const [highlightCheckin, setHighlightCheckin] = useState(initialSettings.highlightCheckin);
    const [highlightGate, setHighlightGate] = useState(initialSettings.highlightGate);
    const [highlightCurrentTime, setHighlightCurrentTime] = useState(initialSettings.highlightCurrentTime);
    const [blinkBoardingStatus, setBlinkBoardingStatus] = useState(initialSettings.blinkBoardingStatus);
    const [blinkClosingStatus, setBlinkClosingStatus] = useState(initialSettings.blinkClosingStatus);

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
    const [delayedStatusColor, setDelayedStatusColor] = useState(initialSettings.delayedStatusColor);
    const [cancelledStatusColor, setCancelledStatusColor] = useState(initialSettings.cancelledStatusColor);
    const [highlightTextColor, setHighlightTextColor] = useState(initialSettings.highlightTextColor);

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
    const [autoDestWidth, setAutoDestWidth] = useState(initialSettings.autoDestWidth);

    useEffect(() => {
        saveUserSettings({
            itemsPerPage,
            rowHeight,
            fontSize,
            fontFamily,
            boldFont,
            logoSize,
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
            multilineCodeshare,
            showEnglish,
            showDestinationLanguage,
            showDeparted,
            showHeader,
            flightFirst,
            attachFooterToRows,
            terminalFilter,
            autoDestWidth,
            highlightChange,
            highlightTerminal,
            highlightCheckin,
            highlightGate,
            highlightCurrentTime,
            blinkBoardingStatus,
            blinkClosingStatus,
            codeshareFlipInterval,
            headerColor,
            tableHeaderColor,
            footerColor,
            oddRowColor,
            evenRowColor,
            delayedStatusColor,
            cancelledStatusColor,
            highlightTextColor,
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
        itemsPerPage, rowHeight, fontSize, fontFamily, boldFont, logoSize, pastHours, futureHours, apiSyncInterval,
        flipInterval, maxPages, smoothTransition, showLogo, showTerminal,
        showCheckin, showCodeshare, multilineCodeshare, showEnglish, showDestinationLanguage,
        showDeparted, showHeader, flightFirst,
        attachFooterToRows, terminalFilter, autoDestWidth,
        highlightChange, highlightTerminal, highlightCheckin, highlightGate, highlightCurrentTime,
        blinkBoardingStatus, blinkClosingStatus,
        codeshareFlipInterval, headerColor, tableHeaderColor, footerColor,
        oddRowColor, evenRowColor, delayedStatusColor, cancelledStatusColor, highlightTextColor,
        wTime, wChange, wActualLogo, wActualNum,
        wCodeLogo, wCodeNum, wDest, wTerminal, wCheckin, wGate, wStatus
    ]);

    const resetUserSettings = () => {
        if (!window.confirm("설정을 기본값으로 초기화하시겠습니까?")) return;

        clearUserSettings();
        const autoLayout = getAutoLayoutSettings(window.innerWidth, window.innerHeight);
        setItemsPerPage(autoLayout.itemsPerPage);
        setRowHeight(autoLayout.rowHeight);
        setFontSize(autoLayout.fontSize);
        setFontFamily(DEFAULT_SETTINGS.fontFamily);
        setBoldFont(DEFAULT_SETTINGS.boldFont);
        setLogoSize(autoLayout.logoSize);
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
        setMultilineCodeshare(DEFAULT_SETTINGS.multilineCodeshare);
        setShowEnglish(DEFAULT_SETTINGS.showEnglish);
        setShowDestinationLanguage(DEFAULT_SETTINGS.showDestinationLanguage);
        setShowDeparted(DEFAULT_SETTINGS.showDeparted);
        setShowHeader(DEFAULT_SETTINGS.showHeader);
        setFlightFirst(DEFAULT_SETTINGS.flightFirst);
        setAttachFooterToRows(DEFAULT_SETTINGS.attachFooterToRows);
        setTerminalFilter(DEFAULT_SETTINGS.terminalFilter);
        setAutoDestWidth(DEFAULT_SETTINGS.autoDestWidth);
        setHighlightChange(DEFAULT_SETTINGS.highlightChange);
        setHighlightTerminal(DEFAULT_SETTINGS.highlightTerminal);
        setHighlightCheckin(DEFAULT_SETTINGS.highlightCheckin);
        setHighlightGate(DEFAULT_SETTINGS.highlightGate);
        setHighlightCurrentTime(DEFAULT_SETTINGS.highlightCurrentTime);
        setBlinkBoardingStatus(DEFAULT_SETTINGS.blinkBoardingStatus);
        setBlinkClosingStatus(DEFAULT_SETTINGS.blinkClosingStatus);
        setCodeshareFlipInterval(DEFAULT_SETTINGS.codeshareFlipInterval);
        setHeaderColor(DEFAULT_SETTINGS.headerColor);
        setTableHeaderColor(DEFAULT_SETTINGS.tableHeaderColor);
        setFooterColor(DEFAULT_SETTINGS.footerColor);
        setOddRowColor(DEFAULT_SETTINGS.oddRowColor);
        setEvenRowColor(DEFAULT_SETTINGS.evenRowColor);
        setDelayedStatusColor(DEFAULT_SETTINGS.delayedStatusColor);
        setCancelledStatusColor(DEFAULT_SETTINGS.cancelledStatusColor);
        setHighlightTextColor(DEFAULT_SETTINGS.highlightTextColor);
        setWTime(autoLayout.wTime);
        setWChange(autoLayout.wChange);
        setWActualLogo(autoLayout.wActualLogo);
        setWActualNum(autoLayout.wActualNum);
        setWCodeLogo(autoLayout.wCodeLogo);
        setWCodeNum(autoLayout.wCodeNum);
        setWDest(autoLayout.wDest);
        setWTerminal(autoLayout.wTerminal);
        setWCheckin(autoLayout.wCheckin);
        setWGate(autoLayout.wGate);
        setWStatus(autoLayout.wStatus);
        setCurrentPage(0);
        setDisplayLanguage("ko");
    };

    useEffect(() => {
        if (fontSize > rowHeight) setFontSize(rowHeight);
    }, [fontSize, rowHeight]);

    const maxLogoSize = Math.max(10, Math.floor(rowHeight * (16 / 9)));
    useEffect(() => {
        if (logoSize > maxLogoSize) setLogoSize(maxLogoSize);
    }, [logoSize, maxLogoSize]);

    const filteredFlightsRef = useRef([]);
    const apiRetryTimerRef = useRef(null);
    useEffect(() => {
        filteredFlightsRef.current = buildDisplayFlights(
            filteredFlights,
            showCodeshare,
            multilineCodeshare
        );
        setCurrentPage(0);
    }, [filteredFlights, showCodeshare, multilineCodeshare]);

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

    useLayoutEffect(() => {
        const board = boardRef.current;
        if (!board) return undefined;

        const updateBoardWidth = () => {
            setBoardWidth(Math.max(1, Math.floor(board.getBoundingClientRect().width)));
        };

        updateBoardWidth();
        const resizeObserver = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(updateBoardWidth);
        resizeObserver?.observe(board);
        window.addEventListener("resize", updateBoardWidth);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateBoardWidth);
        };
    }, []);

    const displayLanguages = useMemo(() => [
        "ko",
        ...(showEnglish ? ["en"] : []),
        ...(showDestinationLanguage ? ["destination"] : [])
    ], [showEnglish, showDestinationLanguage]);
    const languageStepDuration = (flipInterval * 1000) / displayLanguages.length;

    useEffect(() => {
        setDisplayLanguage("ko");
    }, [showEnglish, showDestinationLanguage]);

    useEffect(() => {
        if (showDisclaimer) return; // 약관 동의 전에는 페이지 전환을 하지 않음
        const pageTimer = setInterval(() => {
            const totalItems = filteredFlightsRef.current.length;
            const actualMaxPage = Math.ceil(totalItems / itemsPerPage);
            const maxPageLimit = Math.min(actualMaxPage, maxPages);
            const currentLanguageIndex = displayLanguages.indexOf(displayLanguage);
            const nextLanguageIndex = (currentLanguageIndex + 1) % displayLanguages.length;
            const shouldAdvancePage = nextLanguageIndex === 0;

            const advanceDisplay = () => {
                setDisplayLanguage(displayLanguages[nextLanguageIndex]);
                if (shouldAdvancePage && totalItems > 0) {
                    setCurrentPage(p => (p + 1) % (maxPageLimit || 1));
                }
            };

            if (smoothTransition) {
                setIsFading(true);
                setTimeout(() => {
                    advanceDisplay();
                    setIsFading(false);
                }, Math.min(500, languageStepDuration / 2));
            } else {
                advanceDisplay();
            }
        }, languageStepDuration);

        return () => clearInterval(pageTimer);
    }, [
        displayLanguage,
        displayLanguages,
        itemsPerPage,
        languageStepDuration,
        maxPages,
        smoothTransition,
        showDisclaimer
    ]);

    useEffect(() => {
        if (showDisclaimer || multilineCodeshare) return undefined;
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
    }, [codeshareFlipInterval, multilineCodeshare, smoothTransition, showDisclaimer]);

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
                if (terminalFilter !== "all" && getFlightTerminal(flight.gateNumber, flight.terminalId) !== terminalFilter) {
                    return false;
                }
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
    }, [currentMinute, flights, showDeparted, pastHours, futureHours, terminalFilter]);

    const displayFlights = buildDisplayFlights(filteredFlights, showCodeshare, multilineCodeshare);
    const pageData = displayFlights.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const totalPages = Math.min(Math.ceil(displayFlights.length / itemsPerPage), maxPages);

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

    const renderStatusAndStyle = (flight) => {
        const status = flight.remark || "정시";
        const statusKey = getStatusKey(status);
        const statusText = getStatusText(statusKey, displayLanguage, flight.airportCode);
        const baseClass = "w-full h-full flex items-center justify-center font-black text-center ";
        
        if (statusKey === "boarding") {
            return <div className={`${baseClass} text-white ${blinkBoardingStatus ? "animate-pulse" : ""}`}><OverflowText text={statusText} /></div>;
        } else if (statusKey === "goToGate") {
            return <div className={`${baseClass} text-white`}><OverflowText text={statusText} /></div>;
        } else if (statusKey === "finalCall") {
            return <div className={`${baseClass} text-[#FFD700] ${blinkClosingStatus ? "animate-pulse" : ""}`}><OverflowText text={statusText} /></div>;
        } else if (statusKey === "delayed") {
            return <div className={`${baseClass} text-white`} style={{ backgroundColor: delayedStatusColor }}><OverflowText text={statusText} /></div>;
        } else if (statusKey === "cancelled") {
            return <div className={`${baseClass} text-white`} style={{ backgroundColor: cancelledStatusColor }}><OverflowText text={statusText} /></div>;
        } else if (statusKey === "departed") {
            return <div className={`${baseClass} text-slate-400`}><OverflowText text={statusText} /></div>;
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

    const fixedColumnsWidth = timeColWidth
        + changeColWidth
        + flightColWidth
        + (showTerminal ? terminalColWidth : 0)
        + (showCheckin ? checkinColWidth : 0)
        + gateColWidth
        + statusColWidth;
    const desiredDestWidth = autoDestWidth
        ? Math.max(40, boardWidth - fixedColumnsWidth)
        : scalePx(wDest);
    const desiredBoardWidth = fixedColumnsWidth + desiredDestWidth;
    const responsiveScale = desiredBoardWidth > boardWidth
        ? boardWidth / desiredBoardWidth
        : 1;
    const responsiveWidth = (width) => Math.max(0, width * responsiveScale);

    const responsiveTimeWidth = responsiveWidth(timeColWidth);
    const responsiveChangeWidth = responsiveWidth(changeColWidth);
    const responsiveFlightWidth = responsiveWidth(flightColWidth);
    const responsiveDestWidth = responsiveWidth(desiredDestWidth);
    const responsiveTerminalWidth = responsiveWidth(terminalColWidth);
    const responsiveCheckinWidth = responsiveWidth(checkinColWidth);
    const responsiveGateWidth = responsiveWidth(gateColWidth);
    const responsiveStatusWidth = responsiveWidth(statusColWidth);

    const responsiveActualWidth = responsiveWidth(actualColWidth);
    const responsiveCodeshareWidth = responsiveWidth(codeshareColWidth);
    const responsiveActualLogoWidth = responsiveWidth(scaledActualLogo);
    const responsiveActualNumWidth = responsiveWidth(scaledActualNum);
    const responsiveCodeLogoWidth = responsiveWidth(scaledCodeLogo);
    const responsiveCodeNumWidth = responsiveWidth(scaledCodeNum);

    let gridColsStructure = flightFirst
        ? `${responsiveTimeWidth}px ${responsiveChangeWidth}px ${responsiveFlightWidth}px ${responsiveDestWidth}px`
        : `${responsiveTimeWidth}px ${responsiveChangeWidth}px ${responsiveDestWidth}px ${responsiveFlightWidth}px`;
    
    if (showTerminal) gridColsStructure += ` ${responsiveTerminalWidth}px`;
    if (showCheckin) gridColsStructure += ` ${responsiveCheckinWidth}px`;
    gridColsStructure += ` ${responsiveGateWidth}px ${responsiveStatusWidth}px`;

    const dynamicGridStyle = {
        display: "grid",
        gridTemplateColumns: gridColsStructure,
        alignItems: "stretch", 
        height: `${rowHeight}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${rowHeight}px`
    };
    const isForeignLanguage = displayLanguage !== "ko";
    const tableHeaders = isForeignLanguage
        ? {
            time: "Time",
            change: "New",
            flight: "Flight",
            destination: "To",
            terminal: "Terminal",
            counter: "Counter",
            gate: "Gate",
            status: "Status"
        }
        : {
            time: "시간",
            change: "변경",
            flight: "편명",
            destination: "도착지",
            terminal: "터미널",
            counter: "카운터",
            gate: "탑승구",
            status: "현황"
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
        <div
            className={`min-h-screen bg-[#051126] text-[#F8FAFC] flex flex-col select-none overflow-hidden relative ${attachFooterToRows ? "justify-start" : "justify-between"}`}
            style={{
                "--fids-font-family": getFontFamily(fontFamily),
                "--fids-font-weight": boldFont ? 900 : 400,
                "--highlight-text-color": highlightTextColor
            }}
        >
            
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
                                출발 Departures
                            </span>
                        </div>
                    </header>
                )}

                <div ref={boardRef} className="w-full overflow-hidden" aria-label="출발 항공편 전광판">
                    <div style={{...dynamicGridStyle, backgroundColor: tableHeaderColor}} className="border-b border-[#1b2d4a] text-white uppercase tracking-wider text-center">
                        <div className="flex min-w-0 items-center justify-center"><OverflowText text={tableHeaders.time} /></div>
                        <div className="flex min-w-0 items-center justify-center"><OverflowText text={tableHeaders.change} /></div>
                        {flightFirst ? (
                            <React.Fragment>
                                <div className="flex min-w-0 items-center justify-center text-center"><OverflowText text={tableHeaders.flight} /></div>
                                <div className="flex min-w-0 items-center justify-center text-center"><OverflowText text={tableHeaders.destination} /></div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <div className="flex min-w-0 items-center justify-center text-center"><OverflowText text={tableHeaders.destination} /></div>
                                <div className="flex min-w-0 items-center justify-center text-center"><OverflowText text={tableHeaders.flight} /></div>
                            </React.Fragment>
                        )}
                        
                        {showTerminal && <div className="flex min-w-0 items-center justify-center text-white"><OverflowText text={tableHeaders.terminal} /></div>}
                        {showCheckin && <div className="flex min-w-0 items-center justify-center text-white"><OverflowText text={tableHeaders.counter} /></div>}
                        
                        <div className="flex min-w-0 items-center justify-center"><OverflowText text={tableHeaders.gate} /></div>
                        <div className="flex min-w-0 items-center justify-center"><OverflowText text={tableHeaders.status} /></div>
                    </div>

                    <div className="divide-y divide-[#162e58]/20">
                        {pageData.length > 0 ? (
                            pageData.map((flight, idx) => {
                                const currentRowBg = idx % 2 === 0 ? oddRowColor : evenRowColor;
                                const schedTime = formatTime(flight.scheduleDatetime || flight.scheduleDateTime);
                                const codeshareList = flight.codeshareList || [];
                                const currentCodeshareId = codeshareList.length > 0 ? codeshareList[codeshareIndex % codeshareList.length] : null;
                                const leftFlightId = flight.displayFlightIds?.[0] || flight.flightId;
                                const rightFlightId = flight.displayFlightIds?.[1] || (
                                    multilineCodeshare ? null : currentCodeshareId
                                );

                                const renderFlightSlot = (flightId, side, shouldFade = false) => {
                                    const isRight = side === "right";
                                    const slotWidth = isRight ? responsiveCodeshareWidth : responsiveActualWidth;
                                    const logoSlotWidth = isRight ? responsiveCodeLogoWidth : responsiveActualLogoWidth;
                                    const numberSlotWidth = isRight ? responsiveCodeNumWidth : responsiveActualNumWidth;
                                    const info = flightId ? parseFlightId(flightId) : null;
                                    const fadeClass = shouldFade
                                        ? `transition-opacity duration-300 ${isCodeshareFading ? "opacity-0" : "opacity-100"}`
                                        : "";

                                    return (
                                        <div
                                            className="flex h-full min-w-0 shrink-0 items-center overflow-hidden"
                                            style={{ width: `${slotWidth}px` }}
                                        >
                                            {info && showLogo && (
                                                <div
                                                    className={`flex h-full min-w-0 shrink-0 items-center justify-start overflow-hidden pl-2 ${fadeClass}`}
                                                    style={{ width: `${logoSlotWidth}px` }}
                                                >
                                                    <AirlineLogo flightId={flightId} logoSize={Math.min(logoSize, maxLogoSize)} />
                                                </div>
                                            )}
                                            {info && (
                                                <div
                                                    className={`flex min-w-0 shrink-0 items-center overflow-hidden pl-2 ${fadeClass}`}
                                                    style={{ width: `${numberSlotWidth}px` }}
                                                >
                                                    <OverflowText text={`${info.code} ${info.num}`.trim()} align="left" className="text-left text-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                };

                                const destinationCell = (
                                    <div className="flex min-w-0 items-center overflow-hidden pl-3 text-left tracking-wide text-[#FFFFFF]">
                                        <OverflowText
                                            text={getDestinationName(
                                                flight.airportCode,
                                                formatAirportName(flight.airport),
                                                displayLanguage
                                            )}
                                            align="left"
                                        />
                                    </div>
                                );

                                const flightCell = (
                                    <div className="flex h-full min-w-0 items-center justify-start overflow-hidden">
                                        {renderFlightSlot(leftFlightId, "left")}
                                        {showCodeshare && renderFlightSlot(
                                            rightFlightId,
                                            "right",
                                            !multilineCodeshare
                                        )}
                                    </div>
                                );
                                
                                return (
                                    <div key={flight.displayRowKey || `${flight.flightId}-${idx}`} style={{ ...dynamicGridStyle, backgroundColor: currentRowBg }} className={`text-center items-center transition-colors duration-300 fade-content ${isFading ? 'is-fading' : ''}`}>
                                        
                                        <div className="flex min-w-0 items-center justify-center text-center text-[#FFFFFF]"><OverflowText text={schedTime} /></div>
                                        
                                        <div className="flex min-w-0 items-center justify-center text-center" style={{ color: highlightChange ? highlightTextColor : "#ffffff" }}>
                                            <OverflowText text={renderEstimatedTime(flight)} />
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
                                            <div className="flex min-w-0 items-center justify-center text-center tracking-wide" style={{ color: highlightTerminal ? highlightTextColor : "#ffffff" }}>
                                                <OverflowText text={getFlightTerminal(flight.gateNumber, flight.terminalId)} />
                                            </div>
                                        )}
                                        
                                        {showCheckin && (
                                            <div className="flex min-w-0 items-center justify-center text-center tracking-wide" style={{ color: highlightCheckin ? highlightTextColor : "#ffffff" }}>
                                                <OverflowText text={flight.chkinRange || "—"} />
                                            </div>
                                        )}
                                        
                                        <div className="flex min-w-0 items-center justify-center text-center" style={{ color: highlightGate ? highlightTextColor : "#ffffff" }}><OverflowText text={flight.gateNumber || "—"} /></div>
                                        
                                        <div className="h-full w-full flex items-center justify-center">
                                            {renderStatusAndStyle(flight)}
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <NumericRange label="페이지당 줄 개수" value={itemsPerPage} onChange={setItemsPerPage} min={1} max={100} unit="행" />
                                <NumericRange label="행 높이" value={rowHeight} onChange={setRowHeight} min={10} max={200} />
                                <NumericRange label="글자 크기" value={fontSize} onChange={setFontSize} min={5} max={rowHeight} />
                                <NumericRange label="로고 크기" value={logoSize} onChange={setLogoSize} min={10} max={maxLogoSize} />
                                <label>
                                    <span className="block mb-1">글꼴</span>
                                    <select
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                        className="h-9 w-full rounded border border-[#162e58] bg-[#051126] px-3 text-xs text-white outline-none focus:border-[#458cff]"
                                    >
                                        {FONT_OPTIONS.map((option) => (
                                            <option key={option.id} value={option.id}>{option.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={boldFont} onChange={() => setBoldFont(!boldFont)} />
                                        <div className={`block h-3 w-7 rounded-full transition-colors ${boldFont ? "bg-[#4AF2A1]" : "bg-[#1b3a6d]"}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] h-2 w-2 rounded-full bg-white transition-transform ${boldFont ? "translate-x-4" : ""}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${boldFont ? "text-[#4AF2A1]" : "text-slate-400"}`}>글꼴 굵게</span>
                                </label>
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
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                                        <input type="checkbox" className="sr-only" checked={showEnglish} onChange={() => setShowEnglish(!showEnglish)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showEnglish ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showEnglish ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showEnglish ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>영어 표시</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showDestinationLanguage} onChange={() => setShowDestinationLanguage(!showDestinationLanguage)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showDestinationLanguage ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showDestinationLanguage ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showDestinationLanguage ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>도착지 언어 표시</span>
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
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showCodeshare ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>공동운항편</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={showDeparted} onChange={() => setShowDeparted(!showDeparted)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${showDeparted ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${showDeparted ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${showDeparted ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>출발완료편</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={attachFooterToRows} onChange={() => setAttachFooterToRows(!attachFooterToRows)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${attachFooterToRows ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${attachFooterToRows ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${attachFooterToRows ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>페이지 바를 마지막 줄 아래에 표시</span>
                                </label>
                                <label className="flex items-center gap-3 text-[11px] tracking-wider text-slate-300">
                                    <span className="shrink-0">터미널 항공편</span>
                                    <select
                                        value={terminalFilter}
                                        onChange={(event) => setTerminalFilter(event.target.value)}
                                        className="h-8 min-w-0 flex-1 rounded border border-[#162e58] bg-[#051126] px-2 text-xs text-white outline-none focus:border-[#458cff]"
                                    >
                                        <option value="all">전체</option>
                                        <option value="T1">T1만</option>
                                        <option value="T2">T2만</option>
                                    </select>
                                </label>
                                <label className="flex items-center gap-3 text-[11px] tracking-wider text-slate-300">
                                    <span className="shrink-0">공동운항 표시</span>
                                    <select
                                        value={multilineCodeshare ? "multi" : "single"}
                                        onChange={(event) => setMultilineCodeshare(event.target.value === "multi")}
                                        className="h-8 min-w-0 flex-1 rounded border border-[#162e58] bg-[#051126] px-2 text-xs text-white outline-none focus:border-[#458cff]"
                                    >
                                        <option value="single">한 줄</option>
                                        <option value="multi">여러 줄</option>
                                    </select>
                                </label>
                            </div>
                            </SettingsSection>

                            {/* 5열: 색상 */}
                            <SettingsSection
                                id="colors"
                                isOpen={openConfigSection === "colors"}
                            >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">지연 배경</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={delayedStatusColor} onChange={(e) => setDelayedStatusColor(e.target.value)} />
                                        <input type="text" value={delayedStatusColor} onChange={(e) => setDelayedStatusColor(e.target.value)} className="w-[60px] rounded border border-[#162e58] bg-[#051126] py-1 text-center font-mono text-[10px] uppercase text-white outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">결항 배경</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={cancelledStatusColor} onChange={(e) => setCancelledStatusColor(e.target.value)} />
                                        <input type="text" value={cancelledStatusColor} onChange={(e) => setCancelledStatusColor(e.target.value)} className="w-[60px] rounded border border-[#162e58] bg-[#051126] py-1 text-center font-mono text-[10px] uppercase text-white outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold">강조 글자</span>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" value={highlightTextColor} onChange={(e) => setHighlightTextColor(e.target.value)} />
                                        <input type="text" value={highlightTextColor} onChange={(e) => setHighlightTextColor(e.target.value)} className="w-[60px] rounded border border-[#162e58] bg-[#051126] py-1 text-center font-mono text-[10px] uppercase text-white outline-none focus:border-[#458cff]" />
                                    </div>
                                </div>
                            </div>
                            </SettingsSection>

                            {/* 6열: 색상 강조 토글 */}
                            <SettingsSection
                                id="highlight"
                                isOpen={openConfigSection === "highlight"}
                            >
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={highlightCurrentTime} onChange={() => setHighlightCurrentTime(!highlightCurrentTime)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${highlightCurrentTime ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${highlightCurrentTime ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${highlightCurrentTime ? 'text-[#FACC15]' : 'text-slate-400'}`}>현재시간 강조</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={blinkBoardingStatus} onChange={() => setBlinkBoardingStatus(!blinkBoardingStatus)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${blinkBoardingStatus ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${blinkBoardingStatus ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${blinkBoardingStatus ? 'text-[#FACC15]' : 'text-slate-400'}`}>탑승중 깜박임</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={blinkClosingStatus} onChange={() => setBlinkClosingStatus(!blinkClosingStatus)} />
                                        <div className={`block w-7 h-3 rounded-full transition-colors ${blinkClosingStatus ? 'bg-[#FACC15]' : 'bg-[#1b3a6d]'}`}></div>
                                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${blinkClosingStatus ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className={`ml-3 text-[11px] tracking-wider transition-colors ${blinkClosingStatus ? 'text-[#FACC15]' : 'text-slate-400'}`}>마감예정 깜박임</span>
                                </label>
                            </div>
                            </SettingsSection>

                        {/* 7. 가로 너비/비율 세밀 조정 */}
                        <div className="mt-2">
                        <SettingsSection
                            id="widths"
                            isOpen={openConfigSection === "widths"}
                        >
                            <label className="mb-5 flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={autoDestWidth}
                                        onChange={() => setAutoDestWidth(!autoDestWidth)}
                                    />
                                    <div className={`block w-7 h-3 rounded-full transition-colors ${autoDestWidth ? 'bg-[#4AF2A1]' : 'bg-[#1b3a6d]'}`}></div>
                                    <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${autoDestWidth ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <span className={`ml-3 text-[11px] tracking-wider transition-colors ${autoDestWidth ? 'text-[#4AF2A1]' : 'text-slate-400'}`}>도착지 너비 자동 조절</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs text-slate-300">
                                <NumericRange label="시간" value={wTime} onChange={setWTime} min={30} max={300} />
                                <NumericRange label="변경 시간" value={wChange} onChange={setWChange} min={30} max={300} />
                                <NumericRange label="실제운항 로고" value={wActualLogo} onChange={setWActualLogo} min={20} max={150} />
                                <NumericRange label="실제운항 편명" value={wActualNum} onChange={setWActualNum} min={30} max={300} />
                                <NumericRange label="공동운항 로고" value={wCodeLogo} onChange={setWCodeLogo} min={20} max={150} />
                                <NumericRange label="공동운항 편명" value={wCodeNum} onChange={setWCodeNum} min={30} max={300} />
                                <div className={autoDestWidth ? "opacity-45" : ""}>
                                    <NumericRange label="도착지" value={wDest} onChange={setWDest} min={30} max={800} />
                                </div>
                                <NumericRange label="터미널" value={wTerminal} onChange={setWTerminal} min={30} max={300} />
                                <NumericRange label="체크인" value={wCheckin} onChange={setWCheckin} min={30} max={400} />
                                <NumericRange label="탑승구" value={wGate} onChange={setWGate} min={30} max={300} />
                                <NumericRange label="현황" value={wStatus} onChange={setWStatus} min={30} max={400} />
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

                    <div
                        className={`absolute right-3 top-0 flex h-full items-center tracking-wider pointer-events-none sm:right-6 ${highlightCurrentTime ? "current-time-highlight" : "text-white"}`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {getShortTimeString(currentTime)}
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;

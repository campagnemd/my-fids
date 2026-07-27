export const SETTINGS_STORAGE_KEY = "fids_user_settings_v1";

export const FONT_OPTIONS = Object.freeze([
  {
    id: "system",
    label: "시스템 기본",
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif'
  },
  {
    id: "gothic",
    label: "고딕",
    family: '"고딕", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
  },
  {
    id: "gothicche",
    label: "고딕체",
    family: '"고딕체", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'
  },
  {
    id: "batang",
    label: "바탕",
    family: '"Batang", "바탕", "AppleMyungjo", serif'
  },
  {
    id: "batangche",
    label: "바탕체",
    family: '"BatangChe", "바탕체", "Batang", "AppleMyungjo", serif'
  },
  {
    id: "gulim",
    label: "굴림",
    family: '"Gulim", "굴림", "Malgun Gothic", sans-serif'
  },
  {
    id: "gulimche",
    label: "굴림체",
    family: '"GulimChe", "굴림체", "Gulim", "Malgun Gothic", monospace'
  },
  {
    id: "dotum",
    label: "돋움",
    family: '"Dotum", "돋움", "Malgun Gothic", sans-serif'
  },
  {
    id: "dotumche",
    label: "돋움체",
    family: '"DotumChe", "돋움체", "Dotum", "Malgun Gothic", monospace'
  },
  {
    id: "gungsuh",
    label: "궁서",
    family: '"Gungsuh", "궁서", "Batang", serif'
  },
  {
    id: "gungsuhche",
    label: "궁서체",
    family: '"GungsuhChe", "궁서체", "Gungsuh", "Batang", serif'
  }
]);

export const getFontFamily = (fontId) => (
  FONT_OPTIONS.find((option) => option.id === fontId)?.family
  || FONT_OPTIONS[0].family
);

export const DEFAULT_SETTINGS = Object.freeze({
  itemsPerPage: 11,
  rowHeight: 55,
  fontSize: 24,
  fontFamily: "system",
  boldFont: true,
  logoSize: 97,
  pastHours: 6,
  futureHours: 12,
  apiSyncInterval: 10,
  flipInterval: 15,
  maxPages: 5,
  smoothTransition: false,
  showLogo: true,
  showTerminal: false,
  showCheckin: false,
  showCodeshare: true,
  multilineCodeshare: true,
  showEnglish: true,
  showDestinationLanguage: true,
  showDeparted: false,
  showHeader: false,
  flightFirst: true,
  attachFooterToRows: true,
  terminalFilter: "all",
  autoDestWidth: true,
  highlightChange: true,
  highlightTerminal: false,
  highlightCheckin: true,
  highlightGate: true,
  highlightCurrentTime: true,
  blinkBoardingStatus: false,
  blinkClosingStatus: false,
  codeshareFlipInterval: 2,
  headerColor: "#2f6bca",
  tableHeaderColor: "#000000",
  footerColor: "#030b1a",
  oddRowColor: "#5284a3",
  evenRowColor: "#5b97ae",
  delayedStatusColor: "#FF6D00",
  cancelledStatusColor: "#D50000",
  highlightTextColor: "#FACC15",
  wTime: 110,
  wChange: 110,
  wActualLogo: 100,
  wActualNum: 110,
  wCodeLogo: 100,
  wCodeNum: 110,
  wDest: 400,
  wTerminal: 110,
  wCheckin: 160,
  wGate: 140,
  wStatus: 180
});

const NUMBER_LIMITS = {
  itemsPerPage: [1, 100],
  rowHeight: [10, 200],
  fontSize: [5, 200],
  logoSize: [10, 355],
  pastHours: [1, 24],
  futureHours: [1, 24],
  apiSyncInterval: [5, 30],
  flipInterval: [5, 60],
  maxPages: [1, 30],
  codeshareFlipInterval: [1, 10],
  wTime: [30, 300],
  wChange: [30, 300],
  wActualLogo: [20, 150],
  wActualNum: [30, 300],
  wCodeLogo: [20, 150],
  wCodeNum: [30, 300],
  wDest: [30, 800],
  wTerminal: [30, 300],
  wCheckin: [30, 400],
  wGate: [30, 300],
  wStatus: [30, 400]
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Math.round(value)));

export const getAutoLayoutSettings = (viewportWidth, viewportHeight) => {
  const width = Math.max(320, Number(viewportWidth) || 1920);
  const height = Math.max(240, Number(viewportHeight) || 1080);
  const rowHeight = clamp(height / 15, 10, 200);
  const fontSize = clamp(Math.min(rowHeight * 0.44, width / 32), 5, rowHeight);
  const logoSize = clamp(Math.min(100, width * 0.12, Math.floor(rowHeight * (16 / 9))), 10, 355);
  const itemsPerPage = clamp(Math.floor(height / rowHeight) - 2, 1, 100);
  const rowScale = rowHeight / 55;
  const extraColumnWidth = 10;
  const toSetting = (pixels, min, max) => clamp(pixels / rowScale, min, max);

  const timePixels = fontSize * 3.7 + 14;
  const changePixels = fontSize * 3.7 + 14;
  const actualLogoPixels = logoSize + 12;
  const actualNumPixels = fontSize * 4.2 + 14;
  const gatePixels = fontSize * 3.3 + 14;
  const statusPixels = fontSize * 4.2 + 14;

  const timeTargetPixels = timePixels + extraColumnWidth;
  const changeTargetPixels = changePixels + extraColumnWidth;
  const logoTargetPixels = actualLogoPixels + extraColumnWidth;
  const flightNumberTargetPixels = actualNumPixels + extraColumnWidth;
  const gateTargetPixels = gatePixels + extraColumnWidth;
  const statusTargetPixels = (statusPixels + extraColumnWidth) * 1.5;

  const wTime = toSetting(timeTargetPixels, 30, 300);
  const wChange = toSetting(changeTargetPixels, 30, 300);
  const wActualLogo = toSetting(logoTargetPixels, 20, 150);
  const wActualNum = toSetting(flightNumberTargetPixels, 30, 300);
  const wCodeLogo = wActualLogo;
  const wCodeNum = wActualNum;
  const wGate = toSetting(gateTargetPixels, 30, 300);
  const wStatus = toSetting(statusTargetPixels, 30, 400);
  const wDest = toSetting(
    width
      - timeTargetPixels
      - changeTargetPixels
      - logoTargetPixels * 2
      - flightNumberTargetPixels * 2
      - gateTargetPixels
      - statusTargetPixels,
    30,
    800
  );

  return {
    itemsPerPage,
    rowHeight,
    fontSize,
    logoSize,
    wTime,
    wChange,
    wActualLogo,
    wActualNum,
    wCodeLogo,
    wCodeNum,
    wDest,
    wTerminal: toSetting(fontSize * 4.2 + 14 + extraColumnWidth, 30, 300),
    wCheckin: toSetting(fontSize * 6.2 + 14 + extraColumnWidth, 30, 400),
    wGate,
    wStatus
  };
};

export const loadUserSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      const viewport = typeof window === "undefined"
        ? {}
        : getAutoLayoutSettings(window.innerWidth, window.innerHeight);
      return { ...DEFAULT_SETTINGS, ...viewport };
    }

    return Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS).map(([key, defaultValue]) => {
        const savedValue = saved[key];

        if (typeof defaultValue === "number") {
          if (!Number.isFinite(savedValue)) return [key, defaultValue];
          const [min, max] = NUMBER_LIMITS[key];
          return [key, Math.min(max, Math.max(min, Math.round(savedValue)))];
        }

        if (typeof defaultValue === "boolean") {
          if (key === "autoDestWidth" && typeof savedValue !== "boolean") {
            return [key, saved.wDest === 0];
          }
          return [key, typeof savedValue === "boolean" ? savedValue : defaultValue];
        }

        if (key.endsWith("Color")) {
          return [
            key,
            typeof savedValue === "string" && /^#[0-9a-f]{6}$/i.test(savedValue)
              ? savedValue
              : defaultValue
          ];
        }

        if (key === "fontFamily") {
          return [
            key,
            FONT_OPTIONS.some((option) => option.id === savedValue)
              ? savedValue
              : defaultValue
          ];
        }

        if (key === "terminalFilter") {
          return [
            key,
            ["all", "T1", "T2"].includes(savedValue) ? savedValue : defaultValue
          ];
        }

        return [key, typeof savedValue === typeof defaultValue ? savedValue : defaultValue];
      })
    );
  } catch (error) {
    console.warn("저장된 사용자 설정을 불러오지 못했습니다:", error);
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveUserSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("사용자 설정을 저장하지 못했습니다:", error);
  }
};

export const clearUserSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (error) {
    console.error("사용자 설정을 초기화하지 못했습니다:", error);
  }
};

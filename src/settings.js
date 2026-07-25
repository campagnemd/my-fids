export const SETTINGS_STORAGE_KEY = "fids_user_settings_v1";

export const FONT_OPTIONS = Object.freeze([
  {
    id: "gulim",
    label: "굴림체",
    family: '"GulimChe", "굴림체", "Gulim", "Malgun Gothic", sans-serif'
  },
  {
    id: "system",
    label: "시스템 기본",
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif'
  },
  {
    id: "gothic",
    label: "고딕",
    family: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Yu Gothic", sans-serif'
  },
  {
    id: "serif",
    label: "명조",
    family: '"Noto Serif KR", "AppleMyungjo", "Batang", "Yu Mincho", serif'
  },
  {
    id: "monospace",
    label: "고정폭",
    family: '"D2Coding", "NanumGothicCoding", "SFMono-Regular", Consolas, "Liberation Mono", monospace'
  },
  {
    id: "arial",
    label: "Arial",
    family: 'Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
  },
  {
    id: "verdana",
    label: "Verdana",
    family: 'Verdana, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
  },
  {
    id: "tahoma",
    label: "Tahoma",
    family: 'Tahoma, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
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
  fontFamily: "gulim",
  pastHours: 6,
  futureHours: 12,
  apiSyncInterval: 10,
  flipInterval: 10,
  maxPages: 10,
  smoothTransition: false,
  showLogo: true,
  showTerminal: false,
  showCheckin: false,
  showCodeshare: false,
  showDeparted: false,
  showHeader: false,
  flightFirst: true,
  highlightChange: true,
  highlightTerminal: false,
  highlightCheckin: true,
  highlightGate: true,
  codeshareFlipInterval: 2,
  headerColor: "#2f6bca",
  tableHeaderColor: "#000000",
  footerColor: "#030b1a",
  oddRowColor: "#3065bb",
  evenRowColor: "#1752b0",
  wTime: 110,
  wChange: 110,
  wActualLogo: 100,
  wActualNum: 110,
  wCodeLogo: 100,
  wCodeNum: 110,
  wDest: 0,
  wTerminal: 110,
  wCheckin: 160,
  wGate: 140,
  wStatus: 180
});

const NUMBER_LIMITS = {
  itemsPerPage: [5, 20],
  rowHeight: [40, 95],
  fontSize: [14, 48],
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
  wDest: [0, 800],
  wTerminal: [30, 300],
  wCheckin: [30, 400],
  wGate: [30, 300],
  wStatus: [30, 400]
};

export const loadUserSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return { ...DEFAULT_SETTINGS };
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

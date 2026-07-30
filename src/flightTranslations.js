const destination = (english, local, language) => Object.freeze({
  english,
  local,
  language
});

// 2026-06-28~2026-07-27 출발편 API에서 확인한 고유 도착지 165곳.
// 공항 한글명이 바뀌어도 번역이 유지되도록 IATA 공항 코드를 키로 사용한다.
export const DESTINATIONS = Object.freeze({
  ADD: destination("ADDIS ABABA/BOLE", "አዲስ አበባ/ቦሌ", "am"),
  AKL: destination("AUCKLAND", "AUCKLAND", "en"),
  ALA: destination("ALMATY", "АЛМАТЫ", "kk"),
  AMS: destination("AMSTERDAM", "AMSTERDAM", "nl"),
  AOJ: destination("AOMORI", "青森", "ja"),
  ASB: destination("ASHGABAT", "AŞGABAT", "tk"),
  ATL: destination("ATLANTA", "ATLANTA", "en"),
  AUH: destination("ABU DHABI", "أبوظبي", "ar"),
  BCN: destination("BARCELONA", "BARCELONA", "es"),
  BKI: destination("KOTA KINABALU", "KOTA KINABALU", "ms"),
  BKK: destination("BANGKOK/SUVARNABHUMI", "กรุงเทพฯ/สุวรรณภูมิ", "th"),
  BNE: destination("BRISBANE", "BRISBANE", "en"),
  BOS: destination("BOSTON", "BOSTON", "en"),
  BSZ: destination("BISHKEK", "БИШКЕК", "ky"),
  BUD: destination("BUDAPEST", "BUDAPEST", "hu"),
  BWN: destination("BANDAR SERI BEGAWAN", "BANDAR SERI BEGAWAN", "ms"),
  CAN: destination("GUANGZHOU", "广州", "zh-CN"),
  CDG: destination("PARIS/CHARLES DE GAULLE", "PARIS/CHARLES-DE-GAULLE", "fr"),
  CEB: destination("CEBU", "CEBU", "en"),
  CGK: destination("JAKARTA/SOEKARNO-HATTA", "JAKARTA/SOEKARNO-HATTA", "id"),
  CGO: destination("ZHENGZHOU", "郑州", "zh-CN"),
  CGQ: destination("CHANGCHUN", "长春", "zh-CN"),
  CIT: destination("SHYMKENT", "ШЫМКЕНТ", "kk"),
  CJU: destination("JEJU", "제주", "ko"),
  CKG: destination("CHONGQING", "重庆", "zh-CN"),
  CMB: destination("COLOMBO", "කොළඹ", "si"),
  CNX: destination("CHIANG MAI", "เชียงใหม่", "th"),
  CPH: destination("COPENHAGEN", "KØBENHAVN", "da"),
  CRK: destination("CLARK", "CLARK", "en"),
  CSX: destination("CHANGSHA", "长沙", "zh-CN"),
  CTS: destination("SAPPORO/NEW CHITOSE", "札幌/新千歳", "ja"),
  CXR: destination("NHA TRANG/CAM RANH", "NHA TRANG/CAM RANH", "vi"),
  DAD: destination("DA NANG", "ĐÀ NẴNG", "vi"),
  DAT: destination("DATONG", "大同", "zh-CN"),
  DEL: destination("DELHI", "दिल्ली", "hi"),
  DFW: destination("DALLAS/FORT WORTH", "DALLAS/FORT WORTH", "en"),
  DLC: destination("DALIAN", "大连", "zh-CN"),
  DOH: destination("DOHA", "الدوحة", "ar"),
  DPS: destination("DENPASAR/BALI", "DENPASAR/BALI", "id"),
  DSN: destination("ORDOS", "鄂尔多斯", "zh-CN"),
  DTW: destination("DETROIT", "DETROIT", "en"),
  DXB: destination("DUBAI", "دبي", "ar"),
  DYG: destination("ZHANGJIAJIE", "张家界", "zh-CN"),
  EWR: destination("NEWARK", "NEWARK", "en"),
  FCO: destination("ROME/FIUMICINO", "ROMA/FIUMICINO", "it"),
  FOC: destination("FUZHOU", "福州", "zh-CN"),
  FRA: destination("FRANKFURT", "FRANKFURT", "de"),
  FSZ: destination("SHIZUOKA", "静岡", "ja"),
  FUK: destination("FUKUOKA", "福岡", "ja"),
  GUM: destination("GUAM", "GUAM", "en"),
  HAK: destination("HAIKOU", "海口", "zh-CN"),
  HAN: destination("HANOI", "HÀ NỘI", "vi"),
  HEL: destination("HELSINKI", "HELSINKI", "fi"),
  HET: destination("HOHHOT", "呼和浩特", "zh-CN"),
  HFE: destination("HEFEI", "合肥", "zh-CN"),
  HGH: destination("HANGZHOU", "杭州", "zh-CN"),
  HIJ: destination("HIROSHIMA", "広島", "ja"),
  HKG: destination("HONG KONG", "香港", "zh-TW"),
  HKT: destination("PHUKET", "ภูเก็ต", "th"),
  HLD: destination("HAILAR", "海拉尔", "zh-CN"),
  HND: destination("TOKYO/HANEDA", "東京/羽田", "ja"),
  HNL: destination("HONOLULU", "HONOLULU", "en"),
  HPH: destination("HAI PHONG", "HẢI PHÒNG", "vi"),
  HRB: destination("HARBIN", "哈尔滨", "zh-CN"),
  HSG: destination("SAGA", "佐賀", "ja"),
  HUN: destination("HUALIEN", "花蓮", "zh-TW"),
  IAD: destination("WASHINGTON/DULLES", "WASHINGTON/DULLES", "en"),
  IBR: destination("IBARAKI", "茨城", "ja"),
  ISG: destination("ISHIGAKI", "石垣", "ja"),
  IST: destination("ISTANBUL", "İSTANBUL", "tr"),
  JFK: destination("NEW YORK/J.F.KENNEDY", "NEW YORK/J.F.KENNEDY", "en"),
  KHH: destination("KAOHSIUNG", "高雄", "zh-TW"),
  KIJ: destination("NIIGATA", "新潟", "ja"),
  KIX: destination("OSAKA/KANSAI", "大阪/関西", "ja"),
  KKJ: destination("KITAKYUSHU", "北九州", "ja"),
  KLO: destination("KALIBO", "KALIBO", "en"),
  KMG: destination("KUNMING", "昆明", "zh-CN"),
  KMI: destination("MIYAZAKI", "宮崎", "ja"),
  KMJ: destination("KUMAMOTO", "熊本", "ja"),
  KMQ: destination("KOMATSU", "小松", "ja"),
  KOJ: destination("KAGOSHIMA", "鹿児島", "ja"),
  KTI: destination("PHNOM PENH/TECHO", "ភ្នំពេញ/តេជោ", "km"),
  KTM: destination("KATHMANDU", "काठमाडौं", "ne"),
  KUH: destination("KUSHIRO", "釧路", "ja"),
  KUL: destination("KUALA LUMPUR", "KUALA LUMPUR", "ms"),
  LAS: destination("LAS VEGAS", "LAS VEGAS", "en"),
  LAX: destination("LOS ANGELES", "LOS ANGELES", "en"),
  LHR: destination("LONDON/HEATHROW", "LONDON/HEATHROW", "en"),
  LIS: destination("LISBON", "LISBOA", "pt"),
  LYI: destination("LINYI", "临沂", "zh-CN"),
  MAD: destination("MADRID", "MADRID", "es"),
  MDC: destination("MANADO", "MANADO", "id"),
  MEX: destination("MEXICO CITY", "CIUDAD DE MÉXICO", "es"),
  MFM: destination("MACAU", "澳門", "zh-TW"),
  MNL: destination("MANILA", "MANILA", "en"),
  MSP: destination("MINNEAPOLIS", "MINNEAPOLIS", "en"),
  MUC: destination("MUNICH", "MÜNCHEN", "de"),
  MXP: destination("MILAN/MALPENSA", "MILANO/MALPENSA", "it"),
  MYJ: destination("MATSUYAMA", "松山", "ja"),
  NGO: destination("NAGOYA/CHUBU", "名古屋/中部", "ja"),
  NGS: destination("NAGASAKI", "長崎", "ja"),
  NKG: destination("NANJING", "南京", "zh-CN"),
  NQZ: destination("ASTANA", "АСТАНА", "kk"),
  NRT: destination("TOKYO/NARITA", "東京/成田", "ja"),
  NTG: destination("NANTONG", "南通", "zh-CN"),
  OIT: destination("OITA", "大分", "ja"),
  OKA: destination("OKINAWA/NAHA", "沖縄/那覇", "ja"),
  OKJ: destination("OKAYAMA", "岡山", "ja"),
  ORD: destination("CHICAGO/O'HARE", "CHICAGO/O'HARE", "en"),
  PEK: destination("BEIJING/CAPITAL", "北京/首都", "zh-CN"),
  PKX: destination("BEIJING/DAXING", "北京/大兴", "zh-CN"),
  PQC: destination("PHU QUOC", "PHÚ QUỐC", "vi"),
  PRG: destination("PRAGUE", "PRAHA", "cs"),
  PUS: destination("BUSAN/GIMHAE", "부산/김해", "ko"),
  PVG: destination("SHANGHAI/PUDONG", "上海/浦东", "zh-CN"),
  RGN: destination("YANGON", "ရန်ကုန်", "my"),
  RMQ: destination("TAICHUNG", "臺中/清泉崗", "zh-TW"),
  SDJ: destination("SENDAI", "仙台", "ja"),
  SEA: destination("SEATTLE/TACOMA", "SEATTLE/TACOMA", "en"),
  SFO: destination("SAN FRANCISCO", "SAN FRANCISCO", "en"),
  SGN: destination("HO CHI MINH CITY", "THÀNH PHỐ HỒ CHÍ MINH", "vi"),
  SHE: destination("SHENYANG", "沈阳", "zh-CN"),
  SHI: destination("MIYAKOJIMA/SHIMOJISHIMA", "宮古島/下地島", "ja"),
  SIN: destination("SINGAPORE", "SINGAPORE", "en"),
  SJW: destination("SHIJIAZHUANG", "石家庄", "zh-CN"),
  SLC: destination("SALT LAKE CITY", "SALT LAKE CITY", "en"),
  SPN: destination("SAIPAN", "SAIPAN", "en"),
  SYD: destination("SYDNEY", "SYDNEY", "en"),
  SYX: destination("SANYA", "三亚", "zh-CN"),
  SZX: destination("SHENZHEN", "深圳", "zh-CN"),
  TAE: destination("DAEGU", "대구", "ko"),
  TAG: destination("BOHOL/PANGLAO", "BOHOL/PANGLAO", "en"),
  TAK: destination("TAKAMATSU", "高松", "ja"),
  TAO: destination("QINGDAO", "青岛", "zh-CN"),
  TAS: destination("TASHKENT", "TOSHKENT", "uz"),
  TFU: destination("CHENGDU/TIANFU", "成都/天府", "zh-CN"),
  TKS: destination("TOKUSHIMA", "徳島", "ja"),
  TNA: destination("JINAN", "济南", "zh-CN"),
  TPE: destination("TAIPEI/TAOYUAN", "臺北/桃園", "zh-TW"),
  TSN: destination("TIANJIN", "天津", "zh-CN"),
  UBN: destination("ULAANBAATAR/CHINGGIS KHAAN", "УЛААНБААТАР/ЧИНГИС ХААН", "mn"),
  UKB: destination("KOBE", "神戸", "ja"),
  URC: destination("URUMQI", "乌鲁木齐", "zh-CN"),
  VIE: destination("VIENNA", "WIEN", "de"),
  VTE: destination("VIENTIANE", "ວຽງຈັນ", "lo"),
  WAW: destination("WARSAW", "WARSZAWA", "pl"),
  WEH: destination("WEIHAI", "威海", "zh-CN"),
  WNZ: destination("WENZHOU", "温州", "zh-CN"),
  WRO: destination("WROCLAW", "WROCŁAW", "pl"),
  WUH: destination("WUHAN", "武汉", "zh-CN"),
  WUX: destination("WUXI", "无锡", "zh-CN"),
  XIY: destination("XI'AN", "西安", "zh-CN"),
  XMN: destination("XIAMEN", "厦门", "zh-CN"),
  YCU: destination("YUNCHENG/YANHU", "运城/盐湖", "zh-CN"),
  YGJ: destination("YONAGO", "米子", "ja"),
  YNJ: destination("YANJI", "延吉", "zh-CN"),
  YNT: destination("YANTAI", "烟台", "zh-CN"),
  YNZ: destination("YANCHENG", "盐城", "zh-CN"),
  YTY: destination("YANGZHOU", "扬州", "zh-CN"),
  YUL: destination("MONTREAL", "MONTRÉAL", "fr"),
  YVR: destination("VANCOUVER", "VANCOUVER", "en"),
  YYC: destination("CALGARY", "CALGARY", "en"),
  YYZ: destination("TORONTO", "TORONTO", "en"),
  ZAG: destination("ZAGREB", "ZAGREB", "hr"),
  ZRH: destination("ZURICH", "ZÜRICH", "de")
});

const STATUS_TEXT = Object.freeze({
  ko: ["출발", "마감예정", "탑승중", "탑승준비", "지연", "결항"],
  en: ["Departed", "Final Call", "Boarding", "Go To Gate", "Delayed", "Cancelled"],
  am: ["ተነስቷል", "የመጨረሻ ጥሪ", "በመሳፈር ላይ", "ወደ በር ይሂዱ", "ዘግይቷል", "ተሰርዟል"],
  ar: ["غادرت", "النداء الأخير", "صعود الطائرة", "توجه إلى البوابة", "متأخرة", "ملغاة"],
  cs: ["Odletělo", "Poslední výzva", "Nástup", "Jděte k odletové bráně", "Zpožděno", "Zrušeno"],
  da: ["Afgået", "Sidste udkald", "Boarding", "Gå til gate", "Forsinket", "Aflyst"],
  de: ["Abgeflogen", "Letzter Aufruf", "Einsteigen", "Zum Gate", "Verspätet", "Annulliert"],
  es: ["Ha salido", "Última llamada", "Embarque", "Diríjase a la puerta", "Retrasado", "Cancelado"],
  fi: ["Lähtenyt", "Viimeinen kutsu", "Koneeseen nousu", "Siirry portille", "Myöhässä", "Peruttu"],
  fr: ["Parti", "Dernier appel", "Embarquement", "Rendez-vous à la porte d’embarquement", "Retardé", "Annulé"],
  hi: ["प्रस्थान कर चुका", "अंतिम बुलावा", "बोर्डिंग", "गेट पर जाएँ", "विलंबित", "रद्द"],
  hr: ["Poletio", "Posljednji poziv", "Ukrcavanje", "Idite na izlaz", "Kasni", "Otkazano"],
  hu: ["Elindult", "Utolsó hívás", "Beszállás", "Fáradjon a kapuhoz", "Késik", "Törölve"],
  id: ["Telah berangkat", "Panggilan terakhir", "Sedang naik pesawat", "Menuju gerbang", "Tertunda", "Dibatalkan"],
  it: ["Partito", "Ultima chiamata", "Imbarco", "Recarsi al gate", "In ritardo", "Cancellato"],
  ja: ["出発済み", "最終搭乗案内", "搭乗中", "搭乗口へ", "遅延", "欠航"],
  kk: ["Ұшып кетті", "Соңғы шақыру", "Отырғызу", "Шығу қақпасына өтіңіз", "Кешіктірілді", "Болдырылмады"],
  km: ["បានចេញដំណើរ", "ការហៅចុងក្រោយ", "កំពុងឡើងយន្តហោះ", "ទៅកាន់ច្រកទ្វារ", "ពន្យារពេល", "បានលុបចោល"],
  ky: ["Учуп кетти", "Акыркы чакыруу", "Отургузуу", "Дарбазага барыңыз", "Кечигүүдө", "Жокко чыгарылды"],
  lo: ["ອອກເດີນທາງແລ້ວ", "ເອີ້ນຄັ້ງສຸດທ້າຍ", "ກຳລັງຂຶ້ນເຮືອບິນ", "ໄປທີ່ປະຕູ", "ຊັກຊ້າ", "ຍົກເລີກ"],
  mn: ["Хөөрсөн", "Сүүлийн дуудлага", "Онгоцонд суулгаж байна", "Гарц руу очно уу", "Хойшилсон", "Цуцлагдсан"],
  ms: ["Telah berlepas", "Panggilan terakhir", "Sedang menaiki pesawat", "Sila ke pintu pelepasan", "Lewat", "Dibatalkan"],
  my: ["ထွက်ခွာပြီး", "နောက်ဆုံးခေါ်ယူမှု", "လေယာဉ်တက်နေသည်", "ဂိတ်သို့သွားပါ", "နောက်ကျ", "ပယ်ဖျက်"],
  ne: ["प्रस्थान भयो", "अन्तिम आह्वान", "बोर्डिङ", "गेटमा जानुहोस्", "ढिलाइ", "रद्द"],
  nl: ["Vertrokken", "Laatste oproep", "Instappen", "Ga naar de gate", "Vertraagd", "Geannuleerd"],
  pl: ["Odleciał", "Ostatnie wezwanie", "Wejście na pokład", "Proszę udać się do bramki", "Opóźniony", "Odwołany"],
  pt: ["Partiu", "Última chamada", "Embarque", "Dirija-se à porta", "Atrasado", "Cancelado"],
  si: ["පිටත්ව ඇත", "අවසන් කැඳවීම", "ගුවන් යානයට ගොඩවීම", "ගේට්ටුව වෙත යන්න", "ප්‍රමාදයි", "අවලංගුයි"],
  th: ["ออกเดินทางแล้ว", "เรียกครั้งสุดท้าย", "กำลังขึ้นเครื่อง", "ไปที่ประตูขึ้นเครื่อง", "ล่าช้า", "ยกเลิก"],
  tk: ["Uçdy", "Soňky çagyryş", "Uçara münmek", "Çykyş derwezesine geçiň", "Gijikdirildi", "Ýatyryldy"],
  tr: ["Kalktı", "Son çağrı", "Uçağa biniş", "Kapıya gidiniz", "Gecikmeli", "İptal"],
  uz: ["Jo'nab ketdi", "So'nggi chaqiruv", "Samolyotga chiqish", "Darvozaga boring", "Kechiktirildi", "Bekor qilindi"],
  vi: ["Đã khởi hành", "Lần gọi cuối", "Đang lên máy bay", "Đến cửa khởi hành", "Bị chậm", "Đã hủy"],
  "zh-CN": ["已出发", "最后召集", "正在登机", "请前往登机口", "延误", "取消"],
  "zh-TW": ["已出發", "最後召集", "登機中", "請前往登機門", "延誤", "取消"]
});

const STATUS_INDEX = Object.freeze({
  departed: 0,
  finalCall: 1,
  boarding: 2,
  goToGate: 3,
  delayed: 4,
  cancelled: 5
});

const KOREAN_DESTINATION_ALIASES = Object.freeze({
  김해: "부산/김해",
  타이베이: "타이베이/타오위안"
});

export const formatDestinationName = (
  destinationName,
  showAirportName = true,
  spaceAfterSlash = true
) => {
  const normalizedName = String(destinationName || "---")
    .replace(/\s*\/\s*/g, "/")
    .trim();
  const visibleName = showAirportName
    ? normalizedName
    : normalizedName.split("/", 1)[0].trim();

  return spaceAfterSlash
    ? visibleName.replace(/\//g, "/ ")
    : visibleName;
};

export const getStatusKey = (remark) => {
  const status = String(remark || "");
  if (status.includes("탑승중")) return "boarding";
  if (status.includes("준비") || status.includes("대기")) return "goToGate";
  if (status.includes("마감") || status.includes("최종")) return "finalCall";
  if (status.includes("지연")) return "delayed";
  if (status.includes("결항")) return "cancelled";
  if (status.includes("출발") || status.includes("이륙") || status.includes("종료")) return "departed";
  return null;
};

export const getDestinationName = (airportCode, koreanName, displayLanguage) => {
  const normalizedAirportCode = String(airportCode || "").toUpperCase();
  const translation = DESTINATIONS[normalizedAirportCode];
  if (displayLanguage === "ko") {
    return KOREAN_DESTINATION_ALIASES[koreanName] || koreanName || "---";
  }
  if (!translation) return koreanName || "---";
  return displayLanguage === "en" ? translation.english : translation.local;
};

export const getStatusText = (statusKey, displayLanguage, airportCode) => {
  if (!statusKey || !(statusKey in STATUS_INDEX)) return "";
  const index = STATUS_INDEX[statusKey];
  if (displayLanguage === "ko") return STATUS_TEXT.ko[index];
  if (displayLanguage === "en") return STATUS_TEXT.en[index];

  const language = DESTINATIONS[String(airportCode || "").toUpperCase()]?.language || "en";
  return (STATUS_TEXT[language] || STATUS_TEXT.en)[index];
};

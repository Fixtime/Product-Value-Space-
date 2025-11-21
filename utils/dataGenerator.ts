
import { DataPoint, JobCategory, JourneyStage, ImpactLevel } from '../types';

// Colors palette for Clusters (Distinct, high contrast)
const CLUSTER_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', // Red, Orange, Amber, Lime, Emerald
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', // Cyan, Blue, Indigo, Violet, Fuchsia
  '#f43f5e', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', // Rose, Amber, Lime, Emerald, Cyan
  '#60a5fa', '#818cf8', '#a78bfa', '#e879f9', '#fb7185', // Light Blue, Indigo, Violet, Fuchsia, Rose
  '#ff006e', '#8338ec', '#3a86ff', '#ffbe0b', '#fb5607', // Vibrant Set
  '#00b4d8', '#e63946', '#2a9d8f', '#e9c46a', '#f4a261'  // Modern Set
];

// --- LOW LEVEL TEMPLATES MAPPED TO HIGH LEVEL CLUSTERS ---
const PROBLEM_TEMPLATES: Record<string, string[]> = {
  "Непонятно, какие модели сейчас актуальны": [
    "Поисковый запрос «какие кроссовки в моде 2025»",
    "Поисковый запрос «тренды пальто осень 2025»",
    "Тикет: «Подскажите, какие джинсы сейчас актуальны?»",
    "Чат: «Что сейчас носят вместо mom jeans?»",
    "Отзыв: «Красивая модель, но боюсь, что уже не модно»",
    "Отзыв WB: «Подруги сказали, что это прошлый сезон»",
    "Поисковый запрос «тренды обуви весна с картинками»",
    "Email: «Помогите подобрать актуальный образ, я не в теме»",
    "Коммент Instagram: «А это точно сейчас модно?»",
    "Поисковый запрос «цвета в моде осень-зима 2025»",
    "Возврат: «Увидела, что такой крой уже не носят»",
    "Отказ на стр. Новинки (вход по запросу «модное»)",
    "Поиск «что вместо skinny jeans сейчас носят»",
    "Бот: «Какие сумки в тренде? Не хочу старье»",
    "Отзыв AppStore: «Не понятно, что актуально, всё вперемешку»",
    "Поиск «тренды верхней одежды» + уход со страницы",
    "Звонок: «Подскажите, какие пуховики сейчас модные?»",
    "Коммент TikTok: «Классная куртка, она актуальна?»",
    "Форма стилиста: «Помогите собрать модный гардероб»",
    "Корзина: удаление товара после поиска «тренды 2025»"
  ],
  "Сложно составить гармоничный образ из вещей": [
    "Поиск «с чем носить зеленые брюки»",
    "Тикет: «Подойдет ли эта блузка к юбке арт. 123?»",
    "Отзыв: «Вещь хорошая, но не знаю, с чем сочетать»",
    "Чат: «Есть ли готовые луки с этим пиджаком?»",
    "Просмотр карточки: переход в раздел «С этим носят»",
    "Возврат: «Не вписалась в гардероб»",
    "Поиск «капсула на лето с белыми кедами»",
    "Вопрос стилисту: «Соберите мне полный образ»",
    "Коммент: «Сложный цвет, ни к чему не подходит»",
    "Корзина: много вещей, но нет сочетаний"
  ],
  "Проблемы с размером и посадкой": [
    "Возврат: «Большемерит на два размера»",
    "Отзыв: «Рукава короткие на рост 175»",
    "Чат: «Какой размер брать на 90-60-90?»",
    "Поиск «одежда для высоких»",
    "Тикет: «Таблица размеров не соответствует»",
    "Возврат: «Узко в плечах, широко в талии»",
    "Отзыв: «На фото выглядит иначе, чем в жизни»",
    "Звонок: «Померьте длину стельки 38 размера»",
    "Комментарий: «Лекала на гномов, где нормальные размеры?»",
    "Фильтр: выбор размера XXL + 0 результатов"
  ],
  "Качество и износостойкость": [
    "Отзыв: «После первой стирки превратилась в тряпку»",
    "Возврат: «Торчат нитки, кривые швы»",
    "Жалоба: «Катышки появились через неделю»",
    "Чат: «Это натуральная кожа или кожзам?»",
    "Отзыв с фото: «Дырка по шву при распаковке»",
    "Тикет: «Линяет и красит другую одежду»",
    "Вопрос: «Как ухаживать за этой тканью?»",
    "Отзыв: «Фурнитура дешевая, молния заедает»",
    "Возврат по браку: «Оторвалась пуговица»",
    "Негативный отзыв в соцсетях о качестве ткани"
  ],
  "Сложности с доставкой и возвратом": [
    "Тикет: «Где мой заказ? Опаздывает на 3 дня»",
    "Чат: «Курьер не позвонил заранее»",
    "Отзыв: «Платный возврат - это грабеж»",
    "Звонок: «Не могу оформить возврат в приложении»",
    "Жалоба: «Привезли не тот цвет»",
    "Вопрос: «Можно ли примерить перед покупкой?»",
    "Отмена заказа: «Слишком долгая доставка»",
    "Чат: «Верните деньги, возврат сдан неделю назад»",
    "Отзыв AppStore: «Приложение виснет при оформлении»",
    "Поиск «пункты выдачи рядом»"
  ]
};

const GENERIC_SOURCES = [
  "Яндекс.Метрика (поиск)",
  "Техподдержка (Zendesk)",
  "Онлайн-чат (Jivo)",
  "Отзывы на сайте",
  "Маркетплейс (Wildberries)",
  "Маркетплейс (Ozon)",
  "CRM (Email)",
  "Instagram (Direct/Comments)",
  "Telegram-бот",
  "App Store Reviews",
  "Колл-центр",
  "TikTok Comments"
];

// Assign source based on signal text content for realism
const guessSource = (text: string): string => {
  if (text.includes("Поиск") || text.includes("запрос")) return "Внутренний поиск / Метрика";
  if (text.includes("Тикет") || text.includes("Возврат")) return "Служба поддержки (Zendesk)";
  if (text.includes("Чат") || text.includes("Вопрос")) return "Онлайн-чат (Jivo)";
  if (text.includes("Отзыв")) return "Отзывы о товарах";
  if (text.includes("Звонок")) return "Колл-центр";
  if (text.includes("Коммент")) return "Социальные сети";
  if (text.includes("AppStore")) return "App Store / Google Play";
  return GENERIC_SOURCES[Math.floor(Math.random() * GENERIC_SOURCES.length)];
};

// X-AXIS: Jobs (Ordered 0-9)
export const JOBS_ORDERED = [
  JobCategory.SEASONAL_UPDATE,
  JobCategory.URGENT_REPLACEMENT,
  JobCategory.NON_STANDARD_FIT,
  JobCategory.EVENT_LOOK,
  JobCategory.MATCHING_EXISTING,
  JobCategory.GIFT_BUYING,
  JobCategory.BASIC_UPDATE,
  JobCategory.NEW_LIFE_STAGE,
  JobCategory.CONFIDENCE_BOOST,
  JobCategory.STYLE_EXPERIMENT
];

// Z-AXIS: User Segments (Ordered from Active/Young -> Passive/Old)
export const SEGMENTS_ORDERED = [
  "Активные школьницы",           // Index 0
  "Студентки ВУЗов",              // Index 1
  "Молодые специалисты",          // Index 2
  "Фрилансеры и цифровые кочевники", // Index 3
  "Молодые мамы",                 // Index 4
  "Офисные менеджеры",            // Index 5
  "Руководители бизнеса",         // Index 6
  "Предприниматели 45+",          // Index 7
  "Активные пенсионеры",          // Index 8
  "Пенсионеры с ограничениями"    // Index 9
];

// Y-AXIS: Contexts (Ordered by Situation Intensity/Time)
export const CONTEXTS_ORDERED = [
  "Дома в постели (ночь)",        // Index 0
  "Утренний кофе (планшет)",      // Index 1
  "Поездка в транспорте (телефон)", // Index 2
  "На бегу (быстрый поиск)",      // Index 3
  "Обеденный перерыв (десктоп)",  // Index 4
  "Рабочее время (фоном)",        // Index 5
  "Вечерний шопинг (ноутбук)",    // Index 6
  "В магазине (сравнение цен)",   // Index 7
  "Срочная покупка перед выездом",// Index 8
  "Критическая ситуация (порвалось)", // Index 9
];

function generateRandomNormal(mean: number, stdDev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

function mapIndexToCoordinate(index: number, jitter: number = 0.8): number {
  const center = -9 + (index * 2);
  return generateRandomNormal(center, jitter);
}

const getImpactLevel = (score: number): ImpactLevel => {
  if (score >= 2.5) return ImpactLevel.VERY_HIGH;
  if (score >= 1.5) return ImpactLevel.HIGH;
  if (score >= 0.8) return ImpactLevel.MEDIUM;
  if (score >= 0.3) return ImpactLevel.LOW;
  return ImpactLevel.MICRO;
};

// --- HIERARCHICAL GENERATION LOGIC ---

interface ProblemCluster {
  name: string;
  templates: string[];
  
  // Spatial Centers
  jobIndex: number;
  segIndex: number;
  ctxIndex: number;
  
  // Business Metrics (Fixed for the cluster)
  clusterImpactScore: number; // The "Cluster" level score
  clusterImpactLevel: ImpactLevel;
  journeyStage: JourneyStage;
  color: string;
  
  // Logic to track if the "Hero" signal has been generated for this cluster
  heroSignalGenerated: boolean;
}

export const generateData = (count: number = 5000): DataPoint[] => {
  const data: DataPoint[] = [];
  const clusters: ProblemCluster[] = [];
  const problemNames = Object.keys(PROBLEM_TEMPLATES);
  const nameToColor: Record<string, string> = {}; 
  
  // --- STEP 1: GENERATE 40-50 PROBLEM CLUSTERS ---
  // We need exactly 5 Very High Impact Clusters
  
  const TOTAL_CLUSTERS = 45;
  const VERY_HIGH_COUNT = 5;
  const HIGH_COUNT = 2; // Approx 3-4%
  
  for (let i = 0; i < TOTAL_CLUSTERS; i++) {
    // 1. Assign Impact
    let impact: number;
    if (i < VERY_HIGH_COUNT) {
      impact = 6.5 + Math.random() * 0.5; // Very High
    } else if (i < VERY_HIGH_COUNT + HIGH_COUNT) {
      impact = 1.5 + Math.random() * 0.99; // High
    } else {
      // Distribute remaining: Medium, Low, Micro
      const r = Math.random();
      if (r < 0.4) impact = 0.8 + Math.random() * 0.69; // Medium
      else if (r < 0.8) impact = 0.3 + Math.random() * 0.49; // Low
      else impact = 0.1 + Math.random() * 0.19; // Micro
    }

    // 2. Assign Stage (Weighted)
    let stage: JourneyStage;
    const rStage = Math.random();
    if (rStage < 0.50) stage = JourneyStage.PURCHASE;
    else if (rStage < 0.70) stage = JourneyStage.RETENTION;
    else {
       const others = Object.values(JourneyStage).filter(s => s !== JourneyStage.PURCHASE && s !== JourneyStage.RETENTION);
       stage = others[Math.floor(Math.random() * others.length)];
    }

    // 3. Assign Spatial Position (Bias towards dominant segments)
    const dominantSegments = [1, 3, 4, 8];
    const useDominant = Math.random() < 0.7;
    const segIndex = useDominant 
        ? dominantSegments[Math.floor(Math.random() * dominantSegments.length)] 
        : Math.floor(Math.random() * 10);
    
    // 4. Assign Name
    const name = problemNames[i % problemNames.length];
    
    // 5. Assign Color STRICTLY based on Name
    if (!nameToColor[name]) {
        const colorIndex = Object.keys(nameToColor).length;
        nameToColor[name] = CLUSTER_PALETTE[colorIndex % CLUSTER_PALETTE.length];
    }
    const color = nameToColor[name];
    
    clusters.push({
      name: name,
      templates: PROBLEM_TEMPLATES[name],
      jobIndex: Math.floor(Math.random() * 10),
      segIndex: segIndex,
      ctxIndex: Math.floor(Math.random() * 10),
      clusterImpactScore: impact,
      clusterImpactLevel: getImpactLevel(impact),
      journeyStage: stage,
      color: color,
      heroSignalGenerated: false
    });
  }

  // --- STEP 2: GENERATE SIGNALS ATTACHED TO CLUSTERS ---
  // Goal: Ensure ONLY 1 "Very High" signal exists per Very High Cluster.
  // The rest should be smaller "symptom" signals.
  
  for (let i = 0; i < count; i++) {
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    
    // Determine Signal Impact
    // If Cluster is Very High Impact:
    //   - 1st time: Generate HUGE signal (6.5+) -> This is the ROOT CAUSE and the only VERY HIGH signal
    //   - Subsequent times: Generate small "symptom" signals (0.1 - 0.9)
    
    let signalImpact = cluster.clusterImpactScore;
    let isRootCause = false;
    
    if (cluster.clusterImpactLevel === ImpactLevel.VERY_HIGH) {
        if (!cluster.heroSignalGenerated) {
            // Create the ONE Hero Signal
            signalImpact = cluster.clusterImpactScore; 
            cluster.heroSignalGenerated = true;
            isRootCause = true;
        } else {
            // Create smaller symptom signals
            signalImpact = 0.2 + Math.random() * 0.7; 
        }
    } else {
        // Normal clusters
        // Also designate one as root cause for visualization, though impact is normal
        if (!cluster.heroSignalGenerated) {
             isRootCause = true;
             cluster.heroSignalGenerated = true;
             signalImpact = cluster.clusterImpactScore;
        } else {
             signalImpact = Math.max(0.1, cluster.clusterImpactScore * 0.6 + (Math.random() - 0.5) * 0.2);
        }
    }

    // 1. Spatial Position
    const gridJitter = 0.25; 
    let driftSeg = 0, driftCtx = 0, driftJob = 0;
    if (Math.random() > 0.7) {
       const axis = Math.random();
       const amount = (Math.random() - 0.5) * 1.5;
       if (axis < 0.33) driftSeg = amount;
       else if (axis < 0.66) driftCtx = amount;
       else driftJob = amount;
    }

    const rawSeg = Math.max(0, Math.min(9.9, cluster.segIndex + (Math.random() - 0.5) + driftSeg));
    const rawCtx = Math.max(0, Math.min(9.9, cluster.ctxIndex + (Math.random() - 0.5) + driftCtx));
    const rawJob = Math.max(0, Math.min(9.9, cluster.jobIndex + (Math.random() - 0.5) + driftJob));

    const z = mapIndexToCoordinate(rawSeg, gridJitter);
    const y = mapIndexToCoordinate(rawCtx, gridJitter);
    const x = mapIndexToCoordinate(rawJob, gridJitter);

    const finalJobIndex = Math.round(rawJob);
    const finalSegIndex = Math.round(rawSeg);
    const finalCtxIndex = Math.round(rawCtx);

    const template = cluster.templates[Math.floor(Math.random() * cluster.templates.length)];
    
    data.push({
      id: `sig-${10000 + i}`,
      position: [x, y, z],
      clusterName: cluster.name,
      isRootCause: isRootCause,
      description: template,
      source: guessSource(template),
      jobCategory: JOBS_ORDERED[finalJobIndex],
      jobIndex: finalJobIndex,
      journeyStage: cluster.journeyStage,
      
      // Use the calculated per-signal impact
      impactScore: signalImpact,
      impactLevel: getImpactLevel(signalImpact),
      
      color: cluster.color,
      segment: SEGMENTS_ORDERED[finalSegIndex],
      segmentIndex: finalSegIndex,
      context: CONTEXTS_ORDERED[finalCtxIndex],
      contextIndex: finalCtxIndex
    });
  }

  return data;
};

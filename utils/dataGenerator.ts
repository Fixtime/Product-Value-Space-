import { DataPoint, JobCategory, JourneyStage, ImpactLevel, ProductConfig, GeneratedCluster } from '../types';

// Colors palette for Clusters (Distinct, high contrast)
const CLUSTER_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', // Red, Orange, Amber, Lime, Emerald
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', // Cyan, Blue, Indigo, Violet, Fuchsia
  '#f43f5e', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', // Rose, Amber, Lime, Emerald, Cyan
  '#60a5fa', '#818cf8', '#a78bfa', '#e879f9', '#fb7185', // Light Blue, Indigo, Violet, Fuchsia, Rose
  '#ff006e', '#8338ec', '#3a86ff', '#ffbe0b', '#fb5607', // Vibrant Set
  '#00b4d8', '#e63946', '#2a9d8f', '#e9c46a', '#f4a261'  // Modern Set
];

// --- DEFAULT MOCK DATA (FALLBACK) ---

const DEFAULT_PROBLEM_TEMPLATES: Record<string, string[]> = {
  "Непонятно, какие модели сейчас актуальны": [
    "Поисковый запрос «какие кроссовки в моде 2025»",
    "Тикет: «Подскажите, какие джинсы сейчас актуальны?»",
    "Чат: «Что сейчас носят вместо mom jeans?»",
    "Отзыв: «Красивая модель, но боюсь, что уже не модно»",
    "Поисковый запрос «тренды обуви весна с картинками»",
    "Возврат: «Увидела, что такой крой уже не носят»",
    "Отказ на стр. Новинки (вход по запросу «модное»)",
    "Звонок: «Подскажите, какие пуховики сейчас модные?»"
  ],
  "Сложно составить гармоничный образ из вещей": [
    "Поиск «с чем носить зеленые брюки»",
    "Тикет: «Подойдет ли эта блузка к юбке арт. 123?»",
    "Отзыв: «Вещь хорошая, но не знаю, с чем сочетать»",
    "Чат: «Есть ли готовые луки с этим пиджаком?»",
    "Возврат: «Не вписалась в гардероб»"
  ],
  "Проблемы с размером и посадкой": [
    "Возврат: «Большемерит на два размера»",
    "Отзыв: «Рукава короткие на рост 175»",
    "Чат: «Какой размер брать на 90-60-90?»",
    "Поиск «одежда для высоких»",
    "Тикет: «Таблица размеров не соответствует»"
  ],
  "Качество и износостойкость": [
    "Отзыв: «После первой стирки превратилась в тряпку»",
    "Возврат: «Торчат нитки, кривые швы»",
    "Жалоба: «Катышки появились через неделю»",
    "Чат: «Это натуральная кожа или кожзам?»"
  ],
  "Сложности с доставкой и возвратом": [
    "Тикет: «Где мой заказ? Опаздывает на 3 дня»",
    "Чат: «Курьер не позвонил заранее»",
    "Отзыв: «Платный возврат - это грабеж»",
    "Звонок: «Не могу оформить возврат в приложении»"
  ]
};

// Fallback default values
export let JOBS_ORDERED: string[] = [
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

export let SEGMENTS_ORDERED: string[] = [
  "Активные школьницы",
  "Студентки ВУЗов",
  "Молодые специалисты",
  "Фрилансеры",
  "Молодые мамы",
  "Офисные менеджеры",
  "Руководители бизнеса",
  "Предприниматели 45+",
  "Активные пенсионеры",
  "Пенсионеры с ограничениями"
];

export let CONTEXTS_ORDERED: string[] = [
  "Дома в постели (ночь)",
  "Утренний кофе (планшет)",
  "Поездка в транспорте (телефон)",
  "На бегу (быстрый поиск)",
  "Обеденный перерыв (десктоп)",
  "Рабочее время (фоном)",
  "Вечерний шопинг (ноутбук)",
  "В магазине (сравнение цен)",
  "Срочная покупка перед выездом",
  "Критическая ситуация (порвалось)"
];

const GENERIC_SOURCES = [
  "Яндекс.Метрика (поиск)",
  "Техподдержка (Zendesk)",
  "Онлайн-чат (Jivo)",
  "Отзывы на сайте",
  "Маркетплейс (Wildberries)",
  "Маркетплейс (Ozon)",
  "CRM (Email)",
  "Instagram",
  "Telegram-бот",
  "App Store Reviews",
  "Колл-центр"
];

// Assign source based on signal text content for realism
const guessSource = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes("поиск") || t.includes("search")) return "Внутренний поиск";
  if (t.includes("тикет") || t.includes("ticket")) return "Служба поддержки";
  if (t.includes("чат") || t.includes("chat")) return "Онлайн-чат";
  if (t.includes("отзыв") || t.includes("review")) return "Отзывы";
  if (t.includes("звонок") || t.includes("call")) return "Колл-центр";
  return GENERIC_SOURCES[Math.floor(Math.random() * GENERIC_SOURCES.length)];
};

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

interface ProblemCluster {
  name: string;
  templates: string[];
  jobIndex: number;
  segIndex: number;
  ctxIndex: number;
  clusterImpactScore: number;
  clusterImpactLevel: ImpactLevel;
  journeyStage: JourneyStage;
  color: string;
  rootCauseGenerated: boolean;
}

export const generateData = (count: number = 5000, config?: ProductConfig): DataPoint[] => {
  const data: DataPoint[] = [];
  const clusters: ProblemCluster[] = [];
  const nameToColor: Record<string, string> = {}; 

  // Update globals if config is provided
  if (config) {
    JOBS_ORDERED = config.jobs;
    SEGMENTS_ORDERED = config.segments;
    CONTEXTS_ORDERED = config.contexts;
  } else {
    // Reset to defaults if no config (simplified for this example, ideally would restore consts)
  }
  
  // --- STEP 1: GENERATE CLUSTERS ---
  
  let sourceClusters: GeneratedCluster[] = [];

  if (config) {
    sourceClusters = config.clusters;
  } else {
    // Generate default clusters from hardcoded templates
    const problemNames = Object.keys(DEFAULT_PROBLEM_TEMPLATES);
    // Create 45 mock clusters by repeating templates with variation
    for (let i = 0; i < 45; i++) {
        const name = problemNames[i % problemNames.length];
        sourceClusters.push({
            name: name,
            templates: DEFAULT_PROBLEM_TEMPLATES[name],
            journeyStage: JourneyStage.PURCHASE, // Default fallback
            impactWeight: 5 // Default
        });
    }
  }

  // Separate clusters by impact for distribution
  // We want exactly 5 Very High Impact clusters
  // In dynamic mode, we trust the LLM's weights but cap the "Very High" visual representation
  
  // Sort source clusters by weight descending to pick the top 5 for "Very High"
  const sortedSource = [...sourceClusters].sort((a, b) => (b.impactWeight || 0) - (a.impactWeight || 0));
  
  // Indices for dominant segments (randomly picked if dynamic)
  const dominantSegments = [1, 3, 4, 8];

  for (let i = 0; i < sortedSource.length; i++) {
    const source = sortedSource[i];
    
    // 1. Determine Impact (Force top 5 to be Very High, next 2 High, etc)
    let impact: number;
    if (i < 5) {
        impact = 6.5 + Math.random() * 0.5; // Top 5 -> Very High
    } else if (i < 7) {
        impact = 1.5 + Math.random() * 0.99; // Next 2 -> High
    } else {
        // Distribute rest
        const r = Math.random();
        if (r < 0.4) impact = 0.8 + Math.random() * 0.69; 
        else if (r < 0.8) impact = 0.3 + Math.random() * 0.49; 
        else impact = 0.1 + Math.random() * 0.19; 
    }

    // 2. Assign Spatial Position
    // Dynamic: Pick random indices if not predefined
    const segIndex = dominantSegments.includes(i % 10) 
        ? dominantSegments[Math.floor(Math.random() * dominantSegments.length)]
        : Math.floor(Math.random() * 10);
    
    const jobIndex = Math.floor(Math.random() * 10);
    const ctxIndex = Math.floor(Math.random() * 10);

    // 3. Color
    if (!nameToColor[source.name]) {
        const colorIndex = Object.keys(nameToColor).length;
        nameToColor[source.name] = CLUSTER_PALETTE[colorIndex % CLUSTER_PALETTE.length];
    }

    clusters.push({
      name: source.name,
      templates: source.templates,
      jobIndex: jobIndex,
      segIndex: segIndex,
      ctxIndex: ctxIndex,
      clusterImpactScore: impact,
      clusterImpactLevel: getImpactLevel(impact),
      journeyStage: source.journeyStage || JourneyStage.ACTIVE_USE,
      color: nameToColor[source.name],
      rootCauseGenerated: false
    });
  }

  // --- STEP 2: GENERATE SIGNALS ---
  
  for (let i = 0; i < count; i++) {
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    
    let signalImpact = cluster.clusterImpactScore;
    let isRootCause = false;
    
    if (!cluster.rootCauseGenerated) {
        isRootCause = true;
        cluster.rootCauseGenerated = true;
        signalImpact = cluster.clusterImpactScore;
    } else {
        if (cluster.clusterImpactLevel === ImpactLevel.VERY_HIGH) {
             signalImpact = 0.2 + Math.random() * 0.7;
        } else {
             signalImpact = Math.max(0.1, cluster.clusterImpactScore * 0.6 + (Math.random() - 0.5) * 0.2);
        }
    }

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
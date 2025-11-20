
import { DataPoint, JobCategory, JourneyStage, ImpactLevel } from '../types';

// Colors mapped to Journey Stages
const STAGE_COLORS = {
  [JourneyStage.AWARENESS]: '#a855f7',     // Purple
  [JourneyStage.CONSIDERATION]: '#3b82f6', // Blue
  [JourneyStage.PURCHASE]: '#22c55e',      // Green
  [JourneyStage.ONBOARDING]: '#facc15',    // Yellow
  [JourneyStage.ACTIVE_USE]: '#ef4444',    // Red
  [JourneyStage.RETENTION]: '#ec4899',     // Pink
  [JourneyStage.ADVOCACY]: '#22d3ee',      // Cyan
};

// Problems/Pain Points
const DESCRIPTIONS = [
  "Непонятно, какие модели сейчас актуальны",
  "Сложно составить гармоничный образ из вещей",
  "Отсутствие готовых капсул, приходится искать по одной",
  "Ткань быстро скатывается и теряет вид",
  "Нужного размера нет в наличии более недели",
  "Слишком сложный и долгий процесс возврата",
  "Одежда висит мешком и не подчеркивает фигуру",
  "Рукава изделий систематически коротки",
  "Пропорции кроя не подходят (узкие бедра, широкая талия)",
  "В линейке отсутствуют модели на высокий рост",
  "Оверсайз модели визуально полнят и добавляют вес",
  "Непрозрачные сроки доставки, риск не успеть",
  "Цвет в реальности не совпадает с фото",
  "После стирки вещь села на два размера",
  "Фурнитура выглядит дешево и быстро ломается"
];

const SOURCES = [
  "Отзывы клиентов",
  "Пользовательские сессии",
  "Обращения в поддержку",
  "Глубинные интервью"
];

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
  "Активные школьницы",           // Index 0 (Z: -9)
  "Студентки ВУЗов",              // Index 1 (Z: -7)
  "Молодые специалисты",          // Index 2 (Z: -5)
  "Фрилансеры и цифровые кочевники", // Index 3 (Z: -3)
  "Молодые мамы",                 // Index 4 (Z: -1)
  "Офисные менеджеры",            // Index 5 (Z: 1)
  "Руководители бизнеса",         // Index 6 (Z: 3)
  "Предприниматели 45+",          // Index 7 (Z: 5)
  "Активные пенсионеры",          // Index 8 (Z: 7)
  "Пенсионеры с ограничениями"    // Index 9 (Z: 9)
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

// Map an index (0-9) to a coordinate (-9 to +9) with jitter
function mapIndexToCoordinate(index: number, jitter: number = 0.8): number {
  const center = -9 + (index * 2);
  return generateRandomNormal(center, jitter);
}

// Logic for the 5 "Very High" impact items
const getVeryHighImpact = (): number => {
  // Set coefficient to 6.5 (with slight variance for visual interest)
  return 6.5 + Math.random() * 0.5;
};

// Logic for the rest of the items (Strictly < 2.5)
const getStandardWeightedImpact = (): number => {
  const r = Math.random();
  
  // High reduced by 3x (from ~10% to ~3.3%)
  // Score 1.5 to 2.49
  if (r < 0.033) return 1.5 + Math.random() * 0.99;
  
  // Medium (approx 25% kept)
  // Previous threshold was 0.35 (0.10 + 0.25). New is 0.033 + 0.25 = 0.283
  // Score 0.8 to 1.49
  if (r < 0.283) return 0.8 + Math.random() * 0.69;
  
  // Low (approx 30% kept)
  // Previous threshold was 0.65 (0.35 + 0.30). New is 0.283 + 0.30 = 0.583
  // Score 0.3 to 0.79
  if (r < 0.583) return 0.3 + Math.random() * 0.49;
  
  // Micro (Remaining ~41.7%, was 35%)
  // Score 0.1 to 0.29
  return 0.1 + Math.random() * 0.19; 
};

const getImpactLevel = (score: number): ImpactLevel => {
  if (score >= 2.5) return ImpactLevel.VERY_HIGH;
  if (score >= 1.5) return ImpactLevel.HIGH;
  if (score >= 0.8) return ImpactLevel.MEDIUM;
  if (score >= 0.3) return ImpactLevel.LOW;
  return ImpactLevel.MICRO;
};

const getWeightedStage = (): JourneyStage => {
  const r = Math.random();
  if (r < 0.50) return JourneyStage.PURCHASE;
  if (r < 0.70) return JourneyStage.RETENTION;
  
  const others = Object.values(JourneyStage).filter(
    s => s !== JourneyStage.PURCHASE && s !== JourneyStage.RETENTION
  );
  return others[Math.floor(Math.random() * others.length)];
};

// Clustering Definition
interface ClusterHotspot {
  jobIndex: number; // 0-9
  segIndex: number; // 0-9
  ctxIndex: number; // 0-9
}

export const generateData = (count: number = 5000): DataPoint[] => {
  const data: DataPoint[] = [];
  
  // Define Hotspots for Clustering
  // WE create hotspots specifically biased towards certain dominant segments
  const hotspots: ClusterHotspot[] = [];
  
  // Indices for dominant segments: 
  // 1: Студентки ВУЗов
  // 3: Фрилансеры
  // 4: Молодые мамы
  // 8: Активные пенсионеры
  const dominantSegments = [1, 3, 4, 8]; 
  
  // Generate 25 hotspots
  for (let i = 0; i < 25; i++) {
      // 70% chance for hotspot to be in a dominant segment
      const useDominant = Math.random() < 0.7;
      const seg = useDominant 
        ? dominantSegments[Math.floor(Math.random() * dominantSegments.length)] 
        : Math.floor(Math.random() * 10);

      hotspots.push({
          segIndex: seg,
          jobIndex: Math.floor(Math.random() * 10),
          ctxIndex: Math.floor(Math.random() * 10)
      });
  }

  for (let i = 0; i < count; i++) {
    let segmentIndex: number;
    let contextIndex: number;
    let jobIndex: number;
    
    // Default spread (used for noise)
    let gridJitter = 0.8;

    // Clustering Logic: 95% of points belong to a cluster
    if (Math.random() < 0.95) {
      const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
      
      // Start at the hotspot center
      segmentIndex = hotspot.segIndex;
      contextIndex = hotspot.ctxIndex;
      jobIndex = hotspot.jobIndex;
      
      // Very tight spread for "dense" look (0.22 down from 0.4)
      gridJitter = 0.22; 
      
      // Organic Drift: Points shouldn't be perfectly spherical.
      // Randomly drift along ONE axis to create "stretched" clusters
      if (Math.random() > 0.7) {
          const axis = Math.random();
          const drift = (Math.random() - 0.5) * 1.2; // +/- 0.6 unit drift
          
          if (axis < 0.33) segmentIndex += drift;
          else if (axis < 0.66) contextIndex += drift;
          else jobIndex += drift;
      }
      
    } else {
      // Random Noise (5%)
      segmentIndex = Math.random() * 10; 
      contextIndex = Math.random() * 10;
      jobIndex = Math.random() * 10;
    }
    
    // Clamp indices to grid bounds (0.0 to 9.9)
    segmentIndex = Math.max(0, Math.min(9.9, segmentIndex));
    contextIndex = Math.max(0, Math.min(9.9, contextIndex));
    jobIndex = Math.max(0, Math.min(9.9, jobIndex));

    // Generate 3D Coordinates
    // mapIndexToCoordinate can handle float inputs, calculating correct center
    const z = mapIndexToCoordinate(segmentIndex, gridJitter);
    const y = mapIndexToCoordinate(contextIndex, gridJitter);
    const x = mapIndexToCoordinate(jobIndex, gridJitter);

    // Determine categorical values based on nearest integer index
    const finalJobIndex = Math.round(jobIndex);
    const finalSegIndex = Math.round(segmentIndex);
    const finalCtxIndex = Math.round(contextIndex);

    const category = JOBS_ORDERED[finalJobIndex];
    
    // Exact number logic: First 5 items are "Very High", rest are standard.
    let impact: number;
    if (i < 5) {
      impact = getVeryHighImpact();
    } else {
      impact = getStandardWeightedImpact();
    }

    const impactLevel = getImpactLevel(impact);
    const stage = getWeightedStage();

    data.push({
      id: `sig-${10000 + i}`,
      position: [x, y, z],
      jobCategory: category,
      jobIndex: finalJobIndex,
      journeyStage: stage,
      impactScore: impact,
      impactLevel: impactLevel,
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      color: STAGE_COLORS[stage],
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      segment: SEGMENTS_ORDERED[finalSegIndex],
      segmentIndex: finalSegIndex,
      context: CONTEXTS_ORDERED[finalCtxIndex],
      contextIndex: finalCtxIndex
    });
  }

  return data;
};

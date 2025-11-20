
import { DataPoint, JobCategory } from '../types';

// Colors for Jobs (X Axis influence)
const JOB_COLORS = {
  [JobCategory.UPDATE_WARDROBE]: '#3b82f6', // Blue
  [JobCategory.REPLACE_ITEM]: '#ef4444',    // Red
  [JobCategory.FIND_FIT]: '#22c55e',        // Green
};

// Refactored to be specific PROBLEMS/PAIN POINTS instead of needs/jobs
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
  "Непрозрачные сроки доставки, риск не успеть"
];

const SOURCES = [
  "Отзывы клиентов",
  "Пользовательские сессии",
  "Обращения в поддержку",
  "Глубинные интервью"
];

// Z-AXIS: User Segments (Ordered from Active/Young -> Passive/Old)
// 10 Segments mapping from -10 to +10
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
// 10 Contexts mapping from -10 (Low energy/Private) to +10 (High energy/Public)
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
  // Range is -10 to 10 (size 20). 10 slots. Each slot is 2 units wide.
  // Slot 0 center: -9. Slot 9 center: +9.
  const center = -9 + (index * 2);
  return generateRandomNormal(center, jitter);
}

export const generateData = (count: number = 600): DataPoint[] => {
  const data: DataPoint[] = [];
  const jobCategories = Object.values(JobCategory);

  for (let i = 0; i < count; i++) {
    // 1. Pick Segment (Z Axis)
    // We use a weighted random to simulate real population distribution (more in middle)
    let segmentIndex = Math.floor(Math.random() * 10);
    // Let's cluster slightly more towards indexes 1-5 (younger active shoppers)
    if (Math.random() > 0.7) {
        segmentIndex = Math.floor(Math.random() * 6); 
    }
    const z = mapIndexToCoordinate(segmentIndex);

    // 2. Pick Context (Y Axis)
    // Random distribution
    const contextIndex = Math.floor(Math.random() * 10);
    const y = mapIndexToCoordinate(contextIndex);

    // 3. Pick Job (X Axis)
    // Map Job to X coordinate roughly for clustering
    // Update Wardrobe -> Left (-X)
    // Replace Item -> Right (+X)
    // Find Fit -> Middle/Scattered
    const category = jobCategories[Math.floor(Math.random() * jobCategories.length)];
    let xBase = 0;
    if (category === JobCategory.UPDATE_WARDROBE) xBase = -6;
    if (category === JobCategory.REPLACE_ITEM) xBase = 6;
    if (category === JobCategory.FIND_FIT) xBase = 0;
    
    const x = generateRandomNormal(xBase, 2.5); // Wider spread on X to create overlap

    data.push({
      id: `sig-${1000 + i}`,
      position: [x, y, z],
      jobCategory: category,
      impactScore: 0.4 + Math.random() * 1.1,
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      color: JOB_COLORS[category],
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      segment: SEGMENTS_ORDERED[segmentIndex],
      segmentIndex: segmentIndex,
      context: CONTEXTS_ORDERED[contextIndex],
      contextIndex: contextIndex
    });
  }

  return data;
};

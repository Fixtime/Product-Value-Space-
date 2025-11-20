
import { DataPoint, JobCategory } from '../types';

// Updated colors to match the Red/Blue/Green reference style
const CATEGORY_CONFIG = {
  [JobCategory.UPDATE_WARDROBE]: { color: '#3b82f6', center: [-4, 4, -4] }, // Blue
  [JobCategory.REPLACE_ITEM]: { color: '#ef4444', center: [4, -4, 0] }, // Red
  [JobCategory.FIND_FIT]: { color: '#22c55e', center: [0, 4, 4] }, // Green
};

const DESCRIPTIONS = [
  "Не знаю, что сейчас в тренде",
  "Сложно подобрать сочетания цветов",
  "Хочу капсульный гардероб на осень",
  "Старая куртка совсем износилась",
  "Нужна срочная замена белой рубашке",
  "Порвались любимые джинсы",
  "Одежда висит мешком",
  "Рукава всегда слишком длинные",
  "Брюки жмут в бедрах, но велики в талии",
  "Нестандартный рост, сложно найти длину",
  "Ищу оверсайз, который не полнит",
  "Нужен образ на корпоратив завтра"
];

const SOURCES = [
  "Отзывы клиентов",
  "Пользовательские сессии",
  "Обращения в поддержку",
  "Глубинные интервью"
];

const SEGMENTS = [
  "Студентка",
  "Молодая мама",
  "Офисный работник",
  "Турист",
  "Пенсионер",
  "Фэшн-блогер"
];

const CONTEXTS = [
  "Мобильный браузер (вечер)",
  "Десктоп (рабочий перерыв)",
  "iOS приложение (утро)",
  "Android приложение (в пути)",
  "Планшет (выходные)"
];

function generateRandomNormal(mean: number, stdDev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

export const generateData = (count: number = 500): DataPoint[] => {
  const data: DataPoint[] = [];
  const categories = Object.values(JobCategory);

  for (let i = 0; i < count; i++) {
    // Assign a random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    const config = CATEGORY_CONFIG[category];
    
    // Generate position based on cluster center + noise to create organic clouds
    // Clamping to -10 to 10 box
    const x = Math.max(-10, Math.min(10, generateRandomNormal(config.center[0], 3)));
    const y = Math.max(-10, Math.min(10, generateRandomNormal(config.center[1], 3)));
    const z = Math.max(-10, Math.min(10, generateRandomNormal(config.center[2], 3)));

    data.push({
      id: `sig-${1000 + i}`, // slightly more realistic ID
      position: [x, y, z],
      jobCategory: category,
      impactScore: 0.2 + Math.random() * 1.5, // Slightly larger minimum size
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      color: config.color,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      segment: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)],
      context: CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)]
    });
  }

  return data;
};

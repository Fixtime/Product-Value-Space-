
import React from 'react';

export enum JobCategory {
  SEASONAL_UPDATE = 'Обновить гардероб к новому сезону',
  URGENT_REPLACEMENT = 'Быстро найти замену износившейся вещи',
  NON_STANDARD_FIT = 'Подобрать одежду на нестандартную фигуру',
  EVENT_LOOK = 'Собрать готовый образ на конкретное событие',
  MATCHING_EXISTING = 'Найти вещь к уже имеющейся одежде',
  GIFT_BUYING = 'Купить подарок одежды другому человеку',
  BASIC_UPDATE = 'Обновить базовый гардероб недорого',
  NEW_LIFE_STAGE = 'Найти одежду для нового этапа жизни',
  CONFIDENCE_BOOST = 'Купить одежду для уверенности на публике',
  STYLE_EXPERIMENT = 'Экспериментировать с новым стилем без риска',
}

export enum JourneyStage {
  AWARENESS = 'Awareness',
  CONSIDERATION = 'Consideration',
  PURCHASE = 'Purchase',
  ONBOARDING = 'Onboarding',
  ACTIVE_USE = 'Active Use',
  RETENTION = 'Retention',
  ADVOCACY = 'Advocacy',
}

export enum ImpactLevel {
  VERY_HIGH = 'Очень высокая',
  HIGH = 'Высокая',
  MEDIUM = 'Средняя',
  LOW = 'Низкая',
  MICRO = 'Микро',
}

export interface DataPoint {
  id: string;
  position: [number, number, number]; // [x, y, z]
  jobCategory: JobCategory;
  jobIndex: number; // 0-9 position on X axis
  journeyStage: JourneyStage; 
  impactScore: number;
  impactLevel: ImpactLevel; // Derived category for filtering
  description: string;
  color: string;
  source: string;
  segment: string;
  segmentIndex: number; // 0-9 position on Z axis
  context: string;
  contextIndex: number; // 0-9 position on Y axis
}

export interface AppState {
  selectedPoint: DataPoint | null;
}

// Define the elements to add
interface CustomThreeElements {
  ambientLight: any;
  pointLight: any;
  mesh: any;
  sphereGeometry: any;
  meshStandardMaterial: any;
  meshPhysicalMaterial: any; // Added for volumetric look
  ringGeometry: any;
  meshBasicMaterial: any;
  group: any;
  boxGeometry: any;
  gridHelper: any;
  primitive: any;
  lineSegments: any;
  bufferGeometry: any;
  bufferAttribute: any;
  lineBasicMaterial: any;
  edgesGeometry: any; 
  [elemName: string]: any;
}

// Augment the global JSX.IntrinsicElements (for older React types / global JSX)
declare global {
  namespace JSX {
    interface IntrinsicElements extends CustomThreeElements {}
  }
}

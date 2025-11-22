
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
  
  // Cluster/Parent Info
  clusterName: string; // The High-Level Problem Name
  isRootCause: boolean; // Flag for the primary/root cause signal in the cluster
  
  // Signal Info
  description: string; // The Low-Level Specific Signal Text
  source: string; // Source of the signal (Logs, CRM, etc)
  
  // Dimensions
  jobCategory: string; // Changed from Enum to string to support dynamic values
  jobIndex: number; // 0-9 position on X axis
  journeyStage: JourneyStage; 
  
  // Metrics (Inherited from Cluster)
  impactScore: number;
  impactLevel: ImpactLevel; 
  
  color: string;
  
  segment: string;
  segmentIndex: number; // 0-9 position on Z axis
  context: string;
  contextIndex: number; // 0-9 position on Y axis
}

export interface AppState {
  selectedPoint: DataPoint | null;
}

// --- Dynamic Generation Types ---

export interface GeneratedCluster {
  name: string;
  templates: string[];
  journeyStage: JourneyStage;
  impactWeight: number; // 1-10 scale
}

export interface ProductConfig {
  productName: string;
  jobs: string[]; // 10 items
  segments: string[]; // 10 items
  contexts: string[]; // 10 items
  clusters: GeneratedCluster[]; // ~40-50 items
}

// --- Cluster Details & Copilot ---

export interface Hypothesis {
  type: 'Quick Win' | 'Balanced' | 'Revolutionary';
  text: string; // "IF... THEN... BECAUSE..."
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ClusterDetailsData {
  clusterName: string;
  totalImpact: number;
  relativeImpactPercent: number;
  topSegments: { name: string; impact: number }[];
  topContexts: { name: string; impact: number }[];
  topJobs: { name: string; impact: number }[];
  pulsarSignal: DataPoint | null;
  topSignals: DataPoint[];
  hypotheses: {
    quickWins: Hypothesis[];
    balanced: Hypothesis[];
    revolutionary: Hypothesis[];
  };
}

// Augment the global JSX.IntrinsicElements (for older React types / global JSX)
declare global {
  namespace JSX {
    interface IntrinsicElements {
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
  }
  
  // Augment React.JSX namespace for newer React types
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        ambientLight: any;
        pointLight: any;
        mesh: any;
        sphereGeometry: any;
        meshStandardMaterial: any;
        meshPhysicalMaterial: any;
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
    }
  }
}

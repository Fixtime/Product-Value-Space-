
import React from 'react';

export enum JobCategory {
  UPDATE_WARDROBE = 'Обновить гардероб к новому сезону',
  REPLACE_ITEM = 'Быстро найти замену износившейся вещи',
  FIND_FIT = 'Найти вещь на мою нестандартную фигуру',
}

export interface DataPoint {
  id: string;
  position: [number, number, number]; // [x, y, z]
  jobCategory: JobCategory;
  impactScore: number;
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
  edgesGeometry: any; // Added for edges
  [elemName: string]: any;
}

// Augment the global JSX.IntrinsicElements (for older React types / global JSX)
declare global {
  namespace JSX {
    interface IntrinsicElements extends CustomThreeElements {}
  }
}

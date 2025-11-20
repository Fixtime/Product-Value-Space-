
import 'react';

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
  context: string;
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
  [elemName: string]: any;
}

// Augment the 'react' module's JSX.IntrinsicElements (for newer React types)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomThreeElements {}
  }
}

// Augment the global JSX.IntrinsicElements (for older React types / global JSX)
declare global {
  namespace JSX {
    interface IntrinsicElements extends CustomThreeElements {}
  }
}

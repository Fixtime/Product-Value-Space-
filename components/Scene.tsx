
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { DataNode } from './DataNode';
import { DataPoint } from '../types';
import * as THREE from 'three';

interface SceneProps {
  data: DataPoint[];
  selectedId: string | null;
  onNodeSelect: (data: DataPoint) => void;
}

// Component to render neural connections between nearby points
const Connections: React.FC<{ data: DataPoint[] }> = ({ data }) => {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Threshold for connection distance
    const threshold = 3.5; 

    for (let i = 0; i < data.length; i++) {
      const p1 = data[i];
      const v1 = new THREE.Vector3(...p1.position);
      
      // Find neighbors
      for (let j = i + 1; j < data.length; j++) {
        const p2 = data[j];
        // Only connect same category for the "cluster" look
        if (p1.jobCategory !== p2.jobCategory) continue;

        const v2 = new THREE.Vector3(...p2.position);
        if (v1.distanceTo(v2) < threshold) {
            points.push(v1);
            points.push(v2);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [data]);

  if (geometry.attributes.position.count === 0) return null;

  return (
    <lineSegments args={[geometry]}>
      <lineBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.3} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </lineSegments>
  );
};

// Component to draw a 3D Grid Box (Cage)
const GridBox: React.FC = () => {
  const gridSize = 20;
  const divisions = 10;
  const step = gridSize / divisions;
  const half = gridSize / 2;
  const color = "#ffffff"; // White

  const vertices = useMemo(() => {
    const pts: number[] = [];
    
    // Generate lines for the 6 faces of the cube
    for (let i = 0; i <= divisions; i++) {
        const val = -half + i * step;
        
        // XY Planes (Front/Back) - Vertical & Horizontal lines
        // Front Face (Z = half)
        pts.push(-half, val, half, half, val, half); // Horiz
        pts.push(val, -half, half, val, half, half); // Vert
        
        // Back Face (Z = -half)
        pts.push(-half, val, -half, half, val, -half);
        pts.push(val, -half, -half, val, half, -half);

        // XZ Planes (Top/Bottom)
        // Top (Y = half)
        pts.push(-half, half, val, half, half, val);
        pts.push(val, half, -half, val, half, half);
        // Bottom (Y = -half)
        pts.push(-half, -half, val, half, -half, val);
        pts.push(val, -half, -half, val, -half, half);

        // YZ Planes (Left/Right)
        // Right (X = half)
        pts.push(half, val, -half, half, val, half);
        pts.push(half, -half, val, half, half, val);
        // Left (X = -half)
        pts.push(-half, val, -half, -half, val, half);
        pts.push(-half, -half, val, -half, half, val);
    }
    return new Float32Array(pts);
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
    </lineSegments>
  );
};

const SceneContent: React.FC<SceneProps> = ({ data, selectedId, onNodeSelect }) => {
  return (
    <>
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        autoRotate={!selectedId} 
        autoRotateSpeed={0.5}
        maxDistance={50}
        minDistance={5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-15, -15, -15]} intensity={0.5} color="#4f46e5" />
      
      {/* Background Universe */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />

      {/* The Cube Cage */}
      <GridBox />

      {/* Axis Labels */}
      <group>
        <Text position={[11, 0, 0]} fontSize={0.6} color="#ffffff" anchorX="left">Проблема (X)</Text>
        <Text position={[0, 11, 0]} fontSize={0.6} color="#ffffff" anchorY="bottom">Контекст (Y)</Text>
        <Text position={[0, 0, 11]} fontSize={0.6} color="#ffffff" anchorX="right">Пользователь (Z)</Text>
      </group>

      {/* Neural Connections */}
      <Connections data={data} />

      {/* Data Points */}
      {data.map((point) => (
        <DataNode
          key={point.id}
          data={point}
          isSelected={selectedId === point.id}
          onSelect={onNodeSelect}
        />
      ))}
    </>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas 
      camera={{ position: [20, 15, 20], fov: 45 }}
      className="w-full h-full bg-slate-950"
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
};

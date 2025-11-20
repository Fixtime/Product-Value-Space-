
import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { DataNode } from './DataNode';
import { DataPoint } from '../types';
import { SEGMENTS_ORDERED } from '../utils/dataGenerator';
import * as THREE from 'three';

interface SceneProps {
  data: DataPoint[];
  selectedId: string | null;
  activeSegmentIndex: number | null;
  onNodeSelect: (data: DataPoint) => void;
}

// Visual Slice Component for Segment Highlighting
const SegmentSlice: React.FC<{ index: number }> = ({ index }) => {
  // Map index 0-9 to coordinate -9 to +9
  const zPos = -9 + (index * 2);
  const segmentName = SEGMENTS_ORDERED[index];
  
  return (
    <group position={[0, 0, zPos]}>
      {/* The plane representing the slice */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[20, 20, 2]} /> {/* Width, Height, Depth */}
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Border for the slice */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(20, 20, 2)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </lineSegments>

      {/* Label */}
      <Text 
        position={[11, 9, 0]} 
        fontSize={0.5} 
        color="#ffffff" 
        anchorX="left"
        rotation={[0, -Math.PI / 4, 0]}
      >
        {segmentName}
      </Text>
    </group>
  );
};

// Component to render neural connections
const Connections: React.FC<{ data: DataPoint[], activeSegmentIndex: number | null }> = ({ data, activeSegmentIndex }) => {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const threshold = 3.5; 

    for (let i = 0; i < data.length; i++) {
      const p1 = data[i];
      
      // Don't draw connections originating from hidden segments
      if (activeSegmentIndex !== null && p1.segmentIndex !== activeSegmentIndex) continue;

      const v1 = new THREE.Vector3(...p1.position);
      
      for (let j = i + 1; j < data.length; j++) {
        const p2 = data[j];
        
        // Don't draw connections to hidden segments
        if (activeSegmentIndex !== null && p2.segmentIndex !== activeSegmentIndex) continue;

        if (p1.jobCategory !== p2.jobCategory) continue;

        const v2 = new THREE.Vector3(...p2.position);
        if (v1.distanceTo(v2) < threshold) {
            points.push(v1);
            points.push(v2);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [data, activeSegmentIndex]);

  if (geometry.attributes.position.count === 0) return null;

  return (
    <lineSegments args={[geometry]}>
      <lineBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={activeSegmentIndex !== null ? 0.2 : 0.1} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </lineSegments>
  );
};

const FullCage: React.FC<{ isFiltered: boolean }> = ({ isFiltered }) => {
    // When not filtered (inactive), make opacity higher to look "white"
    // When filtered, dim the cage to let the slice focus
    const opacity = isFiltered ? 0.05 : 0.25;
    return (
        <group>
             {/* Bottom Grid (XZ) */}
            <gridHelper position={[0, -10, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
             {/* Top Grid (XZ) */}
            <gridHelper position={[0, 10, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
             {/* Back Grid (XY) */}
            <gridHelper position={[0, 0, -10]} rotation={[Math.PI/2, 0, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
            {/* Left Grid (YZ) */}
            <gridHelper position={[-10, 0, 0]} rotation={[0, 0, Math.PI/2]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
        </group>
    )
}

const SceneContent: React.FC<SceneProps> = ({ data, selectedId, activeSegmentIndex, onNodeSelect }) => {
  const orbitRef = useRef<any>(null);

  useFrame((state) => {
    // Optional camera easing logic could go here
  });

  return (
    <>
      <OrbitControls 
        ref={orbitRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        autoRotate={!selectedId && activeSegmentIndex === null} 
        autoRotateSpeed={0.5}
        maxDistance={50}
        minDistance={2}
      />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-15, -15, -15]} intensity={0.5} color="#4f46e5" />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />

      <FullCage isFiltered={activeSegmentIndex !== null} />

      {/* Axis Labels */}
      <group>
        <Text position={[11, 0, 0]} fontSize={0.6} color="#ffffff" anchorX="left">Проблема (X)</Text>
        <Text position={[0, 11, 0]} fontSize={0.6} color="#ffffff" anchorY="bottom">Контекст (Y)</Text>
        <Text position={[0, 0, 11]} fontSize={0.6} color="#ffffff" anchorX="right">Сегмент (Z)</Text>
      </group>

      {/* Visual Slice Highlight */}
      {activeSegmentIndex !== null && <SegmentSlice index={activeSegmentIndex} />}

      <Connections data={data} activeSegmentIndex={activeSegmentIndex} />

      {data.map((point) => {
        const isDimmed = activeSegmentIndex !== null && point.segmentIndex !== activeSegmentIndex;

        return (
          <group key={point.id}> 
            <DataNode
              data={point}
              isSelected={selectedId === point.id}
              isDimmed={isDimmed}
              onSelect={onNodeSelect}
            />
          </group>
        );
      })}
    </>
  );
};

export const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas 
      camera={{ position: [25, 10, 25], fov: 40 }}
      className="w-full h-full bg-slate-950"
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
};

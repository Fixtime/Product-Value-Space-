
import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { DataNode } from './DataNode';
import { DataPoint, JobCategory } from '../types';
import { SEGMENTS_ORDERED, CONTEXTS_ORDERED } from '../utils/dataGenerator';
import * as THREE from 'three';

interface SceneProps {
  data: DataPoint[];
  selectedId: string | null;
  activeSegmentIndex: number | null; // Z Axis
  activeContextIndex: number | null; // Y Axis
  activeJobCategory: JobCategory | null; // X Axis
  onNodeSelect: (data: DataPoint) => void;
}

// --- Z-AXIS SLICE (Segments) ---
const SegmentSlice: React.FC<{ index: number }> = ({ index }) => {
  const zPos = -9 + (index * 2);
  const segmentName = SEGMENTS_ORDERED[index];
  
  return (
    <group position={[0, 0, zPos]}>
      {/* Plane (XY) */}
      <mesh>
        <boxGeometry args={[20, 20, 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(20, 20, 2)]} />
        <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </lineSegments>
      <Text position={[11, 9, 0]} fontSize={0.5} color="#ffffff" anchorX="left" rotation={[0, -Math.PI / 4, 0]}>
        {segmentName}
      </Text>
    </group>
  );
};

// --- Y-AXIS SLICE (Contexts) ---
const ContextSlice: React.FC<{ index: number }> = ({ index }) => {
  const yPos = -9 + (index * 2);
  const contextName = CONTEXTS_ORDERED[index];

  return (
    <group position={[0, yPos, 0]}>
      {/* Plane (XZ) */}
      <mesh>
        <boxGeometry args={[20, 2, 20]} /> 
        <meshBasicMaterial color="#a855f7" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(20, 2, 20)]} />
        <lineBasicMaterial color="#a855f7" opacity={0.3} transparent />
      </lineSegments>
      <Text position={[0, 0, 11]} fontSize={0.5} color="#a855f7" anchorX="center" rotation={[-Math.PI / 4, 0, 0]}>
        {contextName}
      </Text>
    </group>
  );
};

// --- X-AXIS SLICE (Jobs) ---
const JobSlice: React.FC<{ category: JobCategory }> = ({ category }) => {
  // Map Category to Approximate X Center based on generator logic
  let xPos = 0;
  let color = "#ffffff";
  
  if (category === JobCategory.UPDATE_WARDROBE) { xPos = -6; color = "#3b82f6"; }
  if (category === JobCategory.REPLACE_ITEM) { xPos = 6; color = "#ef4444"; }
  if (category === JobCategory.FIND_FIT) { xPos = 0; color = "#22c55e"; }

  return (
    <group position={[xPos, 0, 0]}>
      {/* Plane (YZ) - Wider slice for X because data is more scattered */}
      <mesh>
        <boxGeometry args={[4, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4, 20, 20)]} />
        <lineBasicMaterial color={color} opacity={0.3} transparent />
      </lineSegments>
      <Text position={[0, 11, 0]} fontSize={0.5} color={color} anchorY="bottom">
        {category}
      </Text>
    </group>
  );
};

const Connections: React.FC<{ 
  data: DataPoint[], 
  activeSegmentIndex: number | null,
  activeContextIndex: number | null,
  activeJobCategory: JobCategory | null
}> = ({ data, activeSegmentIndex, activeContextIndex, activeJobCategory }) => {
  
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const threshold = 3.5; 

    // Helper to check if a point matches all active filters
    const isVisible = (p: DataPoint) => {
      if (activeSegmentIndex !== null && p.segmentIndex !== activeSegmentIndex) return false;
      if (activeContextIndex !== null && p.contextIndex !== activeContextIndex) return false;
      if (activeJobCategory !== null && p.jobCategory !== activeJobCategory) return false;
      return true;
    };

    for (let i = 0; i < data.length; i++) {
      const p1 = data[i];
      if (!isVisible(p1)) continue;

      const v1 = new THREE.Vector3(...p1.position);
      
      for (let j = i + 1; j < data.length; j++) {
        const p2 = data[j];
        if (!isVisible(p2)) continue;

        if (p1.jobCategory !== p2.jobCategory) continue;

        const v2 = new THREE.Vector3(...p2.position);
        if (v1.distanceTo(v2) < threshold) {
            points.push(v1);
            points.push(v2);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [data, activeSegmentIndex, activeContextIndex, activeJobCategory]);

  if (geometry.attributes.position.count === 0) return null;

  return (
    <lineSegments args={[geometry]}>
      <lineBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.15} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </lineSegments>
  );
};

const FullCage: React.FC<{ isFiltered: boolean }> = ({ isFiltered }) => {
    const opacity = isFiltered ? 0.05 : 0.25;
    return (
        <group>
            <gridHelper position={[0, -10, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
            <gridHelper position={[0, 10, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
            <gridHelper position={[0, 0, -10]} rotation={[Math.PI/2, 0, 0]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
            <gridHelper position={[-10, 0, 0]} rotation={[0, 0, Math.PI/2]} args={[20, 10, 0xffffff, 0xffffff]} material-opacity={opacity} material-transparent />
        </group>
    )
}

const SceneContent: React.FC<SceneProps> = ({ 
  data, selectedId, activeSegmentIndex, activeContextIndex, activeJobCategory, onNodeSelect 
}) => {
  const orbitRef = useRef<any>(null);
  const isFiltered = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null;

  return (
    <>
      <OrbitControls 
        ref={orbitRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        autoRotate={!selectedId && !isFiltered} 
        autoRotateSpeed={0.5}
        maxDistance={50}
        minDistance={2}
      />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-15, -15, -15]} intensity={0.5} color="#4f46e5" />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />

      <FullCage isFiltered={isFiltered} />

      <group>
        <Text position={[11, 0, 0]} fontSize={0.6} color="#ffffff" anchorX="left">Customer Job (X)</Text>
        <Text position={[0, 11, 0]} fontSize={0.6} color="#ffffff" anchorY="bottom">Контекст (Y)</Text>
        <Text position={[0, 0, 11]} fontSize={0.6} color="#ffffff" anchorX="right">Сегмент (Z)</Text>
      </group>

      {/* Visual Slice Highlights */}
      {activeSegmentIndex !== null && <SegmentSlice index={activeSegmentIndex} />}
      {activeContextIndex !== null && <ContextSlice index={activeContextIndex} />}
      {activeJobCategory !== null && <JobSlice category={activeJobCategory} />}

      <Connections 
        data={data} 
        activeSegmentIndex={activeSegmentIndex} 
        activeContextIndex={activeContextIndex}
        activeJobCategory={activeJobCategory}
      />

      {data.map((point) => {
        // Visibility Logic: A point is dimmed if it FAILS any active filter
        let isDimmed = false;
        if (activeSegmentIndex !== null && point.segmentIndex !== activeSegmentIndex) isDimmed = true;
        if (activeContextIndex !== null && point.contextIndex !== activeContextIndex) isDimmed = true;
        if (activeJobCategory !== null && point.jobCategory !== activeJobCategory) isDimmed = true;

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

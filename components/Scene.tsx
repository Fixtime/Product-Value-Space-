
import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { DataNode } from './DataNode';
import { DataPoint, JobCategory, JourneyStage, ImpactLevel } from '../types';
import { SEGMENTS_ORDERED, CONTEXTS_ORDERED, JOBS_ORDERED } from '../utils/dataGenerator';
import * as THREE from 'three';

interface SceneProps {
  data: DataPoint[];
  selectedId: string | null;
  activeSegmentIndex: number | null; // Z Axis
  activeContextIndex: number | null; // Y Axis
  activeJobCategory: JobCategory | null; // X Axis
  activeClusterName: string | null; // Cluster Filter
  selectedStages: JourneyStage[]; // Color/Stage Filter (Multi-select)
  selectedImpactLevels: ImpactLevel[]; // Impact Filter (Multi-select)
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
// Updated to support standard 10-slot grid
const JobSlice: React.FC<{ category: JobCategory }> = ({ category }) => {
  const index = JOBS_ORDERED.indexOf(category);
  // Map index 0-9 to coordinate -9 to +9
  const xPos = index !== -1 ? -9 + (index * 2) : 0;
  const color = "#38bdf8"; // Sky Blue for X-Axis

  return (
    <group position={[xPos, 0, 0]}>
      {/* Plane (YZ) */}
      <mesh>
        <boxGeometry args={[2, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 20, 20)]} />
        <lineBasicMaterial color={color} opacity={0.3} transparent />
      </lineSegments>
      <Text position={[0, 11, 0]} fontSize={0.5} color={color} anchorY="bottom">
        {category}
      </Text>
    </group>
  );
};

// --- INTERSECTION HIGHLIGHT ---
const IntersectionHighlight: React.FC<{
  activeSegmentIndex: number | null;
  activeContextIndex: number | null;
  activeJobCategory: JobCategory | null;
}> = ({ activeSegmentIndex, activeContextIndex, activeJobCategory }) => {
  
  const filters = [activeSegmentIndex !== null, activeContextIndex !== null, activeJobCategory !== null];
  const activeCount = filters.filter(Boolean).length;

  if (activeCount < 2) return null;

  let position: [number, number, number] = [0, 0, 0];
  let args: [number, number, number] = [1, 1, 1];

  const z = activeSegmentIndex !== null ? -9 + (activeSegmentIndex * 2) : 0;
  const y = activeContextIndex !== null ? -9 + (activeContextIndex * 2) : 0;
  
  // Calculate X based on index of category
  const jobIndex = activeJobCategory ? JOBS_ORDERED.indexOf(activeJobCategory) : 0;
  const x = -9 + (jobIndex * 2);

  // 10x10x10 Grid -> Cell Size is 2x2x2
  
  if (activeCount === 3) {
    position = [x, y, z];
    args = [2, 2, 2]; // Single Cell
  }
  else if (activeJobCategory !== null && activeContextIndex !== null) {
    position = [x, y, 0];
    args = [2, 2, 20]; // Vertical Column (Depth 20)
  }
  else if (activeJobCategory !== null && activeSegmentIndex !== null) {
    position = [x, 0, z];
    args = [2, 20, 2]; // Horizontal Column (Height 20)
  }
  else if (activeContextIndex !== null && activeSegmentIndex !== null) {
    position = [0, y, z];
    args = [20, 2, 2]; // Horizontal Bar (Width 20)
  }

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={args} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.25} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...args)]} />
        <lineBasicMaterial color="#fbbf24" opacity={1} transparent linewidth={2} />
      </lineSegments>
       <mesh>
        <boxGeometry args={args} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.05} 
          depthWrite={false} 
        />
      </mesh>
    </group>
  );
};

const Connections: React.FC<{ 
  data: DataPoint[], 
  activeSegmentIndex: number | null,
  activeContextIndex: number | null,
  activeJobCategory: JobCategory | null,
  activeClusterName: string | null,
  selectedStages: JourneyStage[],
  selectedImpactLevels: ImpactLevel[]
}> = ({ data, activeSegmentIndex, activeContextIndex, activeJobCategory, activeClusterName, selectedStages, selectedImpactLevels }) => {
  
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const threshold = 2.5;

    // Helper to check if a point matches all active filters
    const isVisible = (p: DataPoint) => {
      if (activeSegmentIndex !== null && p.segmentIndex !== activeSegmentIndex) return false;
      if (activeContextIndex !== null && p.contextIndex !== activeContextIndex) return false;
      if (activeJobCategory !== null && p.jobCategory !== activeJobCategory) return false;
      if (activeClusterName !== null && p.clusterName !== activeClusterName) return false;
      if (selectedStages.length > 0 && !selectedStages.includes(p.journeyStage)) return false;
      if (selectedImpactLevels.length > 0 && !selectedImpactLevels.includes(p.impactLevel)) return false;
      return true;
    };

    for (let i = 0; i < data.length; i++) {
      const p1 = data[i];
      if (!isVisible(p1)) continue;

      const v1 = new THREE.Vector3(...p1.position);
      
      for (let j = i + 1; j < data.length; j++) {
        const p2 = data[j];
        if (!isVisible(p2)) continue;

        // Only connect nodes of same category
        if (p1.jobCategory !== p2.jobCategory) continue;

        const v2 = new THREE.Vector3(...p2.position);
        if (v1.distanceTo(v2) < threshold) {
            points.push(v1);
            points.push(v2);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [data, activeSegmentIndex, activeContextIndex, activeJobCategory, activeClusterName, selectedStages, selectedImpactLevels]);

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
  data, selectedId, activeSegmentIndex, activeContextIndex, activeJobCategory, activeClusterName, selectedStages, selectedImpactLevels, onNodeSelect 
}) => {
  const orbitRef = useRef<any>(null);
  const isFiltered = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null || activeClusterName !== null || selectedStages.length > 0 || selectedImpactLevels.length > 0;

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

      {/* Intersection Highlight */}
      <IntersectionHighlight 
        activeSegmentIndex={activeSegmentIndex} 
        activeContextIndex={activeContextIndex} 
        activeJobCategory={activeJobCategory} 
      />

      <Connections 
        data={data} 
        activeSegmentIndex={activeSegmentIndex} 
        activeContextIndex={activeContextIndex}
        activeJobCategory={activeJobCategory}
        activeClusterName={activeClusterName}
        selectedStages={selectedStages}
        selectedImpactLevels={selectedImpactLevels}
      />

      {data.map((point) => {
        // Cluster Filter - STRICT HIDING
        // If a Cluster Filter is active, strictly hide anything that doesn't match.
        if (activeClusterName !== null && point.clusterName !== activeClusterName) {
            return null;
        }

        // Visibility Logic for other filters (Dimming)
        let isDimmed = false;
        
        // Axis Filters
        if (activeSegmentIndex !== null && point.segmentIndex !== activeSegmentIndex) isDimmed = true;
        if (activeContextIndex !== null && point.contextIndex !== activeContextIndex) isDimmed = true;
        if (activeJobCategory !== null && point.jobCategory !== activeJobCategory) isDimmed = true;
        
        // Stage Filter (Multi-select)
        if (selectedStages.length > 0 && !selectedStages.includes(point.journeyStage)) isDimmed = true;

        // Impact Filter (Multi-select)
        if (selectedImpactLevels.length > 0 && !selectedImpactLevels.includes(point.impactLevel)) isDimmed = true;

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

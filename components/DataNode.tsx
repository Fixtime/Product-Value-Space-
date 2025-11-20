
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import { DataPoint } from '../types';

interface DataNodeProps {
  data: DataPoint;
  isSelected: boolean;
  isDimmed?: boolean;
  onSelect: (data: DataPoint) => void;
}

export const DataNode: React.FC<DataNodeProps> = ({ data, isSelected, isDimmed = false, onSelect }) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const targetScaleVec = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = data.position[1] + Math.sin(t + data.position[0]) * 0.2;
    }
    
    if (!meshRef.current) return;

    if (isSelected) {
      const scale = data.impactScore * 0.5 + Math.sin(t * 5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    } else {
      const targetScale = data.impactScore * 0.4;
      targetScaleVec.set(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(targetScaleVec, 0.1);
    }
  });

  // If dimmed, we can either hide it completely or make it very faint
  // For performance and clarity, if heavily filtered, maybe render a tiny dot or nothing.
  // Let's use transparency.
  
  return (
    <group 
      ref={groupRef}
      position={[data.position[0], data.position[1], data.position[2]]}
    >
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={() => {
          if (!isDimmed) {
            document.body.style.cursor = 'pointer';
            setHovered(true);
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : data.color}
          emissive={data.color}
          emissiveIntensity={isSelected || (hovered && !isDimmed) ? 2 : 0.6}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={isDimmed ? 0.05 : 1} 
          depthWrite={!isDimmed}
        />
      </mesh>

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.impactScore * 0.6, data.impactScore * 0.7, 32]} />
          <meshBasicMaterial color="#ffffff" side={2} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};


import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import { DataPoint } from '../types';

interface DataNodeProps {
  data: DataPoint;
  isSelected: boolean;
  onSelect: (data: DataPoint) => void;
}

export const DataNode: React.FC<DataNodeProps> = ({ data, isSelected, onSelect }) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Create vector once to avoid garbage collection during animation loop
  const targetScaleVec = useMemo(() => new Vector3(), []);

  // Animate hover effect
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Animate the entire group (sphere + ring) to bob up and down
    if (groupRef.current) {
      // Base Y position + Sine wave offset
      groupRef.current.position.y = data.position[1] + Math.sin(t + data.position[0]) * 0.2;
    }
    
    if (!meshRef.current) return;

    // Pulse effect if selected
    if (isSelected) {
      const scale = data.impactScore * 0.5 + Math.sin(t * 5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    } else {
      // Reset scale smoothly
      const targetScale = data.impactScore * 0.4;
      targetScaleVec.set(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(targetScaleVec, 0.1);
    }
  });

  return (
    <group 
      ref={groupRef}
      position={[data.position[0], data.position[1], data.position[2]]}
    >
      {/* The Glowing Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHovered(true);
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
          emissiveIntensity={isSelected || hovered ? 2 : 0.5}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Selection Ring Halo - Now inside the group, so it moves with the sphere */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.impactScore * 0.6, data.impactScore * 0.7, 32]} />
          <meshBasicMaterial color="#ffffff" side={2} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

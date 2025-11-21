
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Group, AdditiveBlending, DoubleSide } from 'three';
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
  const pulseRef1 = useRef<Mesh>(null);
  const pulseRef2 = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const targetScaleVec = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Bobbing motion with random offset per node to avoid uniform movement
    if (groupRef.current) {
      groupRef.current.position.y = data.position[1] + Math.sin(t + data.position[0] * 0.5) * 0.1;
    }
    
    // Main Sphere Scaling
    if (meshRef.current) {
      if (isSelected) {
        const scale = data.impactScore * 0.5 + Math.sin(t * 5) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        const baseScale = data.impactScore * 0.4;
        // Extremely subtle breathing for pulsars
        const targetScale = data.isRootCause 
            ? baseScale * (1 + Math.sin(t * 1.5) * 0.005) // Reduced from 0.03
            : baseScale;
            
        targetScaleVec.set(targetScale, targetScale, targetScale);
        meshRef.current.scale.lerp(targetScaleVec, 0.1);
      }
    }

    // Root Cause Pulsing Effect (Visual "Heartbeat" of the cluster)
    // INTENSITY REDUCED TO ~10%
    if (data.isRootCause && !isDimmed) {
        const baseSize = data.impactScore * 0.4;
        
        // Pulse Layer 1: Inner Glow (Very faint breathing)
        if (pulseRef1.current) {
            // Reduced scale amplitude (from 0.15 to 0.015)
            const scale1 = baseSize * (1.015 + Math.sin(t * 2) * 0.015); 
            pulseRef1.current.scale.set(scale1, scale1, scale1);
            
            // Reduced opacity (from 0.3 base to 0.05 base)
            const opacity1 = 0.05 * (0.6 + 0.4 * Math.sin(t * 2));
             if (!Array.isArray(pulseRef1.current.material)) {
                 pulseRef1.current.material.opacity = opacity1;
            }
        }

        // Pulse Layer 2: Outer Ripple (Very faint expanding wave)
        if (pulseRef2.current) {
            const speed = 0.6;
            const progress = (t * speed) % 1;
            
            // Expansion reduced (from 1.2 to 0.12)
            const scale2 = baseSize * (1.0 + progress * 0.12); 
            pulseRef2.current.scale.set(scale2, scale2, scale2);
            
            // Opacity reduced (from 0.25 max to 0.04 max)
            const opacity2 = 0.04 * (1 - progress); 
             if (!Array.isArray(pulseRef2.current.material)) {
                 pulseRef2.current.material.opacity = opacity2;
            }
        }
    }
  });

  return (
    <group 
      ref={groupRef}
      position={[data.position[0], data.position[1], data.position[2]]}
    >
      {/* Main Sphere */}
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
        <meshPhysicalMaterial
          color={isSelected ? '#ffffff' : data.color}
          emissive={data.color}
          // Reduced emissive intensity for Root Causes to blend better (was 0.8, now 0.4)
          emissiveIntensity={isSelected || (hovered && !isDimmed) ? 1.0 : (data.isRootCause ? 0.4 : 0.15)} 
          roughness={0.2}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={0.5}
          transparent
          opacity={isDimmed ? 0.05 : 1} 
          depthWrite={!isDimmed}
        />
      </mesh>

      {/* Pulsing Aura 1 (Inner Glow) */}
      {data.isRootCause && !isDimmed && (
        <mesh ref={pulseRef1}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial 
                color={data.color} 
                transparent 
                opacity={0.05} 
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
            />
        </mesh>
      )}

      {/* Pulsing Aura 2 (Expanding Ripple) */}
      {data.isRootCause && !isDimmed && (
        <mesh ref={pulseRef2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial 
                color={data.color} 
                transparent 
                opacity={0.04} 
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
            />
        </mesh>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.impactScore * 0.6, data.impactScore * 0.7, 32]} />
          <meshBasicMaterial color="#ffffff" side={DoubleSide} transparent opacity={0.8} blending={AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
};

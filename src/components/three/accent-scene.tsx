import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useGlobalPointer } from "@/hooks/use-global-pointer";
import type { AccentVariant } from "@/components/three/accent-canvas";

function Shape({ variant, color }: { variant: AccentVariant; color: string }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useGlobalPointer();

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    const a = 1 - Math.exp(-8 * delta);
    g.rotation.y += (p.x * 0.7 - g.rotation.y) * a + delta * 0.15;
    g.rotation.x += (-p.y * 0.5 - g.rotation.x) * a;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  const geometry = useMemo(() => {
    if (variant === "orbit") return <icosahedronGeometry args={[1.05, 1]} />;
    if (variant === "cube") return <boxGeometry args={[1.4, 1.4, 1.4]} />;
    return <torusKnotGeometry args={[0.85, 0.28, 140, 24]} />;
  }, [variant]);

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <mesh>
          {geometry}
          <meshStandardMaterial
            color={color}
            roughness={0.18}
            metalness={0.75}
            emissive={color}
            emissiveIntensity={0.18}
          />
        </mesh>
        {variant === "orbit" ? (
          <mesh rotation={[Math.PI / 2.4, 0, 0.4]}>
            <torusGeometry args={[1.7, 0.035, 12, 96]} />
            <meshStandardMaterial color="#6fe3e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ) : null}
      </Float>
    </group>
  );
}

export default function AccentScene({
  variant,
  color,
}: {
  variant: AccentVariant;
  color: string;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 40 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 5, 4]} intensity={45} color="#d9ff8a" />
      <pointLight position={[-4, -3, 3]} intensity={28} color="#4fd8e0" />
      <Shape variant={variant} color={color} />
    </Canvas>
  );
}

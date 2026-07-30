import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Sparkles,
  Torus,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { PerfTier } from "@/hooks/use-perf-tier";
import { useGlobalPointer } from "@/hooks/use-global-pointer";

/* ---------------------------------- models --------------------------------- */

function Bowl({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.35}
          roughness={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.92, 0.9, 0.12, 48]} />
        <meshStandardMaterial color="#e8b25a" roughness={0.6} />
      </mesh>
      <Torus args={[0.98, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#f4f7ee" metalness={0.5} roughness={0.15} />
      </Torus>
    </group>
  );
}

function Burger() {
  const layers = [
    { y: 0, h: 0.26, r: 0.72, c: "#d8993f" },
    { y: 0.22, h: 0.14, r: 0.76, c: "#7fbf4d" },
    { y: 0.38, h: 0.2, r: 0.7, c: "#7a3f22" },
    { y: 0.56, h: 0.14, r: 0.74, c: "#f2c14e" },
  ];
  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[l.r, l.r, l.h, 42]} />
          <meshStandardMaterial color={l.c} roughness={0.45} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.76, 42, 28]} />
        <meshStandardMaterial color="#d8993f" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Cup() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.4, 1.2, 42, 1, true]} />
        {/* A real transmission material re-renders the scene into a buffer every
            frame; a physical glass approximation looks near-identical here and
            costs a fraction of the GPU time. */}
        <meshPhysicalMaterial
          color="#bfeff0"
          roughness={0.06}
          metalness={0.1}
          transparent
          opacity={0.45}
          clearcoat={1}
          clearcoatRoughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.06, 42]} />
        <meshStandardMaterial color="#9fdad9" roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.5, 0]} rotation={[0, 0, -0.28]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 16]} />
        <meshStandardMaterial color="#c8f24a" roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ----------------------------------- steam ---------------------------------- */

function Steam({ count = 24, origin = [0, 0.9, 0] as [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        t: Math.random(),
        speed: 0.12 + Math.random() * 0.16,
        drift: (Math.random() - 0.5) * 0.5,
        scale: 0.12 + Math.random() * 0.2,
      })),
    [count],
  );

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    seeds.forEach((s, i) => {
      s.t += delta * s.speed;
      if (s.t > 1) s.t = 0;
      const life = s.t;
      dummy.position.set(
        origin[0] + Math.sin(life * 6 + i) * 0.18 + s.drift * life,
        origin[1] + life * 2.4,
        origin[2] + Math.cos(life * 5 + i) * 0.14,
      );
      const scale = s.scale * (0.4 + life * 1.6);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#eafbe2" transparent opacity={0.07} depthWrite={false} />
    </instancedMesh>
  );
}

/* ------------------------------- ingredients -------------------------------- */

function Ingredients({ tier, reducedMotion }: { tier: PerfTier; reducedMotion: boolean }) {
  const count = tier === "high" ? 10 : 6;
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: [
          (i % 2 === 0 ? -1 : 1) * (2.6 + Math.random() * 2.6),
          (Math.random() - 0.45) * 5,
          -2.5 - Math.random() * 4,
        ] as [number, number, number],
        scale: 0.05 + Math.random() * 0.06,
        kind: i % 3,
        color: ["#c8f24a", "#6fe3e1", "#f2994a"][i % 3],
        speed: 0.4 + Math.random(),
      })),

    [count],
  );

  return (
    <>
      {items.map((it, i) => (
        <Float
          key={i}
          speed={reducedMotion ? 0 : it.speed}
          rotationIntensity={reducedMotion ? 0 : 1.6}
          floatIntensity={reducedMotion ? 0 : 1.4}
        >
          <mesh position={it.pos} scale={it.scale} castShadow>
            {it.kind === 0 ? (
              <icosahedronGeometry args={[1, 0]} />
            ) : it.kind === 1 ? (
              <torusGeometry args={[1, 0.35, 12, 24]} />
            ) : (
              <capsuleGeometry args={[0.6, 1.1, 6, 12]} />
            )}
            <meshStandardMaterial
              color={it.color}
              roughness={0.25}
              metalness={0.45}
              emissive={it.color}
              emissiveIntensity={0.12}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ---------------------------- camera / interaction --------------------------- */

function CameraRig({
  scroll,
  reducedMotion,
}: {
  scroll: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const pointer = useGlobalPointer();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const s = scroll.current;
    // Reduced motion: the camera stops chasing the cursor entirely — only the
    // (user-driven) scroll offset moves it, so nothing animates on its own.
    const p = reducedMotion ? { x: 0, y: 0 } : pointer.current;
    // Frame-rate independent easing, tuned high enough that the camera tracks
    // the cursor without the rubber-band lag.
    const a = 1 - Math.exp(-11 * delta);
    target.set(p.x * 1.8, 0.4 + p.y * 1.0 - s * 1.6, 8 - s * 3.2);
    camera.position.lerp(target, a);
    lookTarget.set(p.x * 0.35, 0.2 + p.y * 0.2 - s * 0.8, 0);
    look.lerp(lookTarget, a);
    camera.lookAt(look);
  });
  return null;

}

function Plate({
  tier,
  scroll,
  reducedMotion,
}: {
  tier: PerfTier;
  scroll: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.y = 0;
      group.current.position.y = -1.4 - scroll.current * 0.4;
      return;
    }
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    group.current.position.y =
      -1.4 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12 - scroll.current * 0.4;
  });

  const float = (speed: number, rotationIntensity: number, floatIntensity: number) =>
    reducedMotion
      ? { speed: 0, rotationIntensity: 0, floatIntensity: 0 }
      : { speed, rotationIntensity, floatIntensity };

  return (
    <group ref={group} position={[0, -1.4, -3]} scale={0.85}>
      <Float {...float(1.2, 0.4, 0.8)}>
        <group position={[4.6, -0.6, 0]} scale={0.85}>
          <Bowl color="#e2413f" />
          {reducedMotion ? null : <Steam count={tier === "high" ? 16 : 8} origin={[0, 0.4, 0]} />}
        </group>
      </Float>
      <Float {...float(1.5, 0.6, 1.1)}>
        <group position={[-4.8, 1.7, -0.6]} rotation={[0, 0.4, 0.1]} scale={0.8}>
          <Burger />
          {reducedMotion ? null : <Steam count={tier === "high" ? 12 : 6} origin={[0, 1.2, 0]} />}
        </group>
      </Float>
      <Float {...float(1.1, 0.5, 1)}>
        <group position={[-4.2, -1.3, -0.4]} rotation={[0, -0.3, -0.08]} scale={0.8}>
          <Cup />
        </group>
      </Float>
    </group>
  );
}

/* ---------------------------------- scene ---------------------------------- */

export default function HeroScene({
  tier = "high" as PerfTier,
  reducedMotion = false,
}: {
  tier?: PerfTier;
  reducedMotion?: boolean;
}) {
  const scroll = useRef(0);
  // Pause the render loop while the tab is hidden so the GPU stays idle.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    const onScroll = () => {
      scroll.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    };
    onScroll();
    onVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      shadows={false}
      dpr={tier === "high" ? [1, 1.5] : [1, 1.15]}
      gl={{ antialias: tier !== "low", powerPreference: "high-performance", alpha: true }}
      style={{ background: "transparent" }}
      camera={{ position: [0, 0.6, 8], fov: 42 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearAlpha(0);
      }}
    >
      <ambientLight intensity={0.35} />
      <spotLight
        position={[6, 8, 6]}
        angle={0.5}
        penumbra={0.8}
        intensity={140}
        color="#d9ff8a"
        
      />
      <pointLight position={[-6, -2, 4]} intensity={60} color="#4fd8e0" />
      <pointLight position={[0, 4, -6]} intensity={40} color="#ff8a5c" />

      {/* The HDR environment is a heavy remote asset — only load it on capable devices. */}
      {tier === "high" ? (
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      ) : null}

      <Suspense fallback={null}>
        <Plate tier={tier} scroll={scroll} reducedMotion={reducedMotion} />
        <Ingredients tier={tier} reducedMotion={reducedMotion} />
        {reducedMotion ? null : (
          <Sparkles
            count={tier === "high" ? 70 : 32}
            scale={[14, 8, 8]}
            size={2.4}
            speed={0.35}
            color="#c8f24a"
            opacity={0.7}
          />
        )}
        {tier === "high" ? (
          <ContactShadows position={[0, -2.2, 0]} opacity={0.45} blur={2} far={6} scale={16} frames={1} />
        ) : null}
      </Suspense>

      <CameraRig scroll={scroll} reducedMotion={reducedMotion} />

      {tier !== "low" ? (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={tier === "high" ? 0.7 : 0.45}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      ) : (
        <></>
      )}
    </Canvas>
  );
}

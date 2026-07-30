import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "motion/react";

type MiniFoodType = "pizza" | "coffee" | "donut" | "taco";

interface MiniFood3DProps {
  type: MiniFoodType;
  label?: string;
  className?: string;
}

export function MiniFood3D({ type, label, className = "" }: MiniFood3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 180;
    const height = container.clientHeight || 180;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 6.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaee, 2.5);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    const accentLight = new THREE.DirectionalLight(0x84cc16, 1.6);
    accentLight.position.set(-4, -4, -2);
    scene.add(accentLight);

    const foodGroup = new THREE.Group();
    scene.add(foodGroup);

    // Materials
    const crustMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const pepMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x6fe3e1, roughness: 0.2, metalness: 0.1 });
    const darkCoffeeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const donutMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const icingMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2 });
    const sprinkleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 });
    const tacoMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const fillMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

    if (type === "pizza") {
      // 3D Pizza Slice
      const sliceGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.25, 32, 1, false, 0, Math.PI / 3);
      const slice = new THREE.Mesh(sliceGeo, cheeseMat);
      slice.rotation.x = Math.PI / 2;

      // Crust Rim
      const crustGeo = new THREE.TorusGeometry(2.0, 0.25, 12, 24, Math.PI / 3);
      const crust = new THREE.Mesh(crustGeo, crustMat);
      crust.position.set(0, 0, 0.12);

      // Pepperoni slices
      for (let i = 0; i < 4; i++) {
        const pepGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16);
        const pep = new THREE.Mesh(pepGeo, pepMat);
        const r = Math.random() * 1.1 + 0.5;
        const a = Math.random() * (Math.PI / 3 - 0.2) + 0.1;
        pep.position.set(r * Math.cos(a), r * Math.sin(a), 0.15);
        pep.rotation.x = Math.PI / 2;
        foodGroup.add(pep);
      }

      foodGroup.add(slice);
      foodGroup.add(crust);
      foodGroup.rotation.x = 0.4;
    } else if (type === "coffee") {
      // 3D Coffee Cup & Steam
      const mugGeo = new THREE.CylinderGeometry(1.4, 1.1, 2.6, 24);
      const mug = new THREE.Mesh(mugGeo, coffeeMat);

      const coffeeTopGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.1, 24);
      const coffeeTop = new THREE.Mesh(coffeeTopGeo, darkCoffeeMat);
      coffeeTop.position.y = 1.25;

      const handleGeo = new THREE.TorusGeometry(0.8, 0.18, 12, 24, Math.PI);
      const handle = new THREE.Mesh(handleGeo, coffeeMat);
      handle.position.set(1.4, 0, 0);
      handle.rotation.z = -Math.PI / 2;

      foodGroup.add(mug);
      foodGroup.add(coffeeTop);
      foodGroup.add(handle);
      foodGroup.rotation.x = 0.3;
    } else if (type === "donut") {
      // 3D Donut & Sprinkles
      const donutGeo = new THREE.TorusGeometry(1.6, 0.75, 20, 36);
      const donut = new THREE.Mesh(donutGeo, donutMat);

      const icingGeo = new THREE.TorusGeometry(1.62, 0.76, 20, 36, Math.PI * 2);
      const icing = new THREE.Mesh(icingGeo, icingMat);
      icing.scale.set(1, 1, 0.5);
      icing.position.z = 0.2;

      for (let i = 0; i < 16; i++) {
        const sprGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8);
        const spr = new THREE.Mesh(sprGeo, sprinkleMat);
        const angle = (Math.PI * 2 * i) / 16;
        spr.position.set(1.6 * Math.cos(angle), 1.6 * Math.sin(angle), 0.55);
        spr.rotation.z = angle;
        foodGroup.add(spr);
      }

      foodGroup.add(donut);
      foodGroup.add(icing);
      foodGroup.rotation.x = 0.5;
    } else {
      // 3D Taco
      const shellGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.4, 24, 1, true, 0, Math.PI);
      const shell = new THREE.Mesh(shellGeo, tacoMat);
      shell.rotation.z = Math.PI / 2;

      const fillGeo = new THREE.BoxGeometry(2.4, 0.8, 1.0);
      const fill = new THREE.Mesh(fillGeo, fillMat);
      fill.position.y = 0.2;

      foodGroup.add(shell);
      foodGroup.add(fill);
      foodGroup.rotation.x = 0.4;
    }

    // Mouse Tracking & Rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      mouseX = normX;
      mouseY = normY;
      targetRotY = normX * 0.8;
      targetRotX = normY * 0.6;
    };

    container.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 180;
      const h = container.clientHeight || 180;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      foodGroup.rotation.x = 0.3 + currentRotX;
      foodGroup.rotation.y = currentRotY + Math.sin(elapsedTime * 1.2) * 0.25;
      foodGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      className={`relative flex size-36 sm:size-40 items-center justify-center cursor-grab active:cursor-grabbing select-none hover-lift ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/15 via-accent/15 to-transparent blur-2xl opacity-70 pointer-events-none" />
      <canvas ref={canvasRef} className="relative z-10 size-full outline-none" />
    </div>
  );
}

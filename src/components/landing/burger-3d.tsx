import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "motion/react";

export function Burger3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // 2. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaee, 2.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa3e635, 1.5); // Canteen green accent glow
    dirLight2.position.set(-5, -4, -2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffb703, 2, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // 3. Burger Mesh Hierarchy Group
    const burgerGroup = new THREE.Group();
    scene.add(burgerGroup);

    // Color Materials
    const bunMat = new THREE.MeshStandardMaterial({
      color: 0xd9822b,
      roughness: 0.45,
      metalness: 0.05,
    });
    const sesameMat = new THREE.MeshStandardMaterial({
      color: 0xfff5e6,
      roughness: 0.3,
    });
    const tomatoMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.2,
      metalness: 0.1,
    });
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      roughness: 0.3,
      metalness: 0.1,
    });
    const pattyMat = new THREE.MeshStandardMaterial({
      color: 0x4a2511,
      roughness: 0.8,
      metalness: 0.05,
    });
    const lettuceMat = new THREE.MeshStandardMaterial({
      color: 0x43a047,
      roughness: 0.5,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    // Layer 1: Top Bun (Rounded Dome)
    const topBunGroup = new THREE.Group();
    const topBunGeo = new THREE.SphereGeometry(1.6, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const topBunMesh = new THREE.Mesh(topBunGeo, bunMat);
    topBunMesh.scale.set(1.05, 0.75, 1.05);
    topBunGroup.add(topBunMesh);

    // Add Sesame seeds to Top Bun
    for (let i = 0; i < 28; i++) {
      const seedGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const seed = new THREE.Mesh(seedGeo, sesameMat);
      seed.scale.set(1, 0.4, 2);

      const phi = Math.random() * Math.PI * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const r = 1.55;

      seed.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.72 + 0.05,
        r * Math.sin(phi) * Math.sin(theta),
      );
      seed.rotation.y = theta;
      seed.rotation.x = phi * 0.5;
      topBunGroup.add(seed);
    }

    topBunGroup.position.y = 1.35;
    burgerGroup.add(topBunGroup);

    // Layer 2: Tomatoes
    const tomatoGroup = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const tomatoGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.1, 24);
      const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
      tomato.position.set(i === 0 ? -0.55 : 0.55, 0, i === 0 ? 0.2 : -0.2);
      tomato.rotation.z = i === 0 ? 0.08 : -0.08;
      tomatoGroup.add(tomato);
    }
    tomatoGroup.position.y = 0.85;
    burgerGroup.add(tomatoGroup);

    // Layer 3: Melted Cheese
    const cheeseGroup = new THREE.Group();
    const cheeseShape = new THREE.BoxGeometry(2.2, 0.06, 2.2);
    const cheese = new THREE.Mesh(cheeseShape, cheeseMat);
    cheese.rotation.y = Math.PI / 4;
    cheeseGroup.add(cheese);
    cheeseGroup.position.y = 0.48;
    burgerGroup.add(cheeseGroup);

    // Layer 4: Grilled Meat Patty
    const pattyGroup = new THREE.Group();
    const pattyGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.45, 32);
    const patty = new THREE.Mesh(pattyGeo, pattyMat);
    pattyGroup.add(patty);
    pattyGroup.position.y = 0.1;
    burgerGroup.add(pattyGroup);

    // Layer 5: Fresh Wavy Lettuce
    const lettuceGroup = new THREE.Group();
    const lettuceGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.06, 16);
    const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
    lettuceGroup.add(lettuce);
    lettuceGroup.position.y = -0.28;
    burgerGroup.add(lettuceGroup);

    // Layer 6: Bottom Bun
    const bottomBunGroup = new THREE.Group();
    const bottomBunGeo = new THREE.CylinderGeometry(1.58, 1.5, 0.38, 32);
    const bottomBun = new THREE.Mesh(bottomBunGeo, bunMat);
    bottomBunGroup.add(bottomBun);
    bottomBunGroup.position.y = -0.65;
    burgerGroup.add(bottomBunGroup);

    // Center burger position
    burgerGroup.position.y = -0.2;

    // 4. Mouse Tracking & Animation Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isHovering = false;
    let explodeProgress = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      mouseX = normX;
      mouseY = normY;
      targetRotY = normX * 0.95;
      targetRotX = normY * 0.75;
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 5. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp Mouse Rotations
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      burgerGroup.rotation.x = currentRotX;
      burgerGroup.rotation.y = currentRotY + Math.sin(elapsedTime * 0.8) * 0.15;
      burgerGroup.position.y = -0.2 + Math.sin(elapsedTime * 2.2) * 0.12;

      // Explode factor on mouse hover
      const targetExplode = isHovering ? 1 : 0;
      explodeProgress += (targetExplode - explodeProgress) * 0.08;

      // Explode layers vertically relative to base positions
      topBunGroup.position.y = 1.35 + explodeProgress * 0.55;
      tomatoGroup.position.y = 0.85 + explodeProgress * 0.35;
      cheeseGroup.position.y = 0.48 + explodeProgress * 0.22;
      pattyGroup.position.y = 0.1;
      lettuceGroup.position.y = -0.28 - explodeProgress * 0.22;
      bottomBunGroup.position.y = -0.65 - explodeProgress * 0.45;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex size-full min-h-[380px] w-full max-w-[420px] items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background ambient lighting halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-accent/20 to-transparent blur-3xl opacity-70 pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="relative z-10 size-full outline-none" />
    </motion.div>
  );
}

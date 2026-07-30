import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 17;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent canvas overlay
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLightLeft = new THREE.PointLight(0x84cc16, 5, 80); // Primary lime glow
    pointLightLeft.position.set(-12, 5, 10);
    scene.add(pointLightLeft);

    const pointLightRight = new THREE.PointLight(0x6fe3e1, 5, 80); // Cyan glow
    pointLightRight.position.set(12, -5, 10);
    scene.add(pointLightRight);

    // 3. Small 3D Food-Related Geometries Perfectly Calibrated on Left & Right Margins
    const marginsGroup = new THREE.Group();

    // --- LEFT SIDE MARGIN (x = -12.5) ---
    // Left Element 1: Small 3D Coffee Mug & Handle
    const leftMugGroup = new THREE.Group();
    const mugBodyGeo = new THREE.CylinderGeometry(1.9, 1.5, 4.0, 20);
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x4d7c0f,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const mugBody = new THREE.Mesh(mugBodyGeo, mugMat);

    const mugHandleGeo = new THREE.TorusGeometry(1.1, 0.25, 10, 20, Math.PI);
    const mugHandle = new THREE.Mesh(mugHandleGeo, mugMat);
    mugHandle.position.set(1.7, 0, 0);
    mugHandle.rotation.z = -Math.PI / 2;

    leftMugGroup.add(mugBody);
    leftMugGroup.add(mugHandle);
    leftMugGroup.position.set(-12.5, 3.8, 0);
    leftMugGroup.rotation.z = Math.PI / 8;
    marginsGroup.add(leftMugGroup);

    // Left Element 2: Small 3D Soda Can / Drink Cylinder
    const drinkGeo = new THREE.CylinderGeometry(1.6, 1.6, 4.4, 20);
    const drinkMat = new THREE.MeshStandardMaterial({
      color: 0x6fe3e1,
      emissive: 0x0e7490,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    const drinkMesh = new THREE.Mesh(drinkGeo, drinkMat);
    drinkMesh.position.set(-13, -5.5, -1);
    drinkMesh.rotation.x = Math.PI / 6;
    marginsGroup.add(drinkMesh);

    // --- RIGHT SIDE MARGIN (x = +12.5) ---
    // Right Element 1: Small 3D Dining Plate Disc
    const rightPlateGeo = new THREE.CylinderGeometry(3.8, 3.8, 0.3, 28);
    const rightPlateMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x3f6212,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const rightPlateMesh = new THREE.Mesh(rightPlateGeo, rightPlateMat);
    rightPlateMesh.position.set(12.5, 4.5, 0);
    rightPlateMesh.rotation.x = Math.PI / 3.5;
    marginsGroup.add(rightPlateMesh);

    // Right Element 2: Small 3D Donut Ring
    const rightDonutGeo = new THREE.TorusGeometry(3.0, 1.1, 14, 28);
    const rightDonutMat = new THREE.MeshStandardMaterial({
      color: 0x6fe3e1,
      emissive: 0x0891b2,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    const rightDonutMesh = new THREE.Mesh(rightDonutGeo, rightDonutMat);
    rightDonutMesh.position.set(13, -5, -1);
    rightDonutMesh.rotation.x = Math.PI / 4;
    marginsGroup.add(rightDonutMesh);

    scene.add(marginsGroup);

    // 4. Mouse Parallax Motion
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 5. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      leftMugGroup.rotation.y += 0.006;
      drinkMesh.rotation.y += 0.007;
      rightPlateMesh.rotation.z += 0.005;
      rightDonutMesh.rotation.x += 0.006;

      marginsGroup.rotation.y += (targetX * 0.3 - marginsGroup.rotation.y) * 0.06;
      marginsGroup.rotation.x += (-targetY * 0.3 - marginsGroup.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none opacity-90"
      aria-hidden
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useLocaleContext } from "@/components/providers/LocaleProvider";

interface Model3DViewerProps {
  models: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

function getModelScale(src: string): number {
  if (src.includes('lilit')) return 4;
  if (src.includes('hero_1') || src.includes('hero.glb')) return 1.5;
  if (src.includes('jack')) return 1.5;
  return 1.5;
}

export function Model3DViewer({ models }: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useLocaleContext();

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1, 4);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights - Enhanced cyberpunk lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main key light (warm white from top-front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light (soft from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Rim/back light for silhouette (cyan - cyberpunk accent)
    const rimLight = new THREE.SpotLight(0x00ffff, 2);
    rimLight.position.set(0, 5, -8);
    rimLight.angle = 0.5;
    rimLight.penumbra = 0.5;
    scene.add(rimLight);

    // Cyan accent light (left side)
    const cyanLight = new THREE.PointLight(0x00ffff, 1.5);
    cyanLight.position.set(-6, 0, 2);
    scene.add(cyanLight);

    // Magenta accent light (right side)
    const magentaLight = new THREE.PointLight(0xff00ff, 1.2);
    magentaLight.position.set(6, 0, 2);
    scene.add(magentaLight);

    // Ground bounce light (subtle warm from below)
    const bounceLight = new THREE.PointLight(0x332211, 0.5);
    bounceLight.position.set(0, -2, 0);
    scene.add(bounceLight);

    // Hemisphere light for natural ambient
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x362a1a, 0.3);
    scene.add(hemiLight);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.2;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load model when activeIndex changes
  useEffect(() => {
    if (!sceneRef.current || !models[activeIndex]) return;

    const scene = sceneRef.current;
    setIsLoading(true);

    // Remove old model
    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelRef.current = null;
    }

    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    // Load new model
    const loader = new GLTFLoader();
    const modelUrl = models[activeIndex].src;
    const scale = getModelScale(modelUrl);

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(scale);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y = -1;

        scene.add(model);
        modelRef.current = model;

        // Setup animations
        if (gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          const idleAnim = gltf.animations.find(a =>
            a.name.toLowerCase().includes('idle') ||
            a.name.toLowerCase().includes('breathing')
          ) || gltf.animations[0];

          if (idleAnim) {
            const action = mixerRef.current.clipAction(idleAnim);
            action.play();
          }
        }

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setIsLoading(false);
      }
    );
  }, [activeIndex, models]);

  if (!models || models.length === 0) return null;

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-display tracking-wide mb-4">
            <span className="text-foreground">3D </span>
            <span className="text-primary">
              {locale === "ro" ? "Modele de personaje" : "Модели персонажей"}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "ro"
              ? "Vizualizare interactiva a modelelor de joc. Folositi mouse-ul pentru a roti si a mari."
              : "Интерактивный просмотр игровых моделей. Используйте мышь для вращения и масштабирования."}
          </p>
        </motion.div>

        {/* Model selector tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 relative z-20">
          {models.map((model, index) => (
            <button
              key={model.src}
              type="button"
              onClick={() => {
                console.log('Switching to model:', index);
                setActiveIndex(index);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative z-20 ${
                activeIndex === index
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border hover:border-primary/50 text-foreground"
              }`}
            >
              {model.caption || `Model ${index + 1}`}
            </button>
          ))}
        </div>

        {/* 3D Canvas Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-square md:aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-card to-background border border-border"
        >
          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none z-0" />

          {/* Three.js container */}
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full z-[1]"
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">
                  {locale === "ro" ? "Se incarca 3D..." : "Загрузка 3D..."}
                </span>
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground z-10 pointer-events-none">
            {locale === "ro"
              ? "Trage pentru a roti | Scroll pentru zoom"
              : "Перетащите для вращения | Прокрутите для масштаба"}
          </div>
        </motion.div>

        {/* Caption */}
        <motion.p
          key={activeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 text-muted-foreground"
        >
          {models[activeIndex]?.caption || ''}
        </motion.p>
      </div>
    </section>
  );
}

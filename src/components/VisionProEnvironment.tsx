'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

type PanelType = 'home' | 'about' | 'experience' | 'skills' | 'contact';

interface PanelState {
  panelLon: number;
  panelLat: number;
  isPinned: boolean;
}

interface VisionProEnvironmentProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

const panelContent: Record<PanelType, { title: string; subtitle?: string; content: string }> = {
  home: {
    title: 'Kevin Sun',
    subtitle: 'Software Engineer',
    content: 'Building elegant solutions to complex problems. Passionate about creating seamless user experiences and pushing the boundaries of what\'s possible on the web.',
  },
  about: {
    title: 'About Me',
    content: 'I\'m a software engineer with a passion for building beautiful, functional applications. With expertise in full-stack development, I love tackling complex challenges and turning ideas into reality.',
  },
  experience: {
    title: 'Experience',
    content: 'Over the years, I\'ve worked with various technologies and teams to deliver impactful solutions. From startups to enterprise, I bring a blend of technical expertise and creative problem-solving.',
  },
  skills: {
    title: 'Skills',
    content: 'TypeScript, React, Next.js, Node.js, Python, Three.js, WebGL, PostgreSQL, MongoDB, AWS, Docker, and more. Always learning and exploring new technologies.',
  },
  contact: {
    title: 'Contact',
    content: 'I\'d love to hear from you! Whether you have a project in mind, a question, or just want to connect, feel free to reach out.',
  },
};

export default function VisionProEnvironment({ activePanel, onPanelChange }: VisionProEnvironmentProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraLon, setCameraLon] = useState(0);
  const [cameraLat, setCameraLat] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>({ panelLon: 0, panelLat: 0, isPinned: true });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedPanel, setDisplayedPanel] = useState<PanelType>(activePanel);
  const [animationState, setAnimationState] = useState<'visible' | 'exiting' | 'entering'>('visible');
  
  const cameraLonRef = useRef(0);
  const cameraLatRef = useRef(0);
  const panelLonRef = useRef(0);
  const panelLatRef = useRef(0);
  const isPinnedRef = useRef(true);

  // Handle panel transitions
  useEffect(() => {
    if (activePanel !== displayedPanel && !isTransitioning) {
      setIsTransitioning(true);
      setAnimationState('exiting');
      
      // Overlap animations - switch content quickly
      setTimeout(() => {
        setDisplayedPanel(activePanel);
        setAnimationState('entering');
        
        // After enter animation, set to visible
        setTimeout(() => {
          setAnimationState('visible');
          setIsTransitioning(false);
        }, 300);
      }, 200);
    }
  }, [activePanel, displayedPanel, isTransitioning]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1100
    );
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.load('/panorama.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const geometry = new THREE.SphereGeometry(500, 128, 64);
      geometry.scale(-1, 1, 1);

      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
    });

    let pointerDown = false;
    let prevX = 0;
    let prevY = 0;
    let lon = 0;
    let lat = 0;
    let targetLon = 0;
    let targetLat = 0;

    const onDown = (e: PointerEvent) => {
      pointerDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const onMove = (e: PointerEvent) => {
      if (!pointerDown) return;
      targetLon -= (e.clientX - prevX) * 0.15;
      targetLat += (e.clientY - prevY) * 0.15;
      targetLat = Math.max(-85, Math.min(85, targetLat));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onUp = () => {
      pointerDown = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    container.style.cursor = 'grab';
    container.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      lon += (targetLon - lon) * 0.05;
      lat += (targetLat - lat) * 0.05;

      cameraLonRef.current = lon;
      cameraLatRef.current = lat;
      setCameraLon(lon);
      setCameraLat(lat);

      if (isPinnedRef.current) {
        panelLonRef.current = lon;
        panelLatRef.current = lat;
        setPanelState(prev => ({ ...prev, panelLon: lon, panelLat: lat }));
      }

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const panelDragStart = useRef<{ startX: number; startY: number; startLon: number; startLat: number } | null>(null);

  const handlePanelPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingPanel(true);
    panelDragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLon: panelLonRef.current,
      startLat: panelLatRef.current,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    if (!isDraggingPanel) return;

    const onMove = (e: PointerEvent) => {
      if (!panelDragStart.current) return;
      const deltaX = e.clientX - panelDragStart.current.startX;
      const deltaY = e.clientY - panelDragStart.current.startY;
      
      // Convert pixel movement to degrees
      // Screen uses: screenX = (angle / 50) * 50 = angle (in percentage of half-screen)
      // So 1% of screen width = 1 degree roughly
      // Window half-width in pixels = window.innerWidth / 2
      // To move 1 pixel, we need: 50 / (window.innerWidth / 2) degrees = 100 / window.innerWidth
      const degPerPixelX = 100 / window.innerWidth;
      const degPerPixelY = 75 / window.innerHeight; // Based on vertical FOV
      
      const newLon = panelDragStart.current.startLon + deltaX * degPerPixelX;
      const newLat = Math.max(-85, Math.min(85, panelDragStart.current.startLat - deltaY * degPerPixelY));
      panelLonRef.current = newLon;
      panelLatRef.current = newLat;
      setPanelState(prev => ({ ...prev, panelLon: newLon, panelLat: newLat }));
    };

    const onUp = () => {
      setIsDraggingPanel(false);
      panelDragStart.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDraggingPanel]);

  const handleTogglePin = useCallback(() => {
    const newPinned = !isPinnedRef.current;
    isPinnedRef.current = newPinned;
    
    if (newPinned) {
      panelLonRef.current = cameraLonRef.current;
      panelLatRef.current = cameraLatRef.current;
      setPanelState({ panelLon: cameraLonRef.current, panelLat: cameraLatRef.current, isPinned: true });
    } else {
      setPanelState(prev => ({ ...prev, isPinned: false }));
    }
  }, []);

  const lonDiff = panelState.panelLon - cameraLon;
  const normalizedLonAngle = ((lonDiff % 360) + 540) % 360 - 180;
  const latDiff = panelState.panelLat - cameraLat;
  
  const panelDistance = 100;
  const fovRad = THREE.MathUtils.degToRad(75);
  const lonAngleRad = THREE.MathUtils.degToRad(normalizedLonAngle);
  
  const panelX = Math.sin(lonAngleRad) * panelDistance;
  const panelZ = Math.cos(lonAngleRad) * panelDistance;
  
  const screenHalfWidth = Math.tan(fovRad / 2) * panelZ;
  const screenX = screenHalfWidth > 0 ? (panelX / screenHalfWidth) * 50 : 0;
  
  const verticalFovRad = fovRad;
  const screenY = panelZ > 0 ? (-latDiff / (verticalFovRad * 180 / Math.PI / 2)) * 50 : 0;
  
  const isVisible = panelZ > 0;

  const currentContent = panelContent[displayedPanel];

  // Animation styles - exiting goes down, entering comes from top
  const getAnimationTransform = () => {
    switch (animationState) {
      case 'exiting':
        return 'translate(-50%, -50%) translateY(100vh)';
      case 'entering':
        return 'translate(-50%, -50%) translateY(-100vh)';
      default:
        return 'translate(-50%, -50%)';
    }
  };

  const getAnimationOpacity = () => {
    return animationState === 'visible' ? 1 : 0;
  };

  const getAnimationTransition = () => {
    if (animationState === 'visible') {
      return 'transform 0.4s cubic-bezier(0, 0, 0.2, 1), opacity 0.3s ease';
    }
    return 'transform 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s ease';
  };

  return (
    <>
      <div
        ref={mountRef}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      />
      
      {isVisible && (
        <div
          className="vp-hero-panel-3d"
          style={{
            position: 'fixed',
            top: `calc(50% + ${screenY}%)`,
            left: `calc(50% + ${screenX}%)`,
            zIndex: 90,
            pointerEvents: 'auto',
            cursor: isDraggingPanel ? 'grabbing' : 'grab',
            transform: getAnimationTransform(),
            opacity: getAnimationOpacity(),
            transition: getAnimationTransition(),
          }}
          onPointerDown={handlePanelPointerDown}
        >
          {/* Pin button */}
          <button
            className="vp-pin-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: `1px solid ${panelState.isPinned ? 'rgba(60,50,40,0.4)' : 'rgba(60,50,40,0.15)'}`,
              background: panelState.isPinned ? 'rgba(60,50,40,0.1)' : 'rgba(60,50,40,0.05)',
              color: panelState.isPinned ? 'rgba(60,50,40,0.9)' : 'rgba(60,50,40,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            title={panelState.isPinned ? 'Unpin window' : 'Pin to view'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {panelState.isPinned ? (
                <>
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                </>
              ) : (
                <>
                  <line x1="2" y1="2" x2="22" y2="22" />
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1" />
                </>
              )}
            </svg>
          </button>

          {/* Panel content */}
          <div className="vp-panel-content">
            <h1 className="vp-name">{currentContent.title}</h1>
            {currentContent.subtitle && (
              <p className="vp-title">{currentContent.subtitle}</p>
            )}
            <div className="vp-divider" />
            <p className="vp-description">{currentContent.content}</p>
          </div>
        </div>
      )}
    </>
  );
}

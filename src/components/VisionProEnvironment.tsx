'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

type PanelType = 'home' | 'about' | 'experience' | 'fun';

interface PanelState {
  panelLon: number;
  panelLat: number;
  isPinned: boolean;
}

interface VisionProEnvironmentProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

interface ExperienceItem {
  company: string;
  date: string;
  position: string;
  bullet: string;
  subItems?: {
    title: string;
    bullet: string;
  }[];
}

const experienceData: ExperienceItem[] = [
  {
    company: 'BCG X',
    date: 'Sep 2025 - Present',
    position: 'Forward Deployed AI Engineer',
    bullet: 'Build and deploy production-grade full-stack applications and cloud infrastructure for Fortune 500 clients, specializing in GenAI systems, data pipelines, and AWS/Azure environments.',
    subItems: [
      {
        title: 'Federal Government Client',
        bullet: 'Architected cloud infrastructure and data platforms for a secure multitenant federal system in AWS GovCloud, enabling tenant-isolated data access, role-based authorization, document storage systems, automated schema evolution, and CI/CD pipelines to build, test, and deploy application and infrastructure services.',
      },
      {
        title: 'Ski Resort Operations Client',
        bullet: 'Built full-stack workforce planning platform in 5 weeks enabling resort operators to manage organizational hierarchies, schedule teams, allocate labor across tasks, and visualize demand vs. staffing on an interactive map.'
      },
      {
        title: 'Grocery Retail Client (Summer 2024 Internship)',
        bullet: 'Built a GenAI alerting system using OpenAI and LangChain that analyzed store performance data and generated automated emails with prioritized actions for business leaders, contributing to hundreds of millions in revenue impact.',
      },
    ],
  },
  {
    company: 'Blue Origin',
    date: 'May - Aug 2023',
    position: 'Software Engineer Intern, Guidance & Control',
    bullet: 'Built a metrics collection system and dashboards for New Glenn guidance and control unit tests and revamped CI pipelines to reduce false failures and improve execution speed.'
  },
  {
    company: 'University of Michigan Aerospace Engineering -- LATTICE Group',
    date: 'Dec 2022 - Jan 2024',
    position: 'Researcher',
    bullet: 'Built data pipelines aggregating weather, flight traffic, population, and historical launch data to solve a facility location optimization problem identifying optimal sites for future U.S. spaceport development.'
  },
  {
    company: 'Collins Aerospace',
    date: 'May - Aug 2022',
    position: 'Software Engineer Intern',
    bullet: 'Developed data pipelines and internal tools to streameline hardware QA workflows and speed up large-scale analysis of testing data.',
  },
];

const educationData = {
  school: 'University of Michigan - Ann Arbor',
  date: 'Aug 2020 - Apr 2025',
  degrees: [
    { degree: 'M.S.E. in Computer Science', gpa: '4.0/4.0' },
    { degree: 'B.S.E. in Computer Science & Aerospace Engineering', gpa: '4.0/4.0' },
  ],
};

interface FunProjectItem {
  text: string;
  image?: string;
  imagePosition?: string;
  bullets?: { text: string; link?: string }[];
}

const funProjectsData: FunProjectItem[] = [
  {
    text: 'Dabbled in content creation — started @itskev.dev on Instagram and TikTok to share short-form videos about tech, news, and life.',
    image: '/content.webp',
    imagePosition: 'center 63%',
  },
  {
    text: 'Helped launch and grow the Midwest Venture Conference, the region\'s first student-run venture event. Connected emerging Midwest startups with leading VCs including Bessemer Venture Partners and Insight Partners. Alumni startups have gone on to join YC (Synnax Labs S24, Movley S23) and raise millions in seed funding (Swish Bx, Hubly Surgical).',
    image: '/mvc.webp',
    imagePosition: '47% center',
  },
  {
    text: 'Built a 3U CubeSat with a Raspberry Pi, camera, and sensors (magnetometer, GPS, IMU, temperature). Launched it on a weather balloon to ~90,000 feet to measure atmospheric magnetic field strength.',
    image: '/cubesat.webp',
  },
  {
    text: 'Published two research papers on identifying optimal future U.S. spaceport locations using facility location optimization.',
    image: '/research.webp',
    imagePosition: 'left center',
    bullets: [
      { text: 'Spaceport Facility Location Planning within the US National Airspace System', link: 'https://arxiv.org/abs/2402.11389' },
      { text: 'Natural Disaster-Resilient Spaceport Network Planning', link: 'https://arc.aiaa.org/doi/10.2514/6.2024-4930' },
    ],
  },
  {
    text: 'Led the Aerodynamics Division for the University of Michigan Solar Car Team. Improved analysis workflows, validated CFD models through wind tunnel testing, and contributed to the CAD design of the 2022 vehicle, Aevum.',
    image: '/solar-car.webp',
  },
];

const panelContent: Record<PanelType, { title: string; subtitle?: string; content: string }> = {
  home: {
    title: 'Kevin Sun',
    subtitle: 'Welcome to my virtual world!',
    content: 
      'I\'m currently a software engineer at BCG X in New York City (official title: Forward Deployed AI Engineer). ' + 
      'I enjoy designing and building reliable, scalable systems that solve real-world problems — and simple tools ' + 
      'that make my own life easier. Feel free to poke around and explore my virtual world!'
  },
  about: {
    title: 'About Me',
    content: 
      'Hello! I\'m Kevin, a software engineer based in New York City. As a Forward Deployed AI Engineer ' +
      'at BCG X, I build integrated, end-to-end solutions that maximize impact at scale, helping clients ' +
      'transform their organizations through technology and AI. I\'m passionate about partnering closely ' +
      'with clients to understand the root of their challenges and deliver highly tailored solutions.\n\n' +
      'My recent projects include an application for resort companies to track organizational hierarchy and ' +
      'labor hour allocation across business units and a large-scale modernization effort rebuilding a ' +
      'document management and workflow platform for a federal administrative agency.\n\n' +
      'In college, I studied both computer science and aerospace engineering, which sparked my ' +
      'interest in space technologies. I love following the latest developments in rockets and satellites, ' +
      'and I\'m especially interested in the intersection of aerospace and software, like in-flight software and ' +
      'aerospace infrastructure/operations SaaS.',
  },
  experience: {
    title: 'Experience & Education',
    content: '',
  },
  fun: {
    title: 'Fun & Projects',
    subtitle: 'some other interesting stuff I\'ve worked on',
    content: '',
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
  const [isLoading, setIsLoading] = useState(true);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const contactWidgetRef = useRef<HTMLDivElement>(null);
  const textureLoadedRef = useRef(false);
  const minTimePassedRef = useRef(false);
  
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

  // Close contact widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactWidgetRef.current && !contactWidgetRef.current.contains(e.target as Node)) {
        setIsContactExpanded(false);
      }
    };

    if (isContactExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isContactExpanded]);

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

    const checkLoadingComplete = () => {
      if (textureLoadedRef.current && minTimePassedRef.current) {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      minTimePassedRef.current = true;
      checkLoadingComplete();
    }, 750);

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
      
      textureLoadedRef.current = true;
      checkLoadingComplete();
    });

    let pointerDown = false;
    let prevX = 0;
    let prevY = 0;
    let lon = 60;
    let lat = 0;
    let targetLon = 60;
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
      {/* Loading Screen */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? 'auto' : 'none',
          transition: 'opacity 0.6s ease-out',
        }}
      >
        {/* Loading text */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: 400,
            color: '#333',
            margin: 0,
          }}
        >
          loading Kevin&apos;s world!
        </p>
        
        {/* Five dots loader */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#333',
                animation: 'dotPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        
        <style>{`
          @keyframes dotPulse {
            0%, 60%, 100% { 
              opacity: 0.2;
              transform: scale(0.8);
            }
            30% { 
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>

      <div
        ref={mountRef}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      />
      
      {!isLoading && isVisible && (
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
          <div 
            className="vp-panel-content" 
            style={displayedPanel === 'experience' ? { 
              maxHeight: '60vh', 
              overflowY: 'auto',
              paddingRight: '24px',
              marginRight: '-24px',
              marginTop: '8px',
            } : {}}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <h1 className="vp-name" style={{ margin: 0 }}>{currentContent.title}</h1>
              {displayedPanel === 'about' && (
                <img 
                  src="/avatar.jpg" 
                  alt="Kevin Sun"
                  style={{
                    width: '112px',
                    height: '112px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            {currentContent.subtitle && (
              <p className="vp-title">{currentContent.subtitle}</p>
            )}
            {displayedPanel !== 'experience' && displayedPanel !== 'fun' && <div className="vp-divider" />}
            
            {displayedPanel === 'fun' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '32px',
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}>
                {funProjectsData.map((project, idx) => {
                  const isImageLeft = idx % 2 === 1;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: isImageLeft ? 'row-reverse' : 'row',
                        gap: '24px',
                        alignItems: project.bullets ? 'flex-start' : 'center',
                        minHeight: '120px',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: 0,
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: 'rgba(60,50,40,0.8)',
                        }}>
                          {project.text}
                        </p>
                        {project.bullets && (
                          <ul style={{
                            margin: '8px 0 0 0',
                            paddingLeft: '20px',
                            listStyle: 'disc',
                          }}>
                            {project.bullets.map((bullet, bulletIdx) => (
                              <li key={bulletIdx} style={{
                                fontSize: '15px',
                                lineHeight: '1.5',
                                color: 'rgba(60,50,40,0.7)',
                                marginBottom: '4px',
                              }}>
                                {bullet.link ? (
                                  <a 
                                    href={bullet.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                      color: 'rgba(60,50,40,0.8)',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    {bullet.text}
                                  </a>
                                ) : (
                                  bullet.text
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div style={{
                        width: '160px',
                        height: '120px',
                        borderRadius: '12px',
                        background: 'rgba(60,50,40,0.08)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt="Project"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: project.imagePosition || 'center',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<span style="color: rgba(60,50,40,0.4); font-size: 14px;">Image</span>';
                            }}
                          />
                        ) : (
                          <span style={{ color: 'rgba(60,50,40,0.4)', fontSize: '14px' }}>Image</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : displayedPanel === 'experience' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Experience Section */}
                <div style={{ marginTop: '8px' }}>
                  <h2 style={{
                    margin: '0 0 16px 0',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'rgba(60,50,40,0.5)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Experience
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {experienceData.map((exp, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {/* Header row: Company + Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'rgba(60,50,40,0.95)',
                            letterSpacing: '-0.01em',
                          }}>
                            {exp.company}
                          </h3>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: 'rgba(60,50,40,0.5)',
                            whiteSpace: 'nowrap',
                          }}>
                            {exp.date}
                          </span>
                        </div>
                        
                        {/* Subheader: Position */}
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          fontStyle: 'italic',
                          color: 'rgba(60,50,40,0.7)',
                        }}>
                          {exp.position}
                        </span>
                        
                        {/* Main description */}
                        <p style={{
                          margin: 0,
                          marginTop: '2px',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: 'rgba(60,50,40,0.75)',
                        }}>
                          {exp.bullet}
                        </p>
                        
                        {/* Sub-items for BCG X */}
                        {exp.subItems && (
                          <div style={{ 
                            marginTop: '24px', 
                            marginLeft: '10px',
                            paddingLeft: '12px',
                            borderLeft: '2px solid rgba(60,50,40,0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                          }}>
                            {exp.subItems.map((sub, subIdx) => (
                              <div key={subIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <h4 style={{
                                  margin: 0,
                                  fontSize: '16px',
                                  fontWeight: 600,
                                  fontStyle: 'italic',
                                  color: 'rgba(60,50,40,0.8)',
                                }}>
                                  {sub.title}
                                </h4>
                                <p style={{
                                  margin: 0,
                                  fontSize: '16px',
                                  lineHeight: '1.6',
                                  color: 'rgba(60,50,40,0.65)',
                                }}>
                                  {sub.bullet}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  marginTop: '12px',
                  height: '1px',
                  background: 'rgba(60,50,40,0.08)',
                }} />

                {/* Education Section */}
                <div style={{ marginTop: '8px' }}>
                  <h2 style={{
                    margin: '0 0 16px 0',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'rgba(60,50,40,0.5)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Education
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Header row: School + Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'rgba(60,50,40,0.95)',
                        letterSpacing: '-0.01em',
                      }}>
                        {educationData.school}
                      </h3>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'rgba(60,50,40,0.5)',
                        whiteSpace: 'nowrap',
                      }}>
                        {educationData.date}
                      </span>
                    </div>
                    
                    {/* Degrees */}
                    {educationData.degrees.map((deg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'rgba(60,50,40,0.7)',
                        }}>
                          {deg.degree}
                        </span>
                        {deg.gpa && (
                          <span style={{
                            fontSize: '16px',
                            color: 'rgba(60,50,40,0.5)',
                            whiteSpace: 'nowrap',
                          }}>
                            GPA: {deg.gpa}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="vp-description" style={{ whiteSpace: 'pre-line' }}>{currentContent.content}</p>
            )}
          </div>
        </div>
      )}

      {/* Contact Widget */}
      {!isLoading && (
        <div
          ref={contactWidgetRef}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => setIsContactExpanded(!isContactExpanded)}
        >
          {/* Speech bubble */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '18px',
              padding: isContactExpanded ? '20px' : '12px 18px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              maxWidth: isContactExpanded ? '260px' : '170px',
              transition: 'all 0.3s ease, box-shadow 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => !isContactExpanded && (e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)')}
            onMouseLeave={(e) => !isContactExpanded && (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)')}
          >
            <p
              style={{
                margin: 0,
                fontSize: isContactExpanded ? '15px' : '15px',
                color: '#333',
                lineHeight: 1.5,
              }}
            >
              {isContactExpanded 
                ? "Let's connect! Add me on socials or shoot me an email!"
                : "Want to reach me?"
              }
            </p>
            
            {/* Social links */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                marginTop: isContactExpanded ? '18px' : '0',
                maxHeight: isContactExpanded ? '40px' : '0',
                opacity: isContactExpanded ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Instagram */}
              <a
                href="https://instagram.com/itskev.dev"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#E4405F', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* Twitter/X */}
              <a
                href="https://twitter.com/a_kevin_sun"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#000', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/krsun/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#0A66C2', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              {/* GitHub */}
              <a
                href="https://github.com/ksun52"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#333', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              {/* Email */}
              <a
                href="mailto:ksun52.99@gmail.com"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#EA4335', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              </a>
            </div>
            
            {/* Speech bubble tail */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '-8px',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '8px solid rgba(255, 255, 255, 0.95)',
              }}
            />
          </div>
          
          {/* Person icon / Avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            }}
          >
            <img 
              src="/avatar.jpg" 
              alt="Kevin Sun"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

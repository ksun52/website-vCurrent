'use client';

import { useState } from 'react';
import GlowingFrame from '@/components/GlowingFrame';
import VisionProEnvironment from '@/components/VisionProEnvironment';
import StyleSelector from '@/components/StyleSelector';
import Navigation from '@/components/Navigation';

const TOTAL_STYLES = 2;

type PanelType = 'home' | 'about' | 'experience' | 'skills' | 'contact';

const navItems: { label: string; panel: PanelType }[] = [
  { label: 'Home', panel: 'home' },
  { label: 'About', panel: 'about' },
  { label: 'Experience', panel: 'experience' },
  { label: 'Skills', panel: 'skills' },
  { label: 'Contact', panel: 'contact' },
];

export default function Home() {
  const [currentStyle, setCurrentStyle] = useState(0);
  const [activePanel, setActivePanel] = useState<PanelType>('home');

  return (
    <div className="min-h-screen">
      {/* ====== Style 1: Glowing Frame ====== */}
      {currentStyle === 0 && (
        <div className="style-glowing-frame min-h-screen bg-[#050505]">
          <Navigation />
          <GlowingFrame />
          <main className="main-content">
            <div className="hero-section">
              <h1 className="hero-name">Kevin Sun</h1>
              <p className="hero-title">Software Engineer</p>
              <p className="hero-description">
                Building elegant solutions to complex problems.
                Passionate about creating seamless user experiences
                and pushing the boundaries of what&apos;s possible on the web.
              </p>
            </div>
          </main>
        </div>
      )}

      {/* ====== Style 2: Vision Pro ====== */}
      {currentStyle === 1 && (
        <div className="style-vision-pro">
          <VisionProEnvironment 
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />

          {/* Floating nav bar */}
          <nav className="vp-nav">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActivePanel(item.panel)}
                className={`vp-nav-link ${activePanel === item.panel ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Style Selector (always visible) */}
      <StyleSelector
        currentStyle={currentStyle}
        onStyleChange={setCurrentStyle}
        totalStyles={TOTAL_STYLES}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import VisionProEnvironment from '@/components/VisionProEnvironment';

type PanelType = 'home' | 'about' | 'experience' | 'skills' | 'contact';

const navItems: { label: string; panel: PanelType }[] = [
  { label: 'Home', panel: 'home' },
  { label: 'About', panel: 'about' },
  { label: 'Experience', panel: 'experience' },
  { label: 'Skills', panel: 'skills' },
  { label: 'Contact', panel: 'contact' },
];

export default function Home() {
  const [activePanel, setActivePanel] = useState<PanelType>('home');

  return (
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
  );
}

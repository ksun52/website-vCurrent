'use client';

interface StyleSelectorProps {
  currentStyle: number;
  onStyleChange: (style: number) => void;
  totalStyles: number;
}

export default function StyleSelector({ 
  currentStyle, 
  onStyleChange, 
  totalStyles 
}: StyleSelectorProps) {
  return (
    <div className="style-selector">
      {Array.from({ length: totalStyles }, (_, i) => (
        <button
          key={i}
          className={`style-btn ${currentStyle === i ? 'active' : ''}`}
          onClick={() => onStyleChange(i)}
          title={`Style ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

import React, { useEffect, useState } from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  className?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isActive, 
  className = "" 
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setBars([]);
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => {
        const newBars = prev.map(() => Math.random() * 100);
        if (newBars.length < 5) {
          newBars.push(Math.random() * 100);
        }
        return newBars.slice(-5);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`flex items-end space-x-1 h-6 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-blue-500 rounded-full transition-all duration-150 ease-out"
          style={{
            height: `${height}%`,
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  );
};

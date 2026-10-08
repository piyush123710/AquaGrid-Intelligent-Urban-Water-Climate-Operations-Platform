import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  aiConfidence?: number;
  heightClass?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'BEFORE REPAIR (Active Leak)',
  afterLabel = 'AFTER REPAIR (Clamp Installed)',
  aiConfidence = 94,
  heightClass = 'h-72',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <SplitSquareVertical className="h-4 w-4 text-cyan-400" />
          <span>Interactive Before vs. After Visual Comparison</span>
        </div>
        {aiConfidence && (
          <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-700/60">
            <Sparkles className="h-3 w-3" />
            <span>AI Verified: {aiConfidence}% Confidence</span>
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => (isDragging.current = true)}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className={`relative w-full ${heightClass} select-none overflow-hidden rounded-xl border border-slate-800 bg-slate-950 cursor-ew-resize shadow-2xl`}
      >
        {/* AFTER Image (Full background) */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* BEFORE Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 h-full w-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-cyan-500 text-slate-950 shadow-xl">
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" transform="rotate(180 12 12)" />
              <path d="M15.41 16.59L19.99 12 15.41 7.41 16.82 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </div>
        </div>

        {/* Badges in Corners */}
        <div className="absolute top-3 left-3 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-rose-300 border border-rose-500/40 backdrop-blur-xs">
          🔴 {beforeLabel}
        </div>
        <div className="absolute top-3 right-3 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 backdrop-blur-xs">
          🟢 {afterLabel}
        </div>

        {/* Hint text bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/80 px-3 py-0.5 text-[10px] font-medium text-slate-400 backdrop-blur-xs">
          Drag slider left or right to compare
        </div>
      </div>
    </div>
  );
};

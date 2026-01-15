'use client';

import type { AngleType } from '@/lib/types';

export interface AngleCell {
  url: string;
  angle: AngleType;
  label: string;
}

export interface GridFourProps {
  cells: AngleCell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLoading: boolean;
}

// Angle labels mapping
const ANGLE_LABELS: Record<AngleType, string> = {
  wide: '远景',
  medium: '中景',
  close: '近景',
  extreme: '特写',
};

// Default angle order for the 2x2 grid
const DEFAULT_ANGLES: AngleType[] = ['wide', 'medium', 'close', 'extreme'];

export function GridFour({
  cells,
  selectedIndex,
  onSelect,
  isLoading,
}: GridFourProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full aspect-square max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4">
        <svg
          className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-500 mb-3 sm:mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium text-center">
          正在生成多角度视图...
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1 text-center">
          这可能需要一些时间，请耐心等待
        </p>
      </div>
    );
  }

  // Empty state - no cells yet
  if (cells.length === 0) {
    return (
      <div className="w-full aspect-square max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium mb-2 text-center">
          暂无多角度视图
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center px-2">
          请先在九宫格中选择一个分镜，系统将自动生成多角度视图
        </p>
      </div>
    );
  }

  // Grid display with cells
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          多角度视图
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          选择角度进行高清重绘
        </span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        {cells.map((cell, index) => {
          const angleLabel = cell.label || ANGLE_LABELS[cell.angle] || DEFAULT_ANGLES[index];
          
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`
                relative aspect-square rounded-md sm:rounded-lg overflow-hidden
                transition-all duration-200 focus:outline-none touch-manipulation
                ${selectedIndex === index
                  ? 'ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 scale-[1.02]'
                  : 'hover:ring-2 hover:ring-blue-300 hover:scale-[1.01] active:scale-[0.98]'
                }
              `}
              aria-label={`${angleLabel}视图`}
              aria-pressed={selectedIndex === index}
            >
              {/* Cell Image */}
              <img
                src={cell.url}
                alt={`${angleLabel}视图`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Angle Label Badge */}
              <div
                className={`
                  absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md
                  text-[10px] sm:text-xs font-bold backdrop-blur-sm
                  ${selectedIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-black/60 text-white'
                  }
                `}
              >
                {angleLabel}
              </div>

              {/* Selected Indicator */}
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none">
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection hint */}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 text-center">
        {selectedIndex !== null
          ? `已选择${cells[selectedIndex]?.label || ANGLE_LABELS[cells[selectedIndex]?.angle]}，将进行高清重绘`
          : '点击选择一个角度，进行高清重绘'
        }
      </p>
    </div>
  );
}

export default GridFour;

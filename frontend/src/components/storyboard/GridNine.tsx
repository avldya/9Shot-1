'use client';

export interface GridNineProps {
  imageUrl: string | null;
  cells: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLoading: boolean;
  onGenerate?: () => void;
  canGenerate?: boolean;
}

export function GridNine({
  imageUrl,
  cells,
  selectedIndex,
  onSelect,
  isLoading,
  onGenerate,
  canGenerate = false,
}: GridNineProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full aspect-square max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4">
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
          正在生成分镜...
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1 text-center">
          这可能需要一些时间，请耐心等待
        </p>
      </div>
    );
  }

  // Empty state - no image generated yet
  if (!imageUrl && cells.length === 0) {
    return (
      <div className="w-full aspect-square max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
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
          暂无分镜
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mb-4 text-center px-2">
          输入剧本并添加角色后，点击下方按钮生成分镜
        </p>
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`
              px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200
              flex items-center gap-2 text-sm sm:text-base touch-manipulation
              ${canGenerate
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] active:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            生成九宫格分镜
          </button>
        )}
      </div>
    );
  }

  // Grid display with cells
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header with regenerate button */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          九宫格分镜
        </h3>
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
              flex items-center gap-1.5 sm:gap-2 touch-manipulation
              ${canGenerate
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden xs:inline">重新生成</span>
            <span className="xs:hidden">重新</span>
          </button>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
        {cells.map((cellUrl, index) => (
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
            aria-label={`分镜 ${index + 1}`}
            aria-pressed={selectedIndex === index}
          >
            {/* Cell Image */}
            <img
              src={cellUrl}
              alt={`分镜 ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Cell Index Badge */}
            <div
              className={`
                absolute top-1 left-1 sm:top-2 sm:left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full
                flex items-center justify-center text-[10px] sm:text-xs font-bold
                ${selectedIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-black/50 text-white'
                }
              `}
            >
              {index + 1}
            </div>

            {/* Selected Indicator */}
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Selection hint */}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 text-center">
        {selectedIndex !== null
          ? `已选择分镜 ${selectedIndex + 1}，将自动生成多角度视图`
          : '点击选择一个分镜，查看多角度视图'
        }
      </p>
    </div>
  );
}

export default GridNine;

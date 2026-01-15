'use client';

import { useState, useCallback } from 'react';
import type { AngleType } from '@/lib/types';

export interface HDPreviewProps {
  imageUrl: string | null;
  angle: AngleType | null;
  isLoading: boolean;
  onSaveToLibrary?: (imageUrl: string, angle: AngleType) => void;
  onDownload?: (imageUrl: string, angle: AngleType) => void;
}

// Angle labels mapping
const ANGLE_LABELS: Record<AngleType, string> = {
  wide: '远景',
  medium: '中景',
  close: '近景',
  extreme: '特写',
};

export function HDPreview({
  imageUrl,
  angle,
  isLoading,
  onSaveToLibrary,
  onDownload,
}: HDPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!imageUrl || !angle) return;

    setIsDownloading(true);
    try {
      // If external handler provided, use it
      if (onDownload) {
        onDownload(imageUrl, angle);
        return;
      }

      // Default download behavior
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `storyboard-hd-${angle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  }, [imageUrl, angle, onDownload]);

  // Handle save to library
  const handleSaveToLibrary = useCallback(async () => {
    if (!imageUrl || !angle || !onSaveToLibrary) return;

    setIsSaving(true);
    try {
      onSaveToLibrary(imageUrl, angle);
    } finally {
      setIsSaving(false);
    }
  }, [imageUrl, angle, onSaveToLibrary]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-16 h-16 animate-spin text-blue-500 mb-4"
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
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            正在进行高清重绘...
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            AI 正在优化画面细节，请耐心等待
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no HD image yet
  if (!imageUrl) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
            暂无高清重绘结果
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center px-4">
            请先在四宫格中选择一个角度，系统将自动进行高清重绘
          </p>
        </div>
      </div>
    );
  }

  // Display HD image with actions
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            高清重绘结果
          </h3>
          {angle && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {ANGLE_LABELS[angle]}视图
            </span>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-gray-200 dark:bg-gray-700 
              text-gray-700 dark:text-gray-200
              hover:bg-gray-300 dark:hover:bg-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              text-sm font-medium
            "
            aria-label="下载高清图像"
          >
            {isDownloading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            下载
          </button>

          {/* Save to library button */}
          {onSaveToLibrary && (
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded-lg
                bg-blue-500 hover:bg-blue-600
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                text-sm font-medium
              "
              aria-label="保存到素材库"
            >
              {isSaving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              保存到素材库
            </button>
          )}
        </div>
      </div>

      {/* HD Image display */}
      <div className="relative rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <img
          src={imageUrl}
          alt={`高清重绘 - ${angle ? ANGLE_LABELS[angle] : ''}视图`}
          className="w-full h-auto object-contain"
        />
        
        {/* Angle badge */}
        {angle && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-bold shadow-lg">
            {ANGLE_LABELS[angle]} · HD
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>高清重绘完成</span>
        <span>点击下载或保存到素材库</span>
      </div>
    </div>
  );
}

export default HDPreview;

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Asset } from '@/lib/types';

interface AssetCardProps {
  asset: Asset;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssetCard({ asset, onView, onEdit, onDelete }: AssetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sourceTypeLabels: Record<string, string> = {
    grid9: '九宫格',
    grid4: '四宫格',
    hd: '高清',
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Image */}
      <div
        className="aspect-square relative cursor-pointer"
        onClick={onView}
      >
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <Image
            src={asset.thumbnailUrl || asset.imageUrl}
            alt="素材图片"
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Source type badge */}
        {asset.sourceType && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs bg-black/50 text-white rounded">
            {sourceTypeLabels[asset.sourceType] || asset.sourceType}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{asset.categoryName}</span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onView();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-xs text-gray-400">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Asset } from '@/lib/types';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  assets: Asset[];
  isLoading?: boolean;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetGrid({
  assets,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: AssetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
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
        <p className="text-lg font-medium">暂无素材</p>
        <p className="text-sm mt-1">保存分镜图到素材库后会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onView={() => onView(asset)}
          onEdit={() => onEdit(asset)}
          onDelete={() => onDelete(asset)}
        />
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Asset } from '@/lib/types';

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssetDetailModal({
  asset,
  onClose,
  onEdit,
  onDelete,
}: AssetDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  const sourceTypeLabels: Record<string, string> = {
    grid9: '九宫格分镜',
    grid4: '四宫格多角度',
    hd: '高清重绘',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `asset-${asset.id}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">素材详情</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-300"
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
                  src={asset.imageUrl}
                  alt="素材图片"
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">分类</label>
                <p className="text-gray-900 font-medium">{asset.categoryName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">来源类型</label>
                <p className="text-gray-900">
                  {sourceTypeLabels[asset.sourceType] || asset.sourceType}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">创建时间</label>
                <p className="text-gray-900">{formatDate(asset.createdAt)}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-2 block">标签</label>
                {asset.tags && asset.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">暂无标签</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">素材 ID</label>
                <p className="text-gray-500 text-xs font-mono">{asset.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            删除素材
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              下载图片
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              编辑素材
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

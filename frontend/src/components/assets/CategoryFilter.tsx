'use client';

import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  isLoading?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  isLoading = false,
}: CategoryFilterProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">分类筛选</h3>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 bg-gray-100 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">分类筛选</h3>
      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === null
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部素材
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
              selectedCategory === category.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{category.name}</span>
            {category.assetCount !== undefined && (
              <span className="text-xs text-gray-400">
                {category.assetCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

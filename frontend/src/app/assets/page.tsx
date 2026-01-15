'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Asset, Category } from '@/lib/types';
import { assetApi, categoryApi } from '@/lib/api';
import {
  AssetGrid,
  CategoryFilter,
  TagSearch,
  AssetDetailModal,
  AssetEditModal,
} from '@/components/assets';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal states
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      const response = await categoryApi.list();
      if (response.data) {
        setCategories(response.data);
      }
      setIsCategoriesLoading(false);
    };
    loadCategories();
  }, []);

  // Load assets - using a ref to track if filters changed to reset page
  const loadAssets = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    const response = await assetApi.list({
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: currentPage,
      size: pageSize,
    });
    if (response.data) {
      setAssets(response.data.assets || []);
      setTotal(response.data.total || 0);
    } else if (response.error) {
      setError(response.error.message);
    }
    setIsLoading(false);
  }, [selectedCategory, selectedTags]);

  // Load assets when page changes
  useEffect(() => {
    loadAssets(page);
  }, [page, loadAssets]);

  // Reset page when filters change - use a separate effect that doesn't call setState directly
  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  // Track filter changes
  useEffect(() => {
    // Only reset page if not already on page 1
    if (page !== 1) {
      handleFilterChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTags]);

  // Handlers
  const handleView = (asset: Asset) => {
    setViewingAsset(asset);
  };

  const handleEdit = (asset: Asset) => {
    setViewingAsset(null);
    setEditingAsset(asset);
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm('确定要删除这个素材吗？此操作不可撤销。')) {
      return;
    }
    const response = await assetApi.delete(asset.id);
    if (response.error) {
      alert(response.error.message);
    } else {
      setViewingAsset(null);
      setEditingAsset(null);
      loadAssets(page);
      // Reload categories to update counts
      const catResponse = await categoryApi.list();
      if (catResponse.data) {
        setCategories(catResponse.data);
      }
    }
  };

  const handleSaveEdit = async (data: { categoryId: string; tags: string[] }) => {
    if (!editingAsset) return;
    setIsSaving(true);
    const response = await assetApi.update(editingAsset.id, data);
    if (response.error) {
      alert(response.error.message);
    } else {
      setEditingAsset(null);
      loadAssets(page);
      // Reload categories to update counts
      const catResponse = await categoryApi.list();
      if (catResponse.data) {
        setCategories(catResponse.data);
      }
    }
    setIsSaving(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">素材库</h1>
            </div>
            <div className="text-sm text-gray-500">
              共 {total} 个素材
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              isLoading={isCategoriesLoading}
            />
            <TagSearch
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </aside>

          {/* Content */}
          <main className="flex-1">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <AssetGrid
              assets={assets}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {viewingAsset && (
        <AssetDetailModal
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
          onEdit={() => handleEdit(viewingAsset)}
          onDelete={() => handleDelete(viewingAsset)}
        />
      )}

      {editingAsset && (
        <AssetEditModal
          asset={editingAsset}
          categories={categories}
          onClose={() => setEditingAsset(null)}
          onSave={handleSaveEdit}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

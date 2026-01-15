'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import Image from 'next/image';
import { Category } from '@/lib/types';
import { categoryApi } from '@/lib/api';

interface SaveToLibraryModalProps {
  imageUrl: string;
  sourceType: 'grid9' | 'grid4' | 'hd';
  onClose: () => void;
  onSave: (data: {
    categoryId: string;
    tags: string[];
    imageUrl: string;
    sourceType: string;
  }) => void;
  isSaving?: boolean;
}

export function SaveToLibraryModal({
  imageUrl,
  sourceType,
  onClose,
  onSave,
  isSaving = false,
}: SaveToLibraryModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      const response = await categoryApi.list();
      if (response.data) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      } else if (response.error) {
        setError(response.error.message);
      }
      setIsLoadingCategories(false);
    };
    loadCategories();
  }, []);

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const response = await categoryApi.create({ name: newCategoryName.trim() });
    if (response.data) {
      setCategories([...categories, response.data]);
      setCategoryId(response.data.id);
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } else if (response.error) {
      setError(response.error.message);
    }
  };

  const handleSave = () => {
    if (!categoryId) {
      setError('请选择或创建一个分类');
      return;
    }
    onSave({
      categoryId,
      tags,
      imageUrl,
      sourceType,
    });
  };

  const sourceTypeLabels: Record<string, string> = {
    grid9: '九宫格分镜',
    grid4: '四宫格多角度',
    hd: '高清重绘',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">保存到素材库</h2>
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
        <div className="p-6 space-y-4">
          {/* Preview */}
          <div className="flex gap-4">
            <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={imageUrl}
                alt="预览图"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">来源类型</p>
              <p className="font-medium text-gray-900">
                {sourceTypeLabels[sourceType] || sourceType}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择分类 <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : isCreatingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入新分类名称..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleCreateCategory}
                  className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.length === 0 ? (
                    <option value="">暂无分类，请创建</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={() => setIsCreatingCategory(true)}
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg whitespace-nowrap"
                >
                  + 新建分类
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              添加标签
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="输入标签后按回车添加..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <svg
                        className="w-3 h-3"
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
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              标签可以帮助您更好地组织和搜索素材
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !categoryId}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存到素材库'}
          </button>
        </div>
      </div>
    </div>
  );
}

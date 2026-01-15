'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types';

export interface CharacterCardProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, file: File) => void;
  onGenerateImage: (id: string) => void;
  isGenerating: boolean;
  isUploading: boolean;
}

export function CharacterCard({
  character,
  onUpdate,
  onDelete,
  onUploadImage,
  onGenerateImage,
  isGenerating,
  isUploading,
}: CharacterCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(character.name);
  const [editDescription, setEditDescription] = useState(character.description);

  const handleSave = () => {
    onUpdate({
      ...character,
      name: editName,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(character.name);
    setEditDescription(character.description);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(character.id, file);
    }
  };

  const isLoading = isGenerating || isUploading;

  return (
    <div className="bg-[#313244] rounded-lg p-4 space-y-3">
      {/* Character Header */}
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-2 py-1 rounded bg-[#45475a] text-[#cdd6f4] text-sm
                       border border-transparent focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            placeholder="角色名称"
            autoFocus
          />
        ) : (
          <h3 className="font-medium text-[#cdd6f4] truncate flex-1">
            {character.name}
          </h3>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded hover:bg-[#45475a] text-[#a6e3a1] transition-colors"
                title="保存"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded hover:bg-[#45475a] text-[#f38ba8] transition-colors"
                title="取消"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded hover:bg-[#45475a] text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
                title="编辑"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(character.id)}
                className="p-1.5 rounded hover:bg-[#45475a] text-[#6c7086] hover:text-[#f38ba8] transition-colors"
                title="删除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Character Description */}
      {isEditing ? (
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-2 py-1 rounded bg-[#45475a] text-[#cdd6f4] text-sm resize-none
                     border border-transparent focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          placeholder="角色描述"
          rows={2}
        />
      ) : (
        <p className="text-sm text-[#a6adc8] line-clamp-2">
          {character.description || '暂无描述'}
        </p>
      )}

      {/* Reference Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-[#45475a]">
        {character.referenceImage ? (
          <Image
            src={character.referenceImage}
            alt={character.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#6c7086]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-white">
                {isGenerating ? '生成中...' : '上传中...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image Actions */}
      <div className="flex gap-2">
        {/* Upload Button */}
        <label className={`
          flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm
          transition-colors cursor-pointer
          ${isLoading
            ? 'bg-[#45475a] text-[#6c7086] cursor-not-allowed'
            : 'bg-[#45475a] text-[#cdd6f4] hover:bg-[#585b70]'
          }
        `}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>上传图片</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>

        {/* AI Generate Button */}
        <button
          onClick={() => onGenerateImage(character.id)}
          disabled={isLoading}
          className={`
            flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm
            transition-colors
            ${isLoading
              ? 'bg-[#45475a] text-[#6c7086] cursor-not-allowed'
              : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>AI 生成</span>
        </button>
      </div>
    </div>
  );
}

export default CharacterCard;

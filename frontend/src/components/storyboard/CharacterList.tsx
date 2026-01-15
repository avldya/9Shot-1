'use client';

import type { Character } from '@/lib/types';
import { CharacterCard } from './CharacterCard';

export interface CharacterListProps {
  characters: Character[];
  onAdd: () => void;
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, file: File) => void;
  onGenerateImage: (id: string) => void;
  generatingIds: Set<string>;
  uploadingIds: Set<string>;
  isAnalyzing?: boolean;
}

export function CharacterList({
  characters,
  onAdd,
  onUpdate,
  onDelete,
  onUploadImage,
  onGenerateImage,
  generatingIds,
  uploadingIds,
  isAnalyzing = false,
}: CharacterListProps) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[#6c7086]">
        <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm">正在识别角色...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Character Cards */}
      {characters.length > 0 ? (
        <div className="space-y-3">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onUploadImage={onUploadImage}
              onGenerateImage={onGenerateImage}
              isGenerating={generatingIds.has(character.id)}
              isUploading={uploadingIds.has(character.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-[#6c7086]">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm">暂无角色</p>
          <p className="text-xs mt-1">点击下方按钮添加角色</p>
        </div>
      )}

      {/* Add Character Button */}
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                   border-2 border-dashed border-[#45475a] text-[#6c7086]
                   hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>添加角色</span>
      </button>
    </div>
  );
}

export default CharacterList;

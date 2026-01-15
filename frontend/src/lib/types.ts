// lib/types.ts - TypeScript 类型定义

export interface Project {
  id: string;
  script: string;
  style: string;
  characters: Character[];
  createdAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  description: string;
  referenceImage?: string;
}

export interface Storyboard {
  id: string;
  projectId: string;
  grid9Image?: string;
  grid9Cells: string[];
  selectedCellIndex?: number;
  grid4Image?: string;
  grid4Cells: AngleCell[];
  selectedAngle?: AngleType;
  hdImage?: string;
}

export interface AngleCell {
  url: string;
  angle: AngleType;
  label: string;
}

export type AngleType = 'wide' | 'medium' | 'close' | 'extreme';

export interface Asset {
  id: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceType: 'grid9' | 'grid4' | 'hd';
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  assetCount?: number;
}

export interface PromptConfig {
  id: string;
  type: 'grid9' | 'grid4' | 'hd';
  template: string;
}

export interface PromptVariables {
  style?: string;
  characters?: string;
  script?: string;
  cellIndex?: number;
  mainCharacter?: string;
}

// Asset list response type
export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  size: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface AnalyzeResponse {
  characters: Array<{
    name: string;
    description: string;
  }>;
}

export interface GenerateImageResponse {
  imageUrl: string;
}

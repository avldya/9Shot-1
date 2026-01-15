// lib/api.ts - API 客户端

import type { 
  ApiResponse, 
  Character, 
  Asset, 
  AssetListResponse,
  Category, 
  PromptConfig,
  AnalyzeResponse,
  GenerateImageResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          code: `HTTP_${response.status}`,
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        },
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络请求失败',
      },
    };
  }
}

// Storyboard APIs
export const storyboardApi = {
  analyze: (script: string, style: string) =>
    fetchApi<AnalyzeResponse>('/storyboard/analyze', {
      method: 'POST',
      body: JSON.stringify({ script, style }),
    }),

  generateGrid9: (params: {
    script: string;
    style: string;
    characters: Array<{ name: string; referenceImage?: string }>;
    promptTemplate?: string;
  }) =>
    fetchApi<GenerateImageResponse>('/storyboard/generate-grid9', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  generateGrid4: (params: {
    sourceImage: string;
    cellIndex: number;
    mainCharacter: string;
    promptTemplate?: string;
  }) =>
    fetchApi<GenerateImageResponse>('/storyboard/generate-grid4', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  hdRedraw: (params: {
    sourceImage: string;
    angle: string;
    promptTemplate?: string;
  }) =>
    fetchApi<GenerateImageResponse>('/storyboard/hd-redraw', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// Character APIs
export const characterApi = {
  list: () => fetchApi<Character[]>('/characters'),
  
  create: (character: Omit<Character, 'id'>) =>
    fetchApi<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(character),
    }),

  update: (id: string, character: Partial<Character>) =>
    fetchApi<Character>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(character),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/characters/${id}`, {
      method: 'DELETE',
    }),

  generateImage: (id: string, params: {
    script: string;
    characterName: string;
    characterDescription: string;
  }) =>
    fetchApi<GenerateImageResponse>(`/characters/${id}/generate-image`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// Asset APIs
export const assetApi = {
  list: (params?: { category?: string; tags?: string[]; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    return fetchApi<AssetListResponse>(`/assets?${searchParams.toString()}`);
  },

  get: (id: string) => fetchApi<Asset>(`/assets/${id}`),

  create: (asset: {
    categoryId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    sourceType?: string;
    metadata?: string;
    tags?: string[];
  }) =>
    fetchApi<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    }),

  update: (id: string, asset: {
    categoryId?: string;
    tags?: string[];
    metadata?: string;
  }) =>
    fetchApi<Asset>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(asset),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/assets/${id}`, {
      method: 'DELETE',
    }),
};

// Category APIs
export const categoryApi = {
  list: () => fetchApi<Category[]>('/categories'),

  get: (id: string) => fetchApi<Category>(`/categories/${id}`),

  create: (category: {
    name: string;
    description?: string;
    sortOrder?: number;
  }) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: (id: string, category: {
    name?: string;
    description?: string;
    sortOrder?: number;
  }) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Prompt Config APIs
export const promptApi = {
  get: () => fetchApi<PromptConfig[]>('/prompts'),

  update: (config: PromptConfig) =>
    fetchApi<PromptConfig>('/prompts', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};

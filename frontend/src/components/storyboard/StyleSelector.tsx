'use client';

import React, { useState } from 'react';

export interface StyleSelectorProps {
  value: string;
  onChange: (style: string) => void;
}

// 预设电影风格选项
const PRESET_STYLES = [
  { value: '', label: '请选择风格...' },
  { value: 'cinematic', label: '电影感 (Cinematic)' },
  { value: 'anime', label: '动漫风格 (Anime)' },
  { value: 'noir', label: '黑色电影 (Film Noir)' },
  { value: 'scifi', label: '科幻风格 (Sci-Fi)' },
  { value: 'fantasy', label: '奇幻风格 (Fantasy)' },
  { value: 'horror', label: '恐怖风格 (Horror)' },
  { value: 'comedy', label: '喜剧风格 (Comedy)' },
  { value: 'documentary', label: '纪录片风格 (Documentary)' },
  { value: 'vintage', label: '复古风格 (Vintage)' },
  { value: 'minimalist', label: '极简风格 (Minimalist)' },
  { value: 'custom', label: '自定义风格...' },
];

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // 判断当前值是否为预设值
  const isPresetValue = PRESET_STYLES.some(
    (style) => style.value === value && style.value !== 'custom' && style.value !== ''
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'custom') {
      setIsCustom(true);
      // 保持当前自定义值或清空
      onChange(customValue);
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  // 确定下拉框显示的值
  const selectValue = isCustom ? 'custom' : (isPresetValue ? value : (value ? 'custom' : ''));

  // 如果有非预设值，自动切换到自定义模式
  React.useEffect(() => {
    if (value && !isPresetValue && !isCustom) {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, [value, isPresetValue, isCustom]);

  return (
    <div className="space-y-3">
      {/* 风格选择下拉框 */}
      <div className="relative">
        <select
          value={selectValue}
          onChange={handleSelectChange}
          className={`
            w-full px-4 py-3 rounded-lg appearance-none cursor-pointer
            bg-[#313244] text-[#cdd6f4]
            border border-transparent
            focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent
            transition-all duration-200
          `}
          aria-label="选择电影风格"
        >
          {PRESET_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        {/* 下拉箭头 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-[#6c7086]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* 自定义风格输入框 */}
      {isCustom && (
        <div className="space-y-2">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="输入自定义风格描述..."
            className={`
              w-full px-4 py-3 rounded-lg
              bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086]
              border border-transparent
              focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent
              transition-all duration-200
            `}
            aria-label="自定义风格输入"
          />
          <p className="text-xs text-[#6c7086]">
            例如：赛博朋克、水墨画风格、像素艺术等
          </p>
        </div>
      )}

      {/* 当前选择显示 */}
      {value && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#6c7086]">当前风格：</span>
          <span className="px-2 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6]">
            {isPresetValue
              ? PRESET_STYLES.find((s) => s.value === value)?.label.split(' (')[0]
              : value}
          </span>
        </div>
      )}
    </div>
  );
}

export default StyleSelector;

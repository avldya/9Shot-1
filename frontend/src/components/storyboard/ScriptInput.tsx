'use client';

import React from 'react';

export interface ScriptInputProps {
  value: string;
  onChange: (script: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
  validationMessage?: string | null;
}

export function ScriptInput({
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
  disabled = false,
  validationMessage,
}: ScriptInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter 触发分析
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !disabled && !isAnalyzing) {
      e.preventDefault();
      onAnalyze();
    }
  };

  const isButtonDisabled = disabled || isAnalyzing;

  return (
    <div className="space-y-3">
      {/* 文本输入框 */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="请输入剧本内容..."
          className={`
            w-full h-40 px-4 py-3 rounded-lg resize-none
            bg-[#313244] text-[#cdd6f4] placeholder-[#6c7086]
            border border-transparent
            focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent
            transition-all duration-200
          `}
          aria-label="剧本输入"
        />
        {/* 字符计数 */}
        <div className="absolute bottom-2 right-2 text-xs text-[#6c7086]">
          {value.length} 字
        </div>
      </div>

      {/* 验证提示信息 */}
      {validationMessage && (
        <p className="text-xs text-[#f38ba8]">
          {validationMessage}
        </p>
      )}

      {/* AI 角色识别按钮 */}
      <button
        onClick={onAnalyze}
        disabled={isButtonDisabled}
        className={`
          w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${isButtonDisabled
            ? 'bg-[#45475a] text-[#6c7086] cursor-not-allowed'
            : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-[0.98]'
          }
        `}
        aria-label="AI 角色识别"
      >
        {isAnalyzing ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>正在分析...</span>
          </>
        ) : (
          <>
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>AI 角色识别</span>
          </>
        )}
      </button>

      {/* 快捷键提示 */}
      <p className="text-xs text-[#6c7086] text-center">
        提示：按 Ctrl + Enter 快速分析
      </p>
    </div>
  );
}

export default ScriptInput;

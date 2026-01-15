'use client';

import { useMemo } from 'react';

export interface ScriptValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  isWhitespaceOnly: boolean;
  errorMessage: string | null;
  canAnalyze: boolean;
}

/**
 * 验证剧本输入的 Hook
 * 
 * 验证规则：
 * - 空字符串：无效
 * - 仅包含空白字符：无效
 * - 包含有效内容：有效
 * 
 * @param script 剧本内容
 * @returns 验证结果
 */
export function useScriptValidation(script: string): ScriptValidationResult {
  return useMemo(() => {
    const isEmpty = script.length === 0;
    const trimmedScript = script.trim();
    const isWhitespaceOnly = !isEmpty && trimmedScript.length === 0;
    const isValid = trimmedScript.length > 0;
    
    let errorMessage: string | null = null;
    
    if (isEmpty) {
      errorMessage = '请输入剧本内容后再进行 AI 角色识别';
    } else if (isWhitespaceOnly) {
      errorMessage = '剧本内容不能仅包含空白字符';
    }
    
    return {
      isValid,
      isEmpty,
      isWhitespaceOnly,
      errorMessage,
      canAnalyze: isValid,
    };
  }, [script]);
}

export default useScriptValidation;

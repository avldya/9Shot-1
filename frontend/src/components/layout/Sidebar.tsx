'use client';

import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ children, isCollapsed = false, onToggle, isMobile = false, onMobileClose }: SidebarProps) {
  // Handle link clicks on mobile to close sidebar
  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-[#1e1e2e] text-[#cdd6f4] transition-all duration-300
        ${isMobile 
          ? 'w-[85vw] max-w-[320px] min-w-[280px]' 
          : isCollapsed 
            ? 'w-0 md:w-16' 
            : 'w-full md:w-80 lg:w-96'
        }
        ${isCollapsed && !isMobile ? 'overflow-hidden' : 'overflow-y-auto'}
      `}
    >
      {/* Sidebar Header */}
      <div className={`
        flex items-center justify-between p-4 border-b border-[#313244]
        ${isMobile ? 'pt-6' : ''}
      `}>
        {(!isCollapsed || isMobile) && (
          <h1 className="text-lg font-semibold text-white truncate">AI 分镜生成器</h1>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-[#313244] transition-colors md:block hidden flex-shrink-0"
            aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Sidebar Content */}
      {(!isCollapsed || isMobile) && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
          {children}
        </div>
      )}

      {/* Sidebar Footer - 素材库入口 */}
      {(!isCollapsed || isMobile) && (
        <div className="p-3 sm:p-4 border-t border-[#313244] flex-shrink-0">
          <a
            href="/assets"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-[#313244] active:bg-[#45475a] transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>素材库</span>
          </a>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;

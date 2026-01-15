'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Workspace } from './Workspace';

interface MainLayoutProps {
  sidebarContent: React.ReactNode;
  workspaceContent: React.ReactNode;
}

// Breakpoint for mobile detection
const MOBILE_BREAKPOINT = 768;

export function MainLayout({ sidebarContent, workspaceContent }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Auto-close mobile menu when switching to desktop
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileMenuOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4 bg-[#1e1e2e] md:hidden safe-area-inset">
        <h1 className="text-base sm:text-lg font-semibold text-white truncate">AI 分镜生成器</h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-[#313244] text-[#cdd6f4] active:bg-[#45475a] transition-colors touch-manipulation"
          aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar - Desktop */}
      <div className="hidden md:block h-full flex-shrink-0">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar}>
          {sidebarContent}
        </Sidebar>
      </div>

      {/* Sidebar - Mobile (Slide-in drawer) */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 z-50 md:hidden 
          transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="侧边栏菜单"
      >
        {/* Mobile sidebar header with close button */}
        <div className="absolute top-0 right-0 p-2 z-10 md:hidden">
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-[#313244] text-[#cdd6f4] active:bg-[#45475a] transition-colors touch-manipulation"
            aria-label="关闭菜单"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Sidebar isMobile={true} onMobileClose={closeMobileMenu}>
          {sidebarContent}
        </Sidebar>
      </div>

      {/* Workspace */}
      <div className="flex-1 pt-14 md:pt-0 h-full overflow-hidden w-full min-w-0">
        <Workspace isMobile={isMobile}>
          {workspaceContent}
        </Workspace>
      </div>
    </div>
  );
}

export default MainLayout;

'use client';

import React from 'react';

interface WorkspaceProps {
  children: React.ReactNode;
  isMobile?: boolean;
}

export function Workspace({ children, isMobile = false }: WorkspaceProps) {
  return (
    <main className="flex-1 h-full overflow-y-auto bg-[#f8fafc] dark:bg-[#18181b] w-full">
      <div className={`
        h-full w-full
        ${isMobile 
          ? 'p-3 sm:p-4' 
          : 'p-4 md:p-6 lg:p-8'
        }
      `}>
        {children}
      </div>
    </main>
  );
}

export default Workspace;

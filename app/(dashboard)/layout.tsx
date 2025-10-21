'use client';

import { SWRConfig } from 'swr';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fallback: {}
      }}
    >
      {children}
    </SWRConfig>
  );
}

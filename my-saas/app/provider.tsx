// // app/providers.tsx
// "use client";

// import { SessionProvider } from "next-auth/react";

// export function Providers({ children }: { children: React.ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider 
      // Re-fetch session every 5 minutes to ensure "isPremium" status 
      // updates automatically if they pay in another tab.
      refetchInterval={5 * 60} 
      // Ensure session is fetched on window focus (good for UX)
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
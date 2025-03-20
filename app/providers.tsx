'use client';

import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';

import { RedirectToSignIn } from '@clerk/nextjs';

import { usePathname } from 'next/navigation';
interface IProps {
  children: React.ReactNode;
}

const Providers: FC<IProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const publicPages = ['/', '/sign-in', '/sign-up'];
  const isPublicPage = publicPages.includes(pathname);
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        {isPublicPage ? (
          children
        ) : (
          <>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
            <SignedIn>{children}</SignedIn>
          </>
        )}
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default Providers;

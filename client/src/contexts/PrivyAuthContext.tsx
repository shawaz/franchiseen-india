"use client";

/**
 * Auth context — wraps Clerk for web.
 * Kept as PrivyAuthContext.tsx for backward compat with existing imports.
 * Mobile uses @clerk/clerk-expo directly.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface UserProfile {
  _id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  clerkUserId?: string;
  walletAddress?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  privyUser: any | null;   // Clerk user — kept as privyUser for backward compat
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  signOut: () => void;
}

const PrivyAuthContext = createContext<AuthContextType | undefined>(undefined);

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut, openSignIn } = useClerk();
  const { userId } = useClerkAuth();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Query Convex user by Clerk user ID (which was saved into privyUserId field)
  const userProfile = useQuery(
    api.userManagement.getUserByPrivyId,
    userId ? { privyUserId: userId } : 'skip'
  );

  const syncUser = useMutation(api.userManagement.syncPrivyUser);

  // Sync Clerk user to Convex on sign-in
  useEffect(() => {
    if (isSignedIn && clerkUser && isClient) {
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
      const fullName =
        clerkUser.fullName ||
        `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
        primaryEmail?.split('@')[0] ||
        'User';

      console.log('[Auth] Syncing Clerk user to Convex:', clerkUser.id);

      syncUser({
        privyUserId: clerkUser.id, // reuses privyUserId field — stores Clerk ID
        email: primaryEmail ?? undefined,
        fullName: fullName ?? undefined,
        avatarUrl: clerkUser.imageUrl ?? undefined,
      }).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, clerkUser?.id, isClient]);

  return (
    <PrivyAuthContext.Provider value={{
      isAuthenticated: !!isSignedIn,
      userProfile: userProfile || null,
      privyUser: clerkUser || null,
      isLoading: !isLoaded || !isClient,
      login: () => openSignIn(),
      logout: () => clerkSignOut(),
      signOut: () => clerkSignOut(),
    }}>
      {children}
    </PrivyAuthContext.Provider>
  );
}

export function usePrivyAuth() {
  const context = useContext(PrivyAuthContext);
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within a PrivyAuthProvider');
  }
  return context;
}

export const useAuth = usePrivyAuth;

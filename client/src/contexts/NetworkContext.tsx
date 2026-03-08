"use client";

/**
 * NetworkContext — stub that always returns mainnet.
 * Solana devnet/mainnet switching has been removed (blockchain removed from project).
 * Kept for backward compatibility with any remaining imports.
 */

import React, { createContext, useContext, ReactNode } from 'react';

export type NetworkType = 'mainnet' | 'devnet';

interface NetworkContextType {
  network: NetworkType;
  switchNetwork: (network: NetworkType) => void;
  isDevnet: boolean;
  isMainnet: boolean;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  return (
    <NetworkContext.Provider
      value={{
        network: 'mainnet',
        switchNetwork: () => {}, // no-op: network switching removed
        isDevnet: false,
        isMainnet: true,
        isLoading: false,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

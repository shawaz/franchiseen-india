import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/PrivyAuthContext';

interface UserWallet {
  publicKey: string;
  inrBalance: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserWallet() {
  const { userProfile, privyUser } = useAuth();
  const [wallet, setWallet] = useState<UserWallet>({
    publicKey: '',
    inrBalance: 0,
    isLoading: true,
    error: null
  });

  // Extract address from wallet sources
  const getWalletAddress = useCallback((): string | undefined => {
    // 1. Convex userProfile (already synced)
    if (userProfile?.walletAddress) {
      console.log('✅ [useUserWallet] Using wallet from Convex userProfile:', userProfile.walletAddress);
      return userProfile.walletAddress;
    }
    // 2. Fallback: direct dummy user object
    if (privyUser?.walletAddress) {
      console.log('✅ [useUserWallet] Using wallet via privyUser.walletAddress:', privyUser.walletAddress);
      return privyUser.walletAddress;
    }

    console.log('🔍 [useUserWallet] No wallet address found in:', {
      userProfileAddress: userProfile?.walletAddress,
      privyUserAddress: privyUser?.walletAddress,
    });
    return undefined;
  }, [userProfile?.walletAddress, privyUser]);

  // Load wallet balances
  const loadWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const address = getWalletAddress();

      if (address) {
        // Mocking an initial INR balance or fetching from local storage for now
        let finalInrBalance = 0;
        try {
          const mockedStr = localStorage.getItem('mocked_inr_balance');
          if (mockedStr) {
            finalInrBalance += parseFloat(mockedStr);
          }
        } catch (e) {
          console.error('Error reading mocked balance', e);
        }

        setWallet({
          publicKey: address,
          inrBalance: finalInrBalance,
          isLoading: false,
          error: null
        });

        localStorage.setItem('userWalletAddress', address);
        localStorage.setItem('userWalletINRBalance', finalInrBalance.toString());

        console.log(`✅ Loaded wallet: ${address} with INR: ${finalInrBalance}`);
      } else {
        setWallet({
          publicKey: '',
          inrBalance: 0,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ [useUserWallet] Error loading wallet:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load wallet'
      }));
    }
  }, [getWalletAddress]);

  // Initialize wallet on mount and when user/wallet changes
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const refreshWallet = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  const addMockedINR = useCallback((amount: number) => {
    try {
      const currentMock = parseFloat(localStorage.getItem('mocked_inr_balance') || '0');
      localStorage.setItem('mocked_inr_balance', (currentMock + amount).toString());
      refreshWallet();
    } catch (e) {
      console.error('Error adding mock balance', e);
    }
  }, [refreshWallet]);

  return {
    wallet,
    refreshWallet,
    addMockedINR,
  };
}

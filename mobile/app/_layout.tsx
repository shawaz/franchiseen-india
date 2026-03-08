import { LikedBrandsProvider } from '@/context/LikedBrandsContext'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <LikedBrandsProvider>
        <Slot />
      </LikedBrandsProvider>
    </ClerkProvider>
  )
}
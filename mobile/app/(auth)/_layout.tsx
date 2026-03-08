import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Redirect href={'/'} />
    </Stack>

  }

  return <Stack />
}
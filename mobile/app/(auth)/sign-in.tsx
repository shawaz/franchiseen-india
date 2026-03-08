import { Fonts } from '@/constants/theme'
import { useOAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const router = useRouter()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const [isLoading, setIsLoading] = React.useState(false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const onPress = React.useCallback(async () => {
    try {
      if (!startOAuthFlow) {
        console.error('OAuth flow not available')
        return
      }
      setIsLoading(true)
      const { createdSessionId, setActive } = await startOAuthFlow()

      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        router.replace('/(home)/(tabs)')
      }
    } catch (err) {
      console.error('OAuth error', err)
    } finally {
      setIsLoading(false)
    }
  }, [startOAuthFlow, router])

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image source={require('@/assets/icons/logo.svg')} style={styles.logo} />
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            Franchiseen
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
            Welcome back. Please sign in to continue.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isDark ? styles.buttonDark : styles.buttonLight,
              isLoading && styles.buttonDisabled
            ]}
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={isDark ? '#000' : '#fff'} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={[styles.buttonText, isDark ? styles.buttonTextDark : styles.buttonTextLight]}>
                  Continue with Google
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
            By continuing, you agree to HubCV's Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#FDFCF6', // Claude-like cream color
  },
  containerDark: {
    backgroundColor: '#1C1A1A', // Claude-like soft dark
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts?.serif || undefined,
    fontSize: 40,
    fontWeight: '400',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Fonts?.sans || undefined,
    fontWeight: '400',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#E8E8E8',
  },
  textMutedLight: {
    color: '#666666',
  },
  textMutedDark: {
    color: '#999999',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  buttonDark: {
    backgroundColor: '#E8E8E8',
    borderColor: '#E8E8E8',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Fonts?.sans || undefined,
  },
  buttonTextLight: {
    color: '#FFFFFF',
  },
  buttonTextDark: {
    color: '#000000',
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
})
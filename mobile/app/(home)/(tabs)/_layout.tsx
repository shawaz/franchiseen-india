import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Compass, Heart, HeartHandshake, PlusCircle, UserCircle } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 6,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass color={color} />,
        }}
      />
      <Tabs.Screen
        name="liked"
        options={{
          title: 'Liked',
          tabBarIcon: ({ color }) => <Heart  color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <PlusCircle  color={color} />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contract',
          tabBarIcon: ({ color }) => <HeartHandshake color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <UserCircle color={color} />,
        }}
      />
    </Tabs>
  );
}

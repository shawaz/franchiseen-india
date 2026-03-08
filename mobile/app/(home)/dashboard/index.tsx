// app/(home)/dashboard/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ArrowRight, Bell, CreditCard, FileText, Lock, LogOut, Shield, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

const menuItems = [
  { id: 'profile', title: 'Edit Profile', icon: <User size={20} color="#333" /> },
  { id: 'invoices', title: 'Invoices', icon: <FileText size={20} color="#333" /> },
  { id: 'billing', title: 'Billing', icon: <CreditCard size={20} color="#333" /> },
  { id: 'earnings', title: 'Earnings', icon: <CreditCard size={20} color="#333" /> },
  { id: 'notifications', title: 'Notifications', icon: <Bell size={20} color="#333" /> },
  { id: 'privacy', title: 'Privacy', icon: <Lock size={20} color="#333" /> },
  { id: 'terms', title: 'Terms of Service', icon: <Shield size={20} color="#333" /> },
  { id: 'signout', title: 'Sign Out', icon: <LogOut size={20} color="#e74c3c" /> },
];

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors] || Colors.light;
  const { signOut } = useAuth();

  const handleMenuItemPress = async (id: string) => {
    if (id === 'signout') {
      // Handle sign out
      try {
        await signOut();
        router.replace('/sign-in');
      } catch (err) {
        console.error('Error signing out:', err);
      }
    } else {
      // Navigate to respective screens
      router.push(`/dashboard/${id}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Menu</ThemedText>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.id)}
          >
            <View style={styles.menuItemLeft}>
              {item.icon}
              <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
            </View>
            <ArrowRight size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
});
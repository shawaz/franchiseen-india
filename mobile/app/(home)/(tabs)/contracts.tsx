// Add at the top of the file
import ContractCard from '@/components/ContractCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dealsData } from '@/data/deals-data';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { FlatList, ImageSourcePropType, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Update the component to use the new data structure and add navigation
interface DealItem {
  id: string;
  image: ImageSourcePropType;
  logo: ImageSourcePropType;
  title: string;
  company: string;
  amount: string;
  duration: string;
  progress: number;
  status?: string; // Allowing any string for flexibility
  appliedDate?: string;
}

const DealsScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.appBar}>
        <ThemedText type="subtitle" style={styles.title}>CONTRACTS</ThemedText>
        <Bell />
      </ThemedView>
      
      <ScrollView style={styles.scrollView}>
        {/* Active Deals */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ACTIVE</ThemedText>
          <FlatList
            data={[
              ...dealsData.review,
              ...dealsData.onboarding,
              ...dealsData.launching,
              ...dealsData.live
            ]}
            renderItem={({ item }: { item: DealItem }) => (
              <TouchableOpacity 
                onPress={() => router.push(`/deal/${item.id}`)}
                activeOpacity={0.8}
              >
                <ContractCard
                  image={item.image}
                  logo={item.logo}
                  title={item.title}
                  subtitle={`Total Investment: ${item.amount}`}
                  duration={item.duration}
                  progress={item.progress}
                  status="accepted"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Applied Deals */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>APPLIED</ThemedText>
          <FlatList
            data={dealsData.applied}
            renderItem={({ item }: { item: DealItem }) => (
              <TouchableOpacity 
                onPress={() => router.push(`/deal/${item.id}`)}
                activeOpacity={0.8}
              >
                <ContractCard
                  image={item.image}
                  logo={item.logo}
                  title={item.title}
                  subtitle={`Total Investment: ${item.amount}`}
                  duration={item.duration}
                  progress={item.progress}
                  status="accepted"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Rejected Deals */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>REJECTED</ThemedText>
          <FlatList
            data={[]} // Add rejected deals if any
            renderItem={({ item }: { item: DealItem }) => (
              <TouchableOpacity 
                onPress={() => router.push(`/deal/${item.id}`)}
                activeOpacity={0.8}
              >
                <ContractCard
                  image={item.image}
                  logo={item.logo}
                  title={item.title}
                  subtitle={`Total Investment: ${item.amount}`}
                  duration={item.duration}
                  progress={item.progress}
                  status="rejected"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>No rejected deals</ThemedText>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default DealsScreen;
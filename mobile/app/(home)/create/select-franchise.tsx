import { ChevronDown, Search, Utensils } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Brand {
  id: string;
  name: string;
  description: string;
  category: string;
  minBudget: string;
  minArea: string;
  logoColor: string;
}

const MOCK_DATA: Brand[] = [
  {
    id: '1',
    name: 'Dietized',
    description: 'n17fndg4tm0swhb0sbng8rq1yx7sb6mm', 
    category: 'Travel Agencies',
    minBudget: '$35,000',
    minArea: '100 sq ft',
    logoColor: '#1A3C34', // Dark Green
  },
  {
    id: '2',
    name: 'Burger King',
    description: 'bk_franchise_global_id_123456', 
    category: 'Food & Beverage',
    minBudget: '$500,000',
    minArea: '1500 sq ft',
    logoColor: '#EE3338', // Red
  },
  {
    id: '3',
    name: 'Anytime Fitness',
    description: 'gym_fitness_24_7_access_global', 
    category: 'Health & Fitness',
    minBudget: '$150,000',
    minArea: '3000 sq ft',
    logoColor: '#623094', // Purple
  },
  {
    id: '4',
    name: 'Subway',
    description: 'eat_fresh_sandwiches_franchise', 
    category: 'Food & Beverage',
    minBudget: '$200,000',
    minArea: '800 sq ft',
    logoColor: '#008C15', // Green
  },
  {
    id: '5',
    name: 'Kumon',
    description: 'math_reading_center_education', 
    category: 'Education',
    minBudget: '$70,000',
    minArea: '1000 sq ft',
    logoColor: '#7ACEF0', // Light Blue
  },
];

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ... (existing imports/interface)

const SelectBrand = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectBrand = (brand: Brand) => {
    router.push({
      pathname: '/(home)/create/investment-details',
      params: { 
        brandName: brand.name,
        brandCategory: brand.category,
        brandDescription: brand.description,
        logoColor: brand.logoColor
      }
    });
  };

  const renderItem = ({ item }: { item: Brand }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => handleSelectBrand(item)}>
      <View style={styles.card}>
        {/* Left: Logo */}
        <View style={[styles.logoContainer, { backgroundColor: item.logoColor }]}>
          <Utensils size={32} color="white" /> 
        </View>

        {/* Middle: Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandName}>{item.name}</Text>
          <Text style={styles.brandDescription} numberOfLines={1} ellipsizeMode="middle">
            {item.description} • {item.category}
          </Text>
        </View>

        {/* Right: Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statLabel}>Min Budget: <Text style={styles.statValue}>{item.minBudget}</Text></Text>
          <Text style={styles.statLabelArea}>Min Area: {item.minArea}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search businesses..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Select Industry</Text>
                <ChevronDown size={16} color="#4B5563" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Select Category</Text>
                <ChevronDown size={16} color="#4B5563" />
            </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
}

export default SelectBrand

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: 'black',
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterText: {
    fontSize: 14,
    color: 'black',
    marginRight: 6,
  },
  listContent: {
      padding: 16,
  },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 2, 
      backgroundColor: 'white',
      // Minimal shadow if needed, but design looked flat/clean
  },
  logoContainer: {
      width: 48,
      height: 48,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  infoContainer: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 8,
  },
  brandName: {
      fontSize: 16,
      fontWeight: '600',
      color: 'black',
      marginBottom: 4,
  },
  brandDescription: {
      fontSize: 12,
      color: '#6B7280',
  },
  statsContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
  },
  statLabel: {
      fontSize: 12,
      color: '#374151',
      fontWeight: '500',
      marginBottom: 2,
  },
  statValue: {
      fontWeight: 'bold',
      color: 'black',
  },
  statLabelArea: {
      fontSize: 10,
      color: '#9CA3AF',
  }
});
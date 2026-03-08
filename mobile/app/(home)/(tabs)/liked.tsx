import LikedCard from '@/components/LikedCard';
import { ThemedText } from '@/components/themed-text';
import { useLikedBrands } from '@/context/LikedBrandsContext';
import { Filter } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LikedScreen = () => {
  const { likedBrands, toggleLike, isLiked } = useLikedBrands();

  if (likedBrands.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>LIKED</ThemedText>
        <Filter />
      </View>
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No liked brands yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>Tap the heart icon to save brands you like</ThemedText>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>LIKED</ThemedText>
        <Filter />
      </View>
      <FlatList
        data={likedBrands}
        keyExtractor={(item) => item.id}
        style={{paddingVertical: 12}}
        renderItem={({ item }) => (
          <LikedCard
          image={item.image}
            logo={item.logo}
            title={item.title}
            subtitle={`${item.earnings} Active • ${item.budget}`}
            category={item.category}
            isLiked={isLiked(item.id)}
            onLikePress={() => toggleLike(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
   flexDirection: "row",
   justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LikedScreen;
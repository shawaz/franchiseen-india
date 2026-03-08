import { useLikedBrands } from '@/context/LikedBrandsContext';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/themed-text';

const FeedCard = ({item}: {item: any}) => {
  const router = useRouter();
  const { toggleLike, isLiked } = useLikedBrands();
  
  const handleLikePress = (e: any) => {
    e.stopPropagation();
    toggleLike(item);
  };
  
  const handlePress = () => {
    router.push({
      pathname: '/(home)/brand/[id]',
      params: { 
        id: item.id,
        title: item.title,
        budget: item.budget,
        earnings: item.earnings,
        category: item.category,
        image: item.image.uri,
        logo: item.logo?.uri || ''
      }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
        <View style={styles.brandCard}>
            <View style={styles.imageContainer}>
              <Image 
                source={item.image} 
                style={styles.brandImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={handleLikePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart 
                  size={24} 
                  fill={isLiked(item.id) ? '#FF3B30' : 'transparent'} 
                  color={isLiked(item.id) ? '#FF3B30' : 'white'} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.brandInfo}>
            <View style={styles.brandContainer}>
                <Image 
                source={item.logo} 
                style={styles.logoImage}
                resizeMode="cover"
                />
                <View>
                <ThemedText type="subtitle" style={styles.brandTitle}>
                    {item.title}
                </ThemedText>
                    <ThemedText style={styles.brandDescription}>
                Active: {item.earnings} • Min Budget: {item.budget}
            </ThemedText>
                </View>
            </View>
            
            </View>
        </View>
    </TouchableOpacity>
  )
}

export default FeedCard

const styles = StyleSheet.create({
    brandCard: {
    width: 320,
    borderRadius: 12,
    borderColor: '#eee',
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  brandImage: {
    width: '100%',
    height: 180,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
 
  brandInfo: {
    padding: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandFinance: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    color: '#666',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  brandDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoImage: {
    width: 45,
    height: 45,
    marginRight: 10,
    borderRadius: 4,
  },
})